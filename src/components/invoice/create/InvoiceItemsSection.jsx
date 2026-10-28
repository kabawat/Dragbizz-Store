"use client";
import { Calculator, Package, Plus } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, EmptyState, Input, Select } from "@/components/ui";
import { AddedItemsList } from "@dragorbit/features/invoices";
import { useBarcodeScanner } from "@/hooks/barcode/useBarcodeScanner";
import { addProductToInvoiceItems } from "@/utils/invoice/addProductToInvoiceItems";
import { findProductByScanCode, getProductId } from "@/utils/product/findProductByScanCode";
import { variantService } from "@/service/retailer/variant.service";
import {
  pickDefaultVariant,
  resolveProductUnitPrice,
  variantOptionLabel,
} from "@/utils/productUtils";

function getInvoiceVariants(product) {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  return variants.filter(
    (variant) => String(variant?.status || "ACTIVE").toUpperCase() !== "DELETED",
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
  return body?.meta?.pagination ?? body?.pagination ?? response?.pagination ?? null;
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

  const loadVariantPage = useCallback(async ({ search = "", cursor = null, append = false, requestId }) => {
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
        (variant) => String(variant?.status || "ACTIVE").toUpperCase() !== "DELETED",
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
  }, [storeId]);

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

  const productsById = useMemo(() => {
    const map = new Map();
    products.forEach((product) => {
      const id = getProductId(product);
      if (id) map.set(String(id), product);
    });
    return map;
  }, [products]);

  const itemOptions = useMemo(() => {
    const options = variantRows.flatMap((variant) => {
      const productId = getVariantProductId(variant);
      const product = productsById.get(String(productId));
      const variantId = String(variant?.id ?? variant?._id ?? "");
      if (!productId || !variantId) return [];
      const productName = product?.name || variant?.product?.name || "Item";
      return [{
        value: `${productId}::${variantId}`,
        label: `${productName} — ${formatVariantOption(variant) || "Default"}`,
      }];
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
      .filter((product) => String(product.productType || product.type || "").toUpperCase() === "SERVICE")
      .map((product) => ({
        value: `${getProductId(product)}::`,
        label: `${product.name} — ${formatVariantOption(product) || "Service"}`,
      }));
    return [{ value: "", label: "Select Item" }, ...options, ...serviceOptions];
  }, [variantRows, productsById, products, selectedVariantData, selectedProduct, selectedVariant]);

  const selectedProductObj = useMemo(
    () => {
      const product = productsById.get(String(selectedProduct));
      if (product) return product;
      if (!selectedProduct || !selectedVariantData) return null;
      const relatedProduct = selectedVariantData.product;
      return {
        id: selectedProduct,
        _id: selectedProduct,
        name: typeof relatedProduct === "object" ? relatedProduct?.name || "Item" : "Item",
        gstInfo: selectedVariantData.gstInfo || {},
        sellingPrice: selectedVariantData.sellingPrice,
        mrp: selectedVariantData.mrp,
      };
    },
    [productsById, selectedProduct, selectedVariantData]
  );

  const selectedVariantObj = useMemo(() =>
    variantRows.find((variant) => String(variant?.id ?? variant?._id) === String(selectedVariant)) ||
    selectedVariantData,
  [variantRows, selectedVariant, selectedVariantData]);

  const appendProduct = useCallback(
    (product, quantity = 1, variantId = null) => {
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
          ? variants[0].id ?? variants[0]._id
          : pickDefaultVariant(variants)?.id ??
            pickDefaultVariant(variants)?._id) ||
        product.defaultVariantId ||
        null;

      if (variants.length > 1 && !resolvedVariantId) {
        showError(t("invoice.pleaseSelectVariant") || "Please select a variant");
        return false;
      }

      setFormData((prev) => {
        const result = addProductToInvoiceItems(prev.items, product, quantity, {
          variantId: resolvedVariantId,
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

  const handleProductChange = (value) => {
    const [productId, variantId = ""] = String(value || "").split("::");
    setSelectedProduct(productId);
    setSelectedVariant(variantId);
    setSelectedVariantData(
      variantRows.find((variant) => String(variant?.id ?? variant?._id) === variantId) || null,
    );
  };

  const handleAddItem = () => {
    if (!selectedProduct) {
      showError(t("invoice.pleaseSelectProduct"));
      return;
    }

    // The invoice picker is driven by variants; their populated `product` ID/name
    // is sufficient even when that product is not present in the local cache.
    const product = selectedProductObj;
    if (!product) {
      showError(t("invoice.productNotFound"));
      return;
    }

    const isService = String(selectedProductObj.productType || selectedProductObj.type || "").toUpperCase() === "SERVICE";
    if (!selectedVariant && !isService) {
      showError(t("invoice.pleaseSelectVariant") || "Please select a variant");
      return;
    }

    const quantityToAdd = parseInt(selectedQuantity, 10) || 1;
    const productWithVariant = selectedVariantObj
      ? { ...product, variants: [...getInvoiceVariants(product), selectedVariantObj] }
      : product;
    if (appendProduct(productWithVariant, quantityToAdd, selectedVariant || null)) {
      setSelectedProduct("");
      setSelectedVariant("");
      setSelectedVariantData(null);
      setSelectedQuantity(1);
    }
  };

  const handleRemoveItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updatedItems });
  };

  const previewPrice = useMemo(() => {
    if (!selectedProductObj) return null;
    if (selectedVariantObj) {
      return resolveProductUnitPrice({
        ...selectedProductObj,
        variants: [selectedVariantObj],
        sellingPrice: selectedVariantObj.sellingPrice,
        mrp: selectedVariantObj.mrp,
        pricing: {
          ...(selectedProductObj.pricing || {}),
          sellingPrice: selectedVariantObj.sellingPrice,
          mrp: selectedVariantObj.mrp,
        },
      });
    }
    return resolveProductUnitPrice(selectedProductObj);
  }, [selectedProductObj, selectedVariantObj]);

  return (
    <Card
      padding="none"
      className="!border-[rgb(var(--color-border-primary))]/30 h-full flex flex-col overflow-hidden"
    >
      <div className="p-4 flex flex-col h-full overflow-hidden">
        <div className="mb-4 flex-shrink-0">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-7">
              <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">
                Items *
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
                value={selectedProduct ? `${selectedProduct}::${selectedVariant}` : ""}
                onChange={handleProductChange}
                options={itemOptions}
                leftIcon={Package}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">
                {t("invoice.quantity")} *
              </label>
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

            <div className="md:col-span-3">
              <Button
                type="button"
                variant="primary"
                onClick={handleAddItem}
                leftIcon={Plus}
                disabled={
                  !selectedProduct ||
                  (!selectedVariant && String(selectedProductObj?.productType || selectedProductObj?.type || "").toUpperCase() !== "SERVICE")
                }
              >
                {t("invoice.addItem")}
                {previewPrice != null ? ` · ₹${Number(previewPrice).toFixed(0)}` : ""}
              </Button>
            </div>
          </div>
        </div>

        {formData.items.length > 0 ? (
          <div className="mt-4 flex-1 flex flex-col min-h-[18rem] lg:min-h-0">
            <AddedItemsList items={formData.items} products={products} t={t} onRemove={handleRemoveItem} />

            <div className="flex-shrink-0 mt-4 pt-4 border-t border-[rgb(var(--color-border-primary))]/30 flex justify-end">
              <div className="md:w-72">
                <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1 text-right">
                  {t("invoice.totalDiscount")} (₹)
                  <span className="text-[rgb(var(--color-text-tertiary))] ml-1">
                    ({t("common.optional")})
                  </span>
                </label>
                <Input
                  type="number"
                  value={formData.totalDiscount}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      totalDiscount: value,
                    })
                  }
                  min="0"
                  step="0.01"
                  leftIcon={Calculator}
                  size="sm"
                  placeholder="Enter discount amount"
                />
              </div>
            </div>
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

export default InvoiceItemsSection;
