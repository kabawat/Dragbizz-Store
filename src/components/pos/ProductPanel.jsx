import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Search, Grid3X3, List, Package, Loader2 } from "lucide-react";
import { Select, EmptyState } from "@/components/ui";
import ProductCard from "./ProductCard";
import { CATEGORIES as MOCK_CATEGORIES } from "@/page/dashboard/pos/data/mockData";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { categoryService } from "@/service/retailer";
import { getProducts } from "@/store/slices/products/productSlice";
import { useApiResponse } from "@/hooks/useApiResponse";

const ProductPanel = ({ addToCart, searchRef }) => {
    const dispatch = useAppDispatch();

    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [viewMode, setViewMode] = useState("grid");

    const [categories, setCategories] = useState([{ id: "all", name: "All Items" }]);
    const { execute: executeGetCategories } = useApiResponse();

    // Select products from redux
    const { products, isLoading, isFetchingMore, pagination } = useAppSelector((state) => state.products);
    const { selectedStore } = useAppSelector((state) => state.profile);

    const storeId = selectedStore?.storeId;

    const hasFetchedRef = useRef(false);

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

    // Fetch Products + Categories via Redux
    useEffect(() => {
        if (!storeId || hasFetchedRef.current) return;
        hasFetchedRef.current = true;
        dispatch(getProducts({ store: storeId, limit: 100, isFreshLoad: true }));
        fetchCategories();
    }, [storeId, dispatch, fetchCategories]);

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

    const filteredProducts = useMemo(() => {
        return (products || []).filter((p) => {
            const catId = p.category?._id || p.category || "other";
            const matchCat = selectedCategory === "all" || catId === selectedCategory;

            const matchSearch = !search ||
                (p.name && p.name.toLowerCase().includes(search.toLowerCase())) ||
                (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));

            return matchCat && matchSearch;
        });
    }, [search, selectedCategory, products]);

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
                <div className="flex items-center gap-1 bg-[rgb(var(--color-bg-secondary))] rounded-lg p-1 self-end sm:self-auto flex-shrink-0">
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

            {/* Products grid/list */}
            <div
                className={`flex-1 overflow-y-auto min-h-0 custom-scrollbar p-1 sm:p-2 ${viewMode === "grid"
                    ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4 auto-rows-[minmax(160px,1fr)] sm:auto-rows-[180px] md:auto-rows-[200px]"
                    : "flex flex-col gap-2 sm:gap-3"
                    }`}
            >
                {isLoading && !products.length ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 text-[rgb(var(--color-text-secondary))]">
                        <Loader2 className="w-8 h-8 mb-3 animate-spin opacity-50" />
                        <p className="text-sm">Loading products...</p>
                    </div>
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
                        {filteredProducts.map((p) => (
                            <ProductCard key={p._id || p.id} product={p} onAdd={addToCart} viewMode={viewMode} />
                        ))}

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
