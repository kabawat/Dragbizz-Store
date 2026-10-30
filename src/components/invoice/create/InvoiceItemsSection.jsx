"use client";
import { AddedItemsList } from "@dragorbit/features/invoices";
import { IndianRupee, Package, Plus } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, EmptyState, Input, Select } from "@/components/ui";
import { useBarcodeScanner } from "@/hooks/barcode/useBarcodeScanner";
import { variantService } from "@/service/retailer/variant.service";
import { addProductToInvoiceItems } from "@/utils/invoice/addProductToInvoiceItems";
import {
  findProductByScanCode,
  getProductId,
} from "@/utils/product/findProductByScanCode";
import { pickDefaultVariant, variantOptionLabel } from "@/utils/productUtils";

function getInvoiceVariants(product) {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  return variants.filter(
    (variant) => String(variant?.status || "ACTIVE").toUpperCase() !== "DELETED"
  );
}

function formatVariantOption(variant) {
  if (!variant) return "";
  const label = variantOptionLabel(variant) || "Default";
  const sku = variant.sku ? ` · ${variant.sku}` : "";
  const price = Number(variant.sellingPrice);
  const priceLabel = Number.isFinite(price) ? ` — ₹${price}` : "";
  return `${label}${sku}${priceLabel}`;
}

function unwrapVariants(response) {
  const body = response?.data ?? response;
  const data = body?.data ?? body;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.variants)) return data.variants;
  return [];
}

function getVariantPagination(response) {
  const body = response?.data ?? response;
  return (
    body?.meta?.pagination ?? body?.pagination ?? response?.pagination ?? null
  );
}

function getVariantProductId(variant) {
  const product = variant?.product ?? variant?.productId ?? variant?.product_id;
  if (typeof product === "string") return product;
  return product?.id ?? product?._id ?? "";
}

const InvoiceItemsSection = ({
  t,
  products,
  formData,
  setFormData,
  showError,
  lookupProductByCode,
  onProductResolved,
  storeId,
}) => {
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedVariant, setSelectedVariant] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedPrice, setSelectedPrice] = useState("");
  const [scanning, setScanning] = useState(false);
  const [variantRows, setVariantRows] = useState([]);
  const [variantSearch, setVariantSearch] = useState("");
  const [variantsLoading, setVariantsLoading] = useState(false);
  const [variantsLoadingMore, setVariantsLoadingMore] = useState(false);
  const [variantsHasMore, setVariantsHasMore] = useState(false);
  const [selectedVariantData, setSelectedVariantData] = useState(null);
  const scanInFlightRef = useRef(false);
  const variantCursorRef = useRef(null);
  const variantHasMoreRef = useRef(false);
  const variantLoadingRef = useRef(false);
  const variantRequestIdRef = useRef(0);
  const variantSearchRef = useRef("");

  const loadVariantPage = useCallback(
    async ({ search = "", cursor = null, append = false, requestId }) => {
      if (!storeId || (append && variantLoadingRef.current)) return;
      variantLoadingRef.current = true;
      if (append) {
        setVariantsLoadingMore(true);
      } else {
        setVariantsLoading(true);
      }
      try {
        const response = await variantService.getVariants({
          store: storeId,
          limit: 30,
          ...(search ? { search } : {}),
          ...(cursor != null ? { nextCursor: cursor } : {}),
        });
        if (requestId !== variantRequestIdRef.current) return;
        const rows = unwrapVariants(response).filter(
          (variant) =>
            String(variant?.status || "ACTIVE").toUpperCase() !== "DELETED"
        );
        const pagination = getVariantPagination(response);
        const nextCursor = pagination?.hasNextPage
          ? (pagination.nextCursor ?? null)
          : null;
        variantCursorRef.current = nextCursor;
        variantHasMoreRef.current = Boolean(nextCursor);
        setVariantsHasMore(Boolean(nextCursor));
        setVariantRows((current) => {
          const combined = append ? [...current, ...rows] : rows;
          const seen = new Set();
          return combined.filter((variant) => {
            const id = String(variant?.id ?? variant?._id ?? "");
            if (!id || seen.has(id)) return false;
            seen.add(id);
            return true;
          });
        });
      } catch {
        if (requestId === variantRequestIdRef.current) {
          setVariantsHasMore(false);
          variantHasMoreRef.current = false;
        }
      } finally {
        if (requestId === variantRequestIdRef.current) {
          variantLoadingRef.current = false;
          setVariantsLoading(false);
          setVariantsLoadingMore(false);
        }
      }
    },
    [storeId]
  );

  useEffect(() => {
    if (!storeId) return;
    const requestId = ++variantRequestIdRef.current;
    variantSearchRef.current = variantSearch.trim();
    variantCursorRef.current = null;
    variantHasMoreRef.current = false;
    setVariantRows([]);
    setVariantsLoading(true);
    setVariantsHasMore(false);
    const timeout = setTimeout(
      () => {
        loadVariantPage({ search: variantSearchRef.current, requestId });
      },
      variantSearch ? 300 : 0
    );
    return () => clearTimeout(timeout);
  }, [variantSearch, storeId, loadVariantPage]);

  const loadMoreVariants = useCallback(() => {
    const cursor = variantCursorRef.current;
    if (
      !variantHasMoreRef.current ||
      cursor == null ||
      variantLoadingRef.current
    )
      return;
    loadVariantPage({
      search: variantSearchRef.current,
      cursor,
      append: true,
      requestId: variantRequestIdRef.current,
    });
  }, [loadVariantPage]);

  // Constant-time Map lookups for products
  const productsById = useMemo(() => {
    const map = new Map();
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      const id = getProductId(p);
      if (id) map.set(String(id), p);
    }
    return map;
  }, [products]);

  // Constant-time Map lookups for variants
  const variantsById = useMemo(() => {
    const map = new Map();
    for (let i = 0; i < variantRows.length; i++) {
      const v = variantRows[i];
      const id = String(v?.id ?? v?._id ?? "");
      if (id) map.set(id, v);
    }
    return map;
  }, [variantRows]);

  const itemOptions = useMemo(() => {
    const options = variantRows.flatMap((variant) => {
      const productId = getVariantProductId(variant);
      const product = productsById.get(String(productId));
      const variantId = String(variant?.id ?? variant?._id ?? "");
      if (!productId || !variantId) return [];
      const productName = product?.name || variant?.product?.name || "Item";
      return [
        {
          value: `${productId}::${variantId}`,
          label: `${productName} — ${formatVariantOption(variant) || "Default"}`,
        },
      ];
    });
    if (selectedVariantData && selectedProduct) {
      const selectedValue = `${selectedProduct}::${selectedVariant}`;
      if (!options.some((option) => option.value === selectedValue)) {
        const product = productsById.get(String(selectedProduct));
        options.unshift({
          value: selectedValue,
          label: `${product?.name || selectedVariantData?.product?.name || "Item"} — ${formatVariantOption(selectedVariantData) || "Default"}`,
        });
      }
    }
    const serviceOptions = products
      .filter(
        (product) =>
          String(product.productType || product.type || "").toUpperCase() ===
          "SERVICE"
      )
      .map((product) => ({
        value: `${getProductId(product)}::`,
        label: `${product.name} — ${formatVariantOption(product) || "Service"}`,
      }));
    return [{ value: "", label: t("invoice.selectItem") || "Select Item" }, ...options, ...serviceOptions];
  }, [
    variantRows,
    productsById,
    products,
    selectedVariantData,
    selectedProduct,
    selectedVariant,
    t,
  ]);

  const selectedProductObj = useMemo(() => {
    const product = productsById.get(String(selectedProduct));
    if (product) return product;
    if (!selectedProduct || !selectedVariantData) return null;
    const relatedProduct = selectedVariantData.product;
    return {
      id: selectedProduct,
      _id: selectedProduct,
      name:
        typeof relatedProduct === "object"
          ? relatedProduct?.name || "Item"
          : "Item",
      gstInfo: selectedVariantData.gstInfo || {},
      sellingPrice: selectedVariantData.sellingPrice,
      mrp: selectedVariantData.mrp,
    };
  }, [productsById, selectedProduct, selectedVariantData]);

  // O(1) variant lookup
  const selectedVariantObj = useMemo(
    () => variantsById.get(String(selectedVariant)) || selectedVariantData,
    [variantsById, selectedVariant, selectedVariantData]
  );

  const appendProduct = useCallback(
    (product, quantity = 1, variantId = null, customPrice = null) => {
      if (!getProductId(product)) {
        showError(t("invoice.productNotFound"));
        return false;
      }

      const variants = getInvoiceVariants(product);
      const resolvedVariantId =
        variantId ||
        product.matchedVariantId ||
        product.variantId ||
        (variants.length === 1
          ? (variants[0].id ?? variants[0]._id)
          : (pickDefaultVariant(variants)?.id ??
            pickDefaultVariant(variants)?._id)) ||
        product.defaultVariantId ||
        null;

      if (variants.length > 1 && !resolvedVariantId) {
        showError(
          t("invoice.pleaseSelectVariant") || "Please select a variant"
        );
        return false;
      }

      setFormData((prev) => {
        const result = addProductToInvoiceItems(prev.items, product, quantity, {
          variantId: resolvedVariantId,
          price:
            customPrice !== null && customPrice !== "" && !isNaN(customPrice)
              ? Number(customPrice)
              : undefined,
        });
        return result.added ? { ...prev, items: result.items } : prev;
      });
      return true;
    },
    [setFormData, showError, t]
  );

  const resolveAndAddProduct = useCallback(
    async (code) => {
      const trimmed = String(code || "").trim();
      if (!trimmed || scanInFlightRef.current) return;

      scanInFlightRef.current = true;
      setScanning(true);
      try {
        let product = findProductByScanCode(products, trimmed);

        if (!product && lookupProductByCode) {
          product = await lookupProductByCode(trimmed);
        }

        if (!product) {
          showError(t("invoice.barcodeProductNotFound", { code: trimmed }));
          return;
        }

        if (onProductResolved) {
          onProductResolved(product);
        }

        const qty = parseInt(selectedQuantity, 10) || 1;
        if (
          appendProduct(
            product,
            qty,
            product.matchedVariantId || product.variantId || null
          )
        ) {
          setSelectedProduct("");
          setSelectedVariant("");
          setSelectedVariantData(null);
          setSelectedPrice("");
        }
      } finally {
        scanInFlightRef.current = false;
        setScanning(false);
      }
    },
    [
      products,
      lookupProductByCode,
      onProductResolved,
      selectedQuantity,
      appendProduct,
      showError,
      t,
    ]
  );

  useBarcodeScanner({
    onScan: resolveAndAddProduct,
    enabled: !scanning,
  });

  const handleProductChange = useCallback(
    (value) => {
      const [productId, variantId = ""] = String(value || "").split("::");
      setSelectedProduct(productId);
      setSelectedVariant(variantId);
      const variantData = variantsById.get(variantId) || null;
      setSelectedVariantData(variantData);

      if (variantData) {
        const p = variantData.sellingPrice ?? variantData.mrp;
        setSelectedPrice(p !== undefined && p !== null ? String(p) : "");
      } else {
        const prod = productsById.get(String(productId));
        if (prod) {
          const p = prod.sellingPrice ?? prod.mrp;
          setSelectedPrice(p !== undefined && p !== null ? String(p) : "");
        } else {
          setSelectedPrice("");
        }
      }
    },
    [variantsById, productsById]
  );

  const handleAddItem = useCallback(() => {
    if (!selectedProduct) {
      showError(t("invoice.pleaseSelectProduct") || "Please select a product");
      return;
    }

    const product = selectedProductObj;
    if (!product) {
      showError(t("invoice.productNotFound") || "Product not found");
      return;
    }

    const isService =
      String(
        selectedProductObj.productType || selectedProductObj.type || ""
      ).toUpperCase() === "SERVICE";
    if (!selectedVariant && !isService) {
      showError(t("invoice.pleaseSelectVariant") || "Please select a variant");
      return;
    }

    const quantityToAdd = parseInt(selectedQuantity, 10) || 1;
    const priceToAdd =
      selectedPrice !== "" && !isNaN(selectedPrice)
        ? Number(selectedPrice)
        : null;

    const productWithVariant = selectedVariantObj
      ? {
          ...product,
          variants: [...getInvoiceVariants(product), selectedVariantObj],
        }
      : product;

    if (
      appendProduct(
        productWithVariant,
        quantityToAdd,
        selectedVariant || null,
        priceToAdd
      )
    ) {
      setSelectedProduct("");
      setSelectedVariant("");
      setSelectedVariantData(null);
      setSelectedQuantity(1);
      setSelectedPrice("");
    }
  }, [
    selectedProduct,
    selectedProductObj,
    selectedVariant,
    selectedVariantObj,
    selectedQuantity,
    selectedPrice,
    appendProduct,
    showError,
    t,
  ]);

  const handleRemoveItem = useCallback(
    (index) => {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    },
    [setFormData]
  );

  const handleUpdateQuantity = useCallback(
    (index, newQty) => {
      setFormData((prev) => {
        const items = [...prev.items];
        const item = items[index];
        if (!item) return prev;
        const qty =
          newQty === "" ? "" : Math.max(1, parseInt(newQty, 10) || 1);
        const price = Number(item.price) || 0;
        items[index] = {
          ...item,
          quantity: qty,
          total: (typeof qty === "number" ? qty : 0) * price,
        };
        return { ...prev, items };
      });
    },
    [setFormData]
  );

  const handleUpdatePrice = useCallback(
    (index, newPrice) => {
      setFormData((prev) => {
        const items = [...prev.items];
        const item = items[index];
        if (!item) return prev;
        const price =
          newPrice === "" ? "" : Math.max(0, parseFloat(newPrice) || 0);
        const qty = Number(item.quantity) || 1;
        items[index] = {
          ...item,
          price: price,
          total: (typeof price === "number" ? price : 0) * qty,
        };
        return { ...prev, items };
      });
    },
    [setFormData]
  );

  return (
    <Card
      padding="none"
      className="!border-[rgb(var(--color-border-primary))]/30 h-full flex flex-col overflow-hidden w-full max-w-full"
    >
      <div className="p-3 sm:p-4 flex flex-col h-full overflow-hidden w-full max-w-full">
        {/* Item Selection Row */}
        <div className="mb-4 flex-shrink-0 w-full">
          <div className="grid grid-cols-12 gap-3 items-end w-full">
            {/* Product & Variant Select */}
            <div className="col-span-12 lg:col-span-5 min-w-0">
              <span className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">
                {t("invoice.items") || "Items"} *
              </span>
              <Select
                size="sm"
                searchable={true}
                serverSearch={true}
                onSearchChange={setVariantSearch}
                onListEnd={loadMoreVariants}
                loading={variantsLoading}
                loadingMore={variantsLoadingMore}
                hasMore={variantsHasMore}
                value={
                  selectedProduct
                    ? `${selectedProduct}::${selectedVariant}`
                    : ""
                }
                onChange={handleProductChange}
                options={itemOptions}
                leftIcon={Package}
              />
            </div>

            {/* Quantity Input */}
            <div className="col-span-6 sm:col-span-3 lg:col-span-2 min-w-0">
              <span className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">
                {t("invoice.quantity") || "Quantity"} *
              </span>
              <Input
                type="number"
                data-ignore-barcode-scanner="true"
                value={selectedQuantity}
                onChange={(value) => setSelectedQuantity(value)}
                min="1"
                placeholder="1"
                leftIcon={Package}
                size="sm"
              />
            </div>

            {/* Price Input (Editable) */}
            <div className="col-span-6 sm:col-span-3 lg:col-span-2 min-w-0">
              <span className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">
                {t("invoice.price") || "Price"} (₹) *
              </span>
              <Input
                type="number"
                data-ignore-barcode-scanner="true"
                value={selectedPrice}
                onChange={(value) => setSelectedPrice(value)}
                min="0"
                step="0.01"
                placeholder="0.00"
                leftIcon={IndianRupee}
                size="sm"
              />
            </div>

            {/* Add Item Button (Full width in column, no gap) */}
            <div className="col-span-12 sm:col-span-6 lg:col-span-3 min-w-0">
              <Button
                type="button"
                variant="primary"
                onClick={handleAddItem}
                leftIcon={Plus}
                size="sm"
                className="w-full justify-center h-9 font-medium"
                disabled={
                  !selectedProduct ||
                  (!selectedVariant &&
                    String(
                      selectedProductObj?.productType ||
                        selectedProductObj?.type ||
                        ""
                    ).toUpperCase() !== "SERVICE")
                }
              >
                {t("invoice.addItem")}
              </Button>
            </div>
          </div>
        </div>

        {/* Added Items List */}
        {formData.items.length > 0 ? (
          <div className="mt-2 flex-1 flex flex-col min-h-[16rem] lg:min-h-0 w-full max-w-full overflow-hidden">
            <AddedItemsList
              items={formData.items}
              products={products}
              t={t}
              onRemove={handleRemoveItem}
              onUpdateQuantity={handleUpdateQuantity}
              onUpdatePrice={handleUpdatePrice}
            />
          </div>
        ) : (
          <EmptyState
            icon={Package}
            title={t("invoice.noItemsTile")}
            description={t("invoice.noItemsdisc")}
            className="h-full"
            size="md"
          />
        )}
      </div>
    </Card>
  );
};

export default memo(InvoiceItemsSection);
