"use client";
import { Tooltip as SharedTooltip } from "@dragorbit/ui";
import { Package, Plus, Trash2 } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, EmptyState, Input, Select } from "@/components/ui";
import { variantService } from "@/service/retailer/variant.service";

function formatVariantOption(variant) {
  if (!variant) return "";
  const label = variant.displayName || variant.name || "Default";
  const sku = variant.sku ? ` · ${variant.sku}` : "";
  const price = Number(variant.sellingPrice ?? variant.price ?? variant.mrp);
  const priceLabel = Number.isFinite(price) && price > 0 ? ` — ₹${price.toFixed(2)}` : "";
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
  return body?.meta?.pagination ?? body?.pagination ?? response?.pagination ?? null;
}

function getVariantProductId(variant) {
  const product = variant?.product ?? variant?.productId ?? variant?.product_id;
  if (typeof product === "string") return product;
  return product?.id ?? product?._id ?? "";
}

function getVariantProductName(variant) {
  if (typeof variant?.product === "object" && variant?.product?.name) {
    return variant.product.name;
  }
  return variant?.productName || variant?.displayName || variant?.name || "Item";
}

const ItemsSection = ({
  t,
  formData,
  setFormData,
  storeId,
  errors,
  setErrors,
}) => {
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedVariant, setSelectedVariant] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [variantRows, setVariantRows] = useState([]);
  const [variantSearch, setVariantSearch] = useState("");
  const [variantsLoading, setVariantsLoading] = useState(false);
  const [variantsLoadingMore, setVariantsLoadingMore] = useState(false);
  const [variantsHasMore, setVariantsHasMore] = useState(false);
  const [selectedVariantData, setSelectedVariantData] = useState(null);

  const variantCursorRef = useRef(null);
  const variantHasMoreRef = useRef(false);
  const variantLoadingRef = useRef(false);
  const variantRequestIdRef = useRef(0);
  const variantSearchRef = useRef("");

  const loadVariantPage = useCallback(
    async ({ search = "", cursor = null, append = false, requestId }) => {
      if (!storeId || (append && variantLoadingRef.current)) return;
      variantLoadingRef.current = true;
      append ? setVariantsLoadingMore(true) : setVariantsLoading(true);

      try {
        const response = await variantService.getVariants({
          store: storeId,
          limit: 30,
          ...(search ? { search } : {}),
          ...(cursor != null ? { nextCursor: cursor } : {}),
        });

        if (requestId !== variantRequestIdRef.current) return;

        const rows = unwrapVariants(response).filter(
          (variant) => String(variant?.status || "ACTIVE").toUpperCase() !== "DELETED"
        );
        const pagination = getVariantPagination(response);
        const nextCursor = pagination?.hasNextPage ? pagination.nextCursor ?? null : null;

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

    const timeout = setTimeout(() => {
      loadVariantPage({ search: variantSearchRef.current, requestId });
    }, variantSearch ? 300 : 0);

    return () => clearTimeout(timeout);
  }, [variantSearch, storeId, loadVariantPage]);

  const loadMoreVariants = useCallback(() => {
    const cursor = variantCursorRef.current;
    if (!variantHasMoreRef.current || cursor == null || variantLoadingRef.current) return;
    loadVariantPage({
      search: variantSearchRef.current,
      cursor,
      append: true,
      requestId: variantRequestIdRef.current,
    });
  }, [loadVariantPage]);

  // Build select options directly from variants (same like invoices/create)
  const itemOptions = useMemo(() => {
    const options = variantRows.map((variant) => {
      const productId = getVariantProductId(variant);
      const variantId = String(variant?.id ?? variant?._id ?? "");
      const productName = getVariantProductName(variant);
      const varOption = formatVariantOption(variant);

      return {
        value: `${productId}::${variantId}`,
        label: `${productName} — ${varOption}`,
        variant,
      };
    });

    if (selectedVariantData && selectedProduct && selectedVariant) {
      const selectedValue = `${selectedProduct}::${selectedVariant}`;
      if (!options.some((opt) => opt.value === selectedValue)) {
        const prodName = getVariantProductName(selectedVariantData);
        options.unshift({
          value: selectedValue,
          label: `${prodName} — ${formatVariantOption(selectedVariantData)}`,
          variant: selectedVariantData,
        });
      }
    }

    return [
      { value: "", label: t("purchaseOrders.selectItem") || "Select Item / Variant" },
      ...options,
    ];
  }, [variantRows, selectedVariantData, selectedProduct, selectedVariant, t]);

  const handleItemChange = (value) => {
    const [productId, variantId = ""] = String(value || "").split("::");
    setSelectedProduct(productId);
    setSelectedVariant(variantId);
    setSelectedVariantData(
      variantRows.find((v) => String(v?.id ?? v?._id) === variantId) || null
    );
    if (errors?.add_product) {
      setErrors?.((prev) => ({ ...prev, add_product: "" }));
    }
  };

  const previewPrice = useMemo(() => {
    if (!selectedVariantData) return null;
    const price = Number(
      selectedVariantData.sellingPrice ??
      selectedVariantData.price ??
      selectedVariantData.mrp
    );
    return Number.isFinite(price) && price > 0 ? price : null;
  }, [selectedVariantData]);

  const handleAddItem = () => {
    if (!selectedVariant) {
      setErrors?.((prev) => ({
        ...prev,
        add_product: t("purchaseOrders.selectAProduct") || "Please select a variant item",
      }));
      return;
    }

    const qty = parseInt(selectedQuantity, 10);
    if (!selectedQuantity || isNaN(qty) || qty <= 0) {
      setErrors?.((prev) => ({
        ...prev,
        add_quantity: t("purchaseOrders.enterValidInteger") || "Enter valid quantity",
      }));
      return;
    }

    const variant = selectedVariantData;
    const prodName = getVariantProductName(variant);
    const varName = variant?.displayName || variant?.name || "";
    const sku = variant?.sku || "";
    const price = Number(variant?.sellingPrice ?? variant?.price ?? variant?.mrp ?? 0);

    setFormData((prev) => {
      // Check if this variant already exists in added items to prevent duplicate entry error
      const existingIndex = prev.products.findIndex(
        (item) => String(item.variant) === String(selectedVariant)
      );

      if (existingIndex !== -1) {
        const updated = [...prev.products];
        const existing = updated[existingIndex];
        const newQty = (parseInt(existing.quantity, 10) || 0) + qty;
        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
        };
        return { ...prev, products: updated };
      }

      return {
        ...prev,
        products: [
          ...prev.products,
          {
            product: selectedProduct || selectedVariant,
            variant: selectedVariant,
            productName: prodName,
            variantName: varName,
            sku,
            price,
            quantity: qty,
          },
        ],
      };
    });

    setSelectedProduct("");
    setSelectedVariant("");
    setSelectedVariantData(null);
    setSelectedQuantity(1);
    setErrors?.((prev) => ({ ...prev, add_product: "", add_quantity: "" }));
  };

  const handleRemoveItem = (index) => {
    const updated = formData.products.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, products: updated }));
  };

  return (
    <Card className="">
      <div className="p-4">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 border border-[rgb(var(--color-border-primary))] rounded-lg flex items-center justify-center mr-3">
            <Package className="w-5 h-5 text-[rgb(var(--color-success))]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
              {t("purchaseOrders.productsItems") || "Items & Variants"}
            </h3>
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">
              {t("purchaseOrders.addProductsToPO") || "Select variant items to add to this purchase order"}
            </p>
          </div>
        </div>

        {/* Add Item Form (Variant based, identical to Invoice Create) */}
        <div className="bg-[rgb(var(--color-bg-tertiary))]/50 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-4">
            {t("purchaseOrders.addNewItem") || "Add New Item"}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-7">
              <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">
                {t("variants.variant") || "Item / Variant"} *
              </label>
              <Select
                size="sm"
                searchable={true}
                serverSearch={true}
                onSearchChange={setVariantSearch}
                onListEnd={loadMoreVariants}
                loading={variantsLoading}
                loadingMore={variantsLoadingMore}
                hasMore={variantsHasMore}
                value={selectedProduct && selectedVariant ? `${selectedProduct}::${selectedVariant}` : ""}
                onChange={handleItemChange}
                options={itemOptions}
                leftIcon={Package}
                placeholder={t("purchaseOrders.searchSelectProduct") || "Search & select variant..."}
                error={errors?.add_product}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">
                {t("purchaseOrders.quantity") || "Qty"} *
              </label>
              <Input
                type="number"
                value={selectedQuantity}
                onChange={(e) => {
                  const val = typeof e === "object" ? e.target.value : e;
                  setSelectedQuantity(val);
                  if (errors?.add_quantity) {
                    setErrors?.((prev) => ({ ...prev, add_quantity: "" }));
                  }
                }}
                min="1"
                step="1"
                placeholder="1"
                leftIcon={Package}
                size="sm"
                error={errors?.add_quantity}
              />
            </div>

            <div className="md:col-span-3">
              <Button
                type="button"
                variant="primary"
                onClick={handleAddItem}
                leftIcon={Plus}
                disabled={!selectedVariant}
                className="w-full"
              >
                {t("purchaseOrders.addItem") || "Add Item"}
                {previewPrice != null ? ` · ₹${Number(previewPrice).toFixed(0)}` : ""}
              </Button>
            </div>
          </div>
        </div>

        {/* Added Items List */}
        {formData.products.length > 0 ? (
          <div className="bg-[rgb(var(--color-bg-tertiary))]/30 rounded-lg border border-[rgb(var(--color-border-primary))]">
            <div className="px-4 py-3 border-b border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-secondary))]/50">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                  {t("purchaseOrders.addedItems") || "Added Items"} ({formData.products.length})
                </h4>
                <div className="text-xs text-[rgb(var(--color-text-secondary))]">
                  {t("purchaseOrders.totalItems") || "Total Qty"}:{" "}
                  {formData.products.reduce((sum, item) => sum + (parseInt(item.quantity, 10) || 0), 0)}{" "}
                  {t("purchaseOrders.items") || "Units"}
                </div>
              </div>
            </div>

            <div className="divide-y divide-[rgb(var(--color-border-primary))]">
              {formData.products.map((item, index) => (
                <div
                  key={item.variant || item.product || index}
                  className="px-4 py-4 hover:bg-[rgb(var(--color-bg-secondary))]/30 transition-colors duration-200 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-[rgb(var(--color-primary))]/10">
                        <Package className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-[rgb(var(--color-text-primary))] truncate block">
                          {item.productName || "Item"}
                          {item.variantName && item.variantName !== item.productName ? (
                            <span className="ml-2 text-xs font-normal text-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]/10 px-2 py-0.5 rounded-md">
                              {item.variantName}
                            </span>
                          ) : null}
                        </span>
                        {item.sku ? (
                          <span className="text-xs text-[rgb(var(--color-text-tertiary))]">
                            SKU: {item.sku}
                          </span>
                        ) : null}
                      </div>
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))]">
                          {t("purchaseOrders.qty") || "Qty"}: {item.quantity}
                        </span>
                      </div>
                    </div>
                    <SharedTooltip content={t("purchaseOrders.removeItem") || "Remove Item"}>
                      <button
                        aria-label={t("purchaseOrders.removeItem") || "Remove Item"}
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="flex-shrink-0 p-2 cursor-pointer text-[rgb(var(--color-danger))] hover:bg-[rgb(var(--color-danger))]/10 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </SharedTooltip>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Package}
            title={t("purchaseOrders.noItemsTile") || "No items added"}
            description={t("purchaseOrders.noItemsdisc") || "Search and select variant items above to add to this purchase order"}
            className="py-8"
            size="md"
          />
        )}
      </div>
    </Card>
  );
};

export default ItemsSection;
