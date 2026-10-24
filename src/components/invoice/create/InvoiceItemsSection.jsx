"use client";
import { Calculator, Package, Plus } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, EmptyState, Input, Select } from "@/components/ui";
import { AddedItemsList } from "@dragorbit/features/invoices";
import { useBarcodeScanner } from "@/hooks/barcode/useBarcodeScanner";
import { addProductToInvoiceItems } from "@/utils/invoice/addProductToInvoiceItems";
import { findProductByScanCode, getProductId } from "@/utils/product/findProductByScanCode";
import {
  pickDefaultVariant,
  resolveProductUnitPrice,
  variantOptionLabel,
} from "@/utils/productUtils";

function getActiveVariants(product) {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  return variants.filter((v) => {
    const status = String(v?.status || "ACTIVE").toUpperCase();
    return status === "ACTIVE";
  });
}

function formatVariantOption(variant) {
  if (!variant) return "";
  const label = variantOptionLabel(variant) || "Default";
  const sku = variant.sku ? ` · ${variant.sku}` : "";
  const price = Number(variant.sellingPrice);
  const priceLabel = Number.isFinite(price) ? ` — ₹${price}` : "";
  return `${label}${sku}${priceLabel}`;
}

const InvoiceItemsSection = ({
  t,
  products,
  availableProductIds = new Set(),
  formData,
  setFormData,
  showError,
  lookupProductByCode,
  onProductResolved,
}) => {
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedVariant, setSelectedVariant] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [scanning, setScanning] = useState(false);
  const scanInFlightRef = useRef(false);

  const selectedProductObj = useMemo(
    () => products.find((p) => String(p.id) === String(selectedProduct)) || null,
    [products, selectedProduct]
  );

  const availableVariants = useMemo(
    () => getActiveVariants(selectedProductObj),
    [selectedProductObj]
  );

  const showVariantSelector = availableVariants.length > 1;

  useEffect(() => {
    if (!selectedProduct) {
      setSelectedVariant("");
      return;
    }

    const product =
      products.find((p) => String(p.id) === String(selectedProduct)) || null;
    if (!product) {
      setSelectedVariant("");
      return;
    }

    const variants = getActiveVariants(product);
    if (variants.length === 0) {
      setSelectedVariant(
        product.defaultVariantId ? String(product.defaultVariantId) : ""
      );
      return;
    }

    if (variants.length === 1) {
      const only = variants[0];
      setSelectedVariant(String(only.id ?? only._id ?? ""));
      return;
    }

    const preferred = pickDefaultVariant(variants);
    setSelectedVariant(
      preferred ? String(preferred.id ?? preferred._id ?? "") : ""
    );
  }, [selectedProduct, products]);

  const appendProduct = useCallback(
    (product, quantity = 1, variantId = null) => {
      if (!getProductId(product)) {
        showError(t("invoice.productNotFound"));
        return false;
      }

      const variants = getActiveVariants(product);
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
    setSelectedProduct(value);
    setSelectedVariant("");
  };

  const handleAddItem = () => {
    if (!selectedProduct) {
      showError(t("invoice.pleaseSelectProduct"));
      return;
    }

    const product = products.find((p) => p.id === selectedProduct);
    if (!product) {
      showError(t("invoice.productNotFound"));
      return;
    }

    if (showVariantSelector && !selectedVariant) {
      showError(t("invoice.pleaseSelectVariant") || "Please select a variant");
      return;
    }

    const quantityToAdd = parseInt(selectedQuantity, 10) || 1;
    if (appendProduct(product, quantityToAdd, selectedVariant || null)) {
      setSelectedProduct("");
      setSelectedVariant("");
      setSelectedQuantity(1);
    }
  };

  const handleRemoveItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updatedItems });
  };

  const previewPrice = useMemo(() => {
    if (!selectedProductObj) return null;
    if (selectedVariant) {
      const variant = availableVariants.find(
        (v) => String(v.id ?? v._id) === String(selectedVariant)
      );
      if (variant) {
        return resolveProductUnitPrice({
          ...selectedProductObj,
          sellingPrice: variant.sellingPrice,
          mrp: variant.mrp,
          pricing: {
            ...(selectedProductObj.pricing || {}),
            sellingPrice: variant.sellingPrice,
            mrp: variant.mrp,
          },
        });
      }
    }
    return resolveProductUnitPrice(selectedProductObj);
  }, [selectedProductObj, selectedVariant, availableVariants]);

  return (
    <Card
      padding="none"
      className="!border-[rgb(var(--color-border-primary))]/30 h-full flex flex-col overflow-hidden"
    >
      <div className="p-4 flex flex-col h-full overflow-hidden">
        <div className="mb-4 flex-shrink-0">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className={showVariantSelector ? "md:col-span-4" : "md:col-span-6"}>
              <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">
                {t("invoice.selectProduct")} *
              </label>
              <Select
                size="sm"
                searchable={true}
                value={selectedProduct}
                onChange={handleProductChange}
                options={[
                  {
                    value: "",
                    label: t("invoice.selectProductPlaceholder"),
                  },
                  ...products
                    .filter((product) => {
                      if (!product.id) return false;
                      const isService =
                        String(product.productType || product.type || "").toUpperCase() === "SERVICE";
                      return isService || availableProductIds.has(String(getProductId(product)));
                    })
                    .map((product) => ({
                      value: product.id,
                      label: `${product.name} - ₹${
                        product.pricing?.sellingPrice ||
                        product.sellingPrice ||
                        0
                      }`,
                    })),
                ]}
                leftIcon={Package}
              />
            </div>

            {showVariantSelector ? (
              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">
                  {t("invoice.selectVariant") || "Variant"} *
                </label>
                <Select
                  size="sm"
                  searchable={true}
                  value={selectedVariant}
                  onChange={(value) => setSelectedVariant(value)}
                  options={[
                    {
                      value: "",
                      label:
                        t("invoice.selectVariantPlaceholder") ||
                        "Select variant",
                    },
                    ...availableVariants.map((variant) => ({
                      value: String(variant.id ?? variant._id),
                      label: formatVariantOption(variant),
                    })),
                  ]}
                  leftIcon={Package}
                />
              </div>
            ) : null}

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
                  (showVariantSelector && !selectedVariant)
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
