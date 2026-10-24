import { TableSkeleton } from "@dragorbit/ui";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Search, Grid3X3, List, Package, Loader2 } from "lucide-react";
import { Select, EmptyState } from "@/components/ui";
import ProductCard from "./ProductCard";
import OpenCustomerPaymentButton from "@/components/payment/OpenCustomerPaymentButton";
import { CATEGORIES as MOCK_CATEGORIES } from "@/page/dashboard/pos/data/mockData";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { categoryService, inventoryService } from "@/service/retailer";
import { getProducts } from "@/store/slices/products/productSlice";
import { useApiResponse } from "@/hooks/useApiResponse";
import { expandProductsForPos } from "@/utils/productUtils";
import { useTranslation } from "@/hooks/ui/useTranslation";

const ProductPanel = ({ addToCart, searchRef, cart = [] }) => {
    const dispatch = useAppDispatch();
    const { t } = useTranslation();

    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [viewMode, setViewMode] = useState("grid");
    const [inventoryByProductId, setInventoryByProductId] = useState(new Map());
    const [inventoryByVariantId, setInventoryByVariantId] = useState(new Map());
    const [inventoryByCompositeKey, setInventoryByCompositeKey] = useState(new Map());
    const [inventoryLoading, setInventoryLoading] = useState(true);
    const [inventoryLoadFailed, setInventoryLoadFailed] = useState(false);
    const [inventoryStoreId, setInventoryStoreId] = useState(null);

    const [categories, setCategories] = useState([{ id: "all", name: "All Items" }]);
    const { execute: executeGetCategories } = useApiResponse();
    const { execute: executeGetInventory } = useApiResponse();

    // Select products from redux
    const { products, isLoading, isFetchingMore, pagination } = useAppSelector((state) => state.products);
    const { selectedStore } = useAppSelector((state) => state.profile);

    const storeId = selectedStore?.storeId;

    const loadedStoreIdRef = useRef(null);
    const inventoryRequestRef = useRef(0);

    const sentinelRef = useRef(null);
    const isFetchingMoreRef = useRef(isFetchingMore);
    const storeIdRef = useRef(storeId);
    const paginationRef = useRef(pagination);

    isFetchingMoreRef.current = isFetchingMore;
    storeIdRef.current = storeId;
    paginationRef.current = pagination;

    const fetchCategories = useCallback(async () => {
        if (!storeId) return;
        const result = await executeGetCategories(
            categoryService.getCategories({ store: storeId, limit: 100, lightweight: true }),
            { showToast: false }
        );
        if (result) {
            const data = result.data?.data || result.data || [];
            const list = Array.isArray(data) ? data : [];
            setCategories([
                { id: "all", name: "All Items" },
                ...list.map(c => ({ id: c._id || c.id, name: c.name }))
            ]);
        } else {
            setCategories(MOCK_CATEGORIES);
        }
    }, [storeId, executeGetCategories]);

    const fetchInventory = useCallback(async () => {
        if (!storeId) return;
        const currentRequest = ++inventoryRequestRef.current;
        setInventoryLoading(true);
        setInventoryLoadFailed(false);
        setInventoryStoreId(null);
        const inventoryMap = new Map();
        const variantInventoryMap = new Map();
        const compositeInventoryMap = new Map();
        let nextCursor = null;
        let page = 1;

        try {
            while (true) {
                const result = await executeGetInventory(
                    inventoryService.getInventories({
                        store: storeId,
                        limit: 200,
                        page,
                        ...(nextCursor ? { nextCursor } : {}),
                    }),
                    { showToast: false }
                );
                if (currentRequest !== inventoryRequestRef.current) return;
                if (!result?.success) throw new Error(result?.message || "Inventory unavailable");

                const payload = result.data || {};
                const rows = Array.isArray(payload)
                    ? payload
                    : payload.inventories || payload.data?.inventories || payload.data || [];
                for (const inventory of rows) {
                    const productId = inventory?.product?.id || inventory?.product?._id || inventory?.productId;
                    if (!productId) continue;
                    const variantId = inventory?.variant?.id || inventory?.variant?._id || inventory?.variantId || (typeof inventory?.variant === "string" ? inventory?.variant : null);
                    const available = Number(
                        inventory.availableQuantity ?? inventory.stockSummary?.availableQuantity ?? 0
                    );
                    const validAvailable = Number.isFinite(available) ? Math.max(0, available) : 0;

                    if (variantId) {
                        const vIdStr = String(variantId);
                        variantInventoryMap.set(vIdStr, validAvailable);
                        compositeInventoryMap.set(`${productId}_${vIdStr}`, validAvailable);
                    }
                    inventoryMap.set(String(productId), (inventoryMap.get(String(productId)) || 0) + validAvailable);
                }

                const pagination = payload.pagination || payload.data?.pagination;
                const hasMore = Boolean(pagination?.hasNextPage || pagination?.hasNext);
                if (!hasMore) break;
                nextCursor = pagination?.nextCursor || null;
                if (!nextCursor) page += 1;
            }

            setInventoryByProductId(inventoryMap);
            setInventoryByVariantId(variantInventoryMap);
            setInventoryByCompositeKey(compositeInventoryMap);
            setInventoryStoreId(storeId);
        } catch {
            if (currentRequest !== inventoryRequestRef.current) return;
            setInventoryByProductId(new Map());
            setInventoryByVariantId(new Map());
            setInventoryByCompositeKey(new Map());
            setInventoryLoadFailed(true);
        } finally {
            if (currentRequest === inventoryRequestRef.current) setInventoryLoading(false);
        }
    }, [storeId, executeGetInventory]);

    // Fetch Products + Categories via Redux
    useEffect(() => {
        if (!storeId || loadedStoreIdRef.current === storeId) return;
        loadedStoreIdRef.current = storeId;
        dispatch(getProducts({ store: storeId, limit: 100, isFreshLoad: true }));
        fetchCategories();
        fetchInventory();
    }, [storeId, dispatch, fetchCategories, fetchInventory]);

    // IntersectionObserver for Infinite scroll
    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel || !pagination.hasNextPage) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isFetchingMoreRef.current && storeIdRef.current) {
                    dispatch(
                        getProducts({
                            store: storeIdRef.current,
                            limit: 100,
                            nextCursor: paginationRef.current.nextCursor,
                            isFreshLoad: false,
                        })
                    );
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [dispatch, pagination.hasNextPage]);

    // One POS card per sellable variant (price/SKU live on variants)
    const posItems = useMemo(() => expandProductsForPos(products || []).map((item) => {
        const productId = String(item.productId || item.id || item._id);
        const variantId = item.variantId ? String(item.variantId) : null;
        const isService = String(item.productType || "").toUpperCase() === "SERVICE";

        let availableStock = 0;
        if (variantId && inventoryByVariantId.has(variantId)) {
            availableStock = inventoryByVariantId.get(variantId) || 0;
        } else if (variantId && inventoryByCompositeKey.has(`${productId}_${variantId}`)) {
            availableStock = inventoryByCompositeKey.get(`${productId}_${variantId}`) || 0;
        } else if (!item.hasMultipleVariants && !item.isVariantCard) {
            // Only legacy/simple products without multiple variants fall back to product-level stock
            availableStock = inventoryByProductId.get(productId) || 0;
        } else {
            // Specific variant has 0 stock if no inventory record exists for it
            availableStock = 0;
        }

        return { ...item, availableStock, isService };
    }), [products, inventoryByProductId, inventoryByVariantId, inventoryByCompositeKey]);

    const cartQtyByVariantId = useMemo(() => {
        const map = new Map();
        for (const item of cart || []) {
            const id = String(item.variantId || item.id || item._id || item.productId || "");
            if (!id) continue;
            map.set(id, (map.get(id) || 0) + (item.qty || 0));
        }
        return map;
    }, [cart]);

    const cartQtyByProductId = useMemo(() => {
        const map = new Map();
        for (const item of cart || []) {
            const id = String(item.productId || item.id || item._id || "");
            if (!id) continue;
            map.set(id, (map.get(id) || 0) + (Number(item.qty) || 0));
        }
        return map;
    }, [cart]);

    const filteredProducts = useMemo(() => {
        const q = search.trim().toLowerCase();
        return posItems.filter((p) => {
            if (!p.isService && p.availableStock <= 0) return false;
            const catId = p.category?._id || p.category || "other";
            const matchCat = selectedCategory === "all" || catId === selectedCategory;

            const matchSearch = !q ||
                (p.name && p.name.toLowerCase().includes(q)) ||
                (p.sku && p.sku.toLowerCase().includes(q)) ||
                (p.barcode && String(p.barcode).toLowerCase().includes(q));

            return matchCat && matchSearch;
        });
    }, [search, selectedCategory, posItems]);

    return (
        <div className="flex-1 flex flex-col overflow-hidden p-3 sm:p-4 gap-3 min-h-0 h-full">
            {/* Search + filters + view toggle */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 flex-shrink-0">
                <div className="flex flex-col sm:flex-row gap-3 flex-1 min-w-0 w-full">
                    <div className="relative flex-1 min-w-0 w-full">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-secondary))] pointer-events-none"
                        />
                        <input
                            ref={searchRef}
                            type="text"
                            placeholder="Search product or SKU..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 text-sm bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border-primary))] rounded-lg text-[rgb(var(--color-text-primary))] placeholder-[rgb(var(--color-text-secondary))] focus:outline-none focus:border-[rgb(var(--color-primary))]"
                        />
                    </div>
                    <div className="w-full sm:w-48 md:w-56 flex-shrink-0">
                        <Select
                            value={selectedCategory}
                            onChange={(val) => setSelectedCategory(val)}
                            options={categories.map((c) => ({ label: c.name, value: c.id }))}
                            placeholder="All Categories"
                            searchable
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                    <OpenCustomerPaymentButton size="sm" className="h-9 whitespace-nowrap" />
                    <div className="flex items-center gap-1 bg-[rgb(var(--color-bg-secondary))] rounded-lg p-1">
                    <button
                        type="button"
                        onClick={() => setViewMode("grid")}
                        aria-label="Grid view"
                        className={`p-1.5 rounded-md transition-all cursor-pointer ${viewMode === "grid"
                            ? "bg-[rgb(var(--color-primary))] text-white shadow-sm"
                            : "text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]"
                            }`}
                    >
                        <Grid3X3 size={18} />
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode("list")}
                        aria-label="List view"
                        className={`p-1.5 rounded-md transition-all cursor-pointer ${viewMode === "list"
                            ? "bg-[rgb(var(--color-primary))] text-white shadow-sm"
                            : "text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]"
                            }`}
                    >
                        <List size={18} />
                    </button>
                </div>
                </div>
            </div>

            {/* Products grid/list */}
            <div
                className={`flex-1 overflow-y-auto min-h-0 custom-scrollbar p-1 sm:p-2 ${viewMode === "grid"
                    ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4 auto-rows-[minmax(160px,1fr)] sm:auto-rows-[180px] md:auto-rows-[200px]"
                    : "flex flex-col gap-2 sm:gap-3"
                    }`}
            >
                {inventoryLoadFailed ? (
                    <div className="col-span-full">
                        <EmptyState
                            className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))]"
                            title={t("pos.inventoryUnavailable")}
                            description={t("pos.inventoryUnavailableDescription")}
                            icon={Package}
                        />
                    </div>
                ) : inventoryLoading || inventoryStoreId !== storeId || (isLoading && !products.length) ? (
                    <TableSkeleton className="col-span-full" compact rows={3} />
                ) : filteredProducts.length === 0 ? (
                    <div className="col-span-full">
                        <EmptyState
                            className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))]"
                            title={search ? "No Products Found" : "No Products in this Category"}
                            description={
                                search
                                    ? `We couldn't find any products matching "${search}". Try checking your spelling or use different keywords.`
                                    : "There are no products assigned to this category yet. Select a different category or add new products."
                            }
                            icon={search ? Search : Package}
                        />
                    </div>
                ) : (
                    <>
                        {filteredProducts.map((p) => {
                            const variantId = String(p.variantId || p._id || p.id || "");
                            const productId = String(p.productId || variantId);
                            return (
                                <ProductCard
                                    key={variantId}
                                    product={p}
                                    onAdd={addToCart}
                                    viewMode={viewMode}
                                    selectedQty={cartQtyByVariantId.get(variantId) || 0}
                                    productQty={cartQtyByVariantId.get(variantId) || 0}
                                    availableStock={p.availableStock}
                                    isService={p.isService}
                                />
                            );
                        })}

                        {/* Sentinel — IntersectionObserver triggers load more */}
                        {pagination.hasNextPage && (
                            <div ref={sentinelRef} className="col-span-full h-8 w-full flex items-center justify-center text-[rgb(var(--color-text-secondary))]">
                                {isFetchingMore ? <Loader2 className="w-5 h-5 animate-spin opacity-50" /> : null}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ProductPanel;
