"use client";
import { LoaderCircle, Package } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useApiResponse } from "@/hooks/useApiResponse";
import {
  productService,
  stockService,
  supplierService,
  variantService,
} from "@/service/retailer";
import { useAppSelector } from "@/store/hooks";
import Button from "./Button";
import Input from "./Input";
import Select from "./Select";
import SideDrawer from "./SideDrawer";

const unwrapList = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.variants)) return data.variants;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.result)) return data.result;
  return [];
};

const resolveProductContext = (sourceItem, type) => {
  if (!sourceItem) {
    return {
      productId: "",
      variantId: null,
      name: "Unknown Product",
      variantName: "",
      sku: "-",
      variants: [],
      hasMultipleVariants: false,
      isSpecificVariant: false,
      stock: 0,
      purchasePrice: "",
    };
  }

  const isVariantItem =
    type === "variant" ||
    (!Array.isArray(sourceItem?.variants) &&
      (sourceItem?.product || sourceItem?.productId) &&
      (sourceItem?._id || sourceItem?.id));

  if (isVariantItem) {
    const prodObj =
      typeof sourceItem?.product === "object" && sourceItem?.product !== null
        ? sourceItem.product
        : null;
    const prodId =
      prodObj?.id ||
      prodObj?._id ||
      (typeof sourceItem?.product === "string" ? sourceItem.product : null) ||
      sourceItem?.productId ||
      "";
    const varId = sourceItem?.id || sourceItem?._id;
    const prodName =
      prodObj?.name ||
      sourceItem?.productName ||
      sourceItem?.displayName ||
      "Product Variant";

    const variantRecord = {
      ...sourceItem,
      id: varId,
      _id: varId,
      displayName: sourceItem?.displayName || "",
      sku: sourceItem?.sku || prodObj?.sku || "-",
    };

    return {
      productId: prodId,
      variantId: varId,
      name: prodName,
      variantName: sourceItem?.displayName || "",
      sku: sourceItem?.sku || prodObj?.sku || "-",
      variants: [variantRecord],
      hasMultipleVariants: false,
      isSpecificVariant: true,
      stock:
        sourceItem?.stock?.stock ??
        sourceItem?.stock ??
        sourceItem?.inventory?.availableQuantity ??
        sourceItem?.inventory?.totalQuantity ??
        sourceItem?.stockQuantity ??
        0,
      purchasePrice:
        sourceItem?.stock?.purchasePrice ??
        sourceItem?.purchasePrice ??
        sourceItem?.basePrice ??
        "",
    };
  }

  if (type === "inventory") {
    const product = sourceItem?.product;
    const variant = sourceItem?.variant;
    const variants = Array.isArray(product?.variants) ? product.variants : [];
    const defaultVariant = variants.find((v) => v?.isDefault) || variants[0];
    const hasMultiple = Boolean(
      product?.hasMultipleVariants ??
        sourceItem?.hasMultipleVariants ??
        variants.length > 1
    );

    return {
      productId: product?.id || product?._id || sourceItem?.productId || "",
      variantId:
        variant?.id ||
        variant?._id ||
        sourceItem?.variantId ||
        sourceItem?.defaultVariantId ||
        sourceItem?.default_variant_id ||
        product?.defaultVariantId ||
        defaultVariant?.id ||
        defaultVariant?._id ||
        null,
      name: product?.name || sourceItem?.name || "Unknown Product",
      variantName: variant?.displayName || defaultVariant?.displayName || "",
      sku: variant?.sku || product?.sku || sourceItem?.sku || "-",
      variants,
      hasMultipleVariants: hasMultiple,
      isSpecificVariant: false,
      stock:
        sourceItem?.stockSummary?.totalQuantity ??
        sourceItem?.totalQuantity ??
        sourceItem?.availableQuantity ??
        sourceItem?.stock ??
        product?.stock ??
        0,
      purchasePrice:
        variant?.purchasePrice ??
        variant?.basePrice ??
        sourceItem?.purchasePrice ??
        product?.purchasePrice ??
        "",
    };
  }

  const variants = Array.isArray(sourceItem?.variants)
    ? sourceItem.variants
    : [];
  const defaultVariant = variants.find((v) => v?.isDefault) || variants[0];
  const hasMultiple = Boolean(
    sourceItem?.hasMultipleVariants ??
      (variants.length > 1 ||
        (sourceItem?.variantsCount && sourceItem.variantsCount > 1))
  );

  return {
    productId: sourceItem?.id || sourceItem?._id || sourceItem?.productId || "",
    variantId:
      sourceItem?.variantId ||
      sourceItem?.defaultVariantId ||
      sourceItem?.default_variant_id ||
      sourceItem?.defaultVariant?._id ||
      sourceItem?.defaultVariant?.id ||
      sourceItem?.variant?._id ||
      sourceItem?.variant?.id ||
      defaultVariant?.id ||
      defaultVariant?._id ||
      null,
    name: sourceItem?.name || "Unknown Product",
    variantName: defaultVariant?.displayName || "",
    sku: sourceItem?.sku || defaultVariant?.sku || "-",
    variants,
    hasMultipleVariants: hasMultiple,
    isSpecificVariant: false,
    stock: sourceItem?.stock ?? sourceItem?.totalQuantity ?? 0,
    purchasePrice:
      sourceItem?.purchasePrice ??
      sourceItem?.basePrice ??
      defaultVariant?.stock?.purchasePrice ??
      defaultVariant?.purchasePrice ??
      defaultVariant?.basePrice ??
      "",
  };
};

const formatVariantOptionLabel = (v) => {
  let label = v?.displayName;
  if (!label && Array.isArray(v?.options) && v.options.length > 0) {
    label = v.options
      .map((o) => (o?.name ? `${o.name}: ${o.value}` : o?.value))
      .filter(Boolean)
      .join(" / ");
  }
  if (!label) {
    label = v?.sku || "Variant";
  }
  const parts = [label];
  if (v?.sku && !label.includes(v.sku)) {
    parts.push(`SKU: ${v.sku}`);
  }
  const stockQty =
    v?.stock?.stock ??
    v?.stock ??
    v?.stockQuantity ??
    v?.inventory?.availableQuantity;
  if (stockQty !== undefined && stockQty !== null) {
    parts.push(`Stock: ${stockQty}`);
  }
  if (v?.sellingPrice) {
    parts.push(`₹${v.sellingPrice}`);
  }
  return parts.join(" • ");
};

const StockInDrawer = ({
  isOpen,
  onClose,
  item,
  product,
  onSuccess,
  type = "product",
}) => {
  const { t } = useTranslation();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const { showError } = useGlobalToast();

  const sourceItem = item || product;
  const productContext = useMemo(
    () => resolveProductContext(sourceItem, type),
    [sourceItem, type]
  );

  const [loadedVariants, setLoadedVariants] = useState([]);
  const [resolvedHiddenVariantId, setResolvedHiddenVariantId] = useState(null);
  const [resolvedProductId, setResolvedProductId] = useState(null);
  const [isVariantsLoading, setIsVariantsLoading] = useState(false);

  const [formData, setFormData] = useState({
    variantId: "",
    quantity: "",
    purchasePrice: "",
    supplier: "",
  });
  const [errors, setErrors] = useState({});

  const {
    execute: executeFetchSuppliers,
    data: suppliers,
    loading: suppliersLoading,
  } = useApiResponse();
  const { execute: executeSubmit, loading: isLoading } = useApiResponse();

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const storeId = selectedStore?.storeId;
    const initialVariants = productContext.variants || [];

    setLoadedVariants(initialVariants);
    setResolvedHiddenVariantId(productContext.variantId || null);
    setResolvedProductId(null);

    setFormData({
      variantId: productContext.hasMultipleVariants
        ? ""
        : productContext.variantId || "",
      quantity: "",
      purchasePrice: productContext.purchasePrice
        ? String(productContext.purchasePrice)
        : "",
      supplier: "",
    });
    setErrors({});

    if (!storeId) return;

    // Fetch suppliers
    executeFetchSuppliers(
      supplierService.getSuppliers({
        limit: 100,
        lightweight: true,
        store: storeId,
      }),
      { showToast: false }
    );

    // If specific variant has no productId, fetch it by variant id
    if (
      productContext.isSpecificVariant &&
      !productContext.productId &&
      productContext.variantId
    ) {
      setIsVariantsLoading(true);
      (async () => {
        try {
          const res = await variantService.getVariants({
            store: storeId,
            id: productContext.variantId,
          });
          const raw = res?.data?.data || res?.data;
          const varData = Array.isArray(raw) ? raw[0] : raw;
          const pObj =
            typeof varData?.product === "object" && varData?.product !== null
              ? varData.product
              : null;
          const pId =
            pObj?.id ||
            pObj?._id ||
            (typeof varData?.product === "string" ? varData.product : null) ||
            varData?.productId;
          if (pId && isMounted) {
            setResolvedProductId(pId);
          }
        } catch (e) {
          console.warn("Failed to resolve product ID for variant:", e);
        } finally {
          if (isMounted) {
            setIsVariantsLoading(false);
          }
        }
      })();
      return () => {
        isMounted = false;
      };
    }

    // Fetch variants to ensure we have the exact variant(s)
    const needsFetch =
      !productContext.isSpecificVariant &&
      (initialVariants.length === 0 ||
        productContext.hasMultipleVariants ||
        !productContext.variantId);

    if (needsFetch && productContext.productId) {
      setIsVariantsLoading(true);
      (async () => {
        try {
          let list = [];
          try {
            const res = await variantService.getVariants({
              store: storeId,
              product: productContext.productId,
              productId: productContext.productId,
              limit: 100,
            });
            list = unwrapList(res?.data?.data ?? res?.data);
          } catch (err) {
            console.warn(
              "variantService.getVariants failed, trying fallback:",
              err
            );
          }

          if (list.length === 0) {
            try {
              const pRes = await productService.getProducts({
                store: storeId,
                id: productContext.productId,
              });
              const rawP = pRes?.data?.data || pRes?.data;
              const pData = Array.isArray(rawP) ? rawP[0] : rawP;
              if (Array.isArray(pData?.variants) && pData.variants.length > 0) {
                list = pData.variants;
              } else if (pData?.defaultVariantId) {
                if (isMounted)
                  setResolvedHiddenVariantId(pData.defaultVariantId);
              }
            } catch (err) {
              console.warn("productService fallback failed:", err);
            }
          }

          if (!isMounted) return;

          if (list.length > 0) {
            setLoadedVariants(list);

            const isMulti =
              productContext.hasMultipleVariants ||
              list.length > 1 ||
              (list.length === 1 &&
                list[0]?.isDefault === false &&
                (list[0]?.options?.length > 0 || list[0]?.displayName));

            const def = list.find((v) => v.isDefault) || list[0];
            const defId = def?.id || def?._id || productContext.variantId;

            if (defId) {
              setResolvedHiddenVariantId(defId);
            }

            if (!isMulti && defId) {
              // Single product: auto-select the hidden/default variant ID
              const defaultPurchasePrice =
                def?.stock?.purchasePrice ??
                def?.purchasePrice ??
                def?.basePrice ??
                productContext.purchasePrice ??
                "";

              setFormData((prev) => ({
                ...prev,
                variantId: defId,
                purchasePrice:
                  prev.purchasePrice ||
                  (defaultPurchasePrice ? String(defaultPurchasePrice) : ""),
              }));
            }
          }
        } finally {
          if (isMounted) {
            setIsVariantsLoading(false);
          }
        }
      })();
    }

    return () => {
      isMounted = false;
    };
  }, [
    isOpen,
    selectedStore?.storeId,
    productContext.productId,
    productContext.variantId,
    productContext.hasMultipleVariants,
    productContext.isSpecificVariant,
    productContext.purchasePrice,
    productContext.variants,
    executeFetchSuppliers,
  ]);

  const isMultiVariantProduct = useMemo(() => {
    if (productContext.isSpecificVariant) return false;
    if (productContext.hasMultipleVariants) return true;
    if (loadedVariants.length > 1) return true;
    return false;
  }, [
    productContext.isSpecificVariant,
    productContext.hasMultipleVariants,
    loadedVariants.length,
  ]);

  const effectiveVariantId = useMemo(() => {
    if (isMultiVariantProduct) {
      return formData.variantId || null;
    }
    return (
      formData.variantId ||
      resolvedHiddenVariantId ||
      productContext.variantId ||
      loadedVariants[0]?.id ||
      loadedVariants[0]?._id ||
      productContext.productId ||
      null
    );
  }, [
    isMultiVariantProduct,
    formData.variantId,
    resolvedHiddenVariantId,
    productContext.variantId,
    loadedVariants,
    productContext.productId,
  ]);

  const effectiveProductId = useMemo(() => {
    return resolvedProductId || productContext.productId || "";
  }, [resolvedProductId, productContext.productId]);

  const selectedVariant = useMemo(() => {
    if (!effectiveVariantId) return null;
    return (
      loadedVariants.find(
        (v) => String(v.id || v._id) === String(effectiveVariantId)
      ) || null
    );
  }, [effectiveVariantId, loadedVariants]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (isMultiVariantProduct) {
      if (!formData.variantId) {
        newErrors.variantId = t("variants.selectVariantRequired", {
          defaultValue: "Please select a variant to add stock",
        });
      }
    } else {
      const singleVarId = formData.variantId || effectiveVariantId;
      if (!singleVarId) {
        newErrors.variantId = t("variants.variantNotFound", {
          defaultValue: "Product variant not found. Please try again.",
        });
      }
    }

    if (!formData.quantity || Number(formData.quantity) <= 0) {
      newErrors.quantity = t("inventory.quantityMustBeGreaterThanZero", {
        defaultValue: "Quantity must be greater than 0",
      });
    }

    if (!formData.purchasePrice || Number(formData.purchasePrice) <= 0) {
      newErrors.purchasePrice = t(
        "inventory.purchasePriceMustBeGreaterThanZero",
        {
          defaultValue: "Purchase price must be greater than 0",
        }
      );
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const storeId = selectedStore?.storeId;
    if (!storeId) {
      showError(
        t("common.storeNotSelected", { defaultValue: "Store not selected" })
      );
      return;
    }

    const targetProductId = effectiveProductId;
    if (!targetProductId) {
      showError(
        t("products.productNotFound", { defaultValue: "Product not found" })
      );
      return;
    }

    const targetVariantId = isMultiVariantProduct
      ? formData.variantId
      : formData.variantId || effectiveVariantId;

    if (!targetVariantId) {
      showError(
        t("variants.variantNotFound", {
          defaultValue: "Variant ID not found. Please try again.",
        })
      );
      return;
    }

    const apiPayload = {
      productId: targetProductId,
      variantId: targetVariantId,
      store: storeId,
      batchData: {
        quantity: parseInt(formData.quantity, 10),
        purchasePrice: parseFloat(formData.purchasePrice),
        ...(formData.supplier ? { supplier: formData.supplier } : {}),
      },
    };

    const result = await executeSubmit(stockService.addStock(apiPayload), {
      message: t("products.stockAddedSuccessfully", {
        defaultValue: "Stock added successfully!",
      }),
    });

    if (result?.success) {
      onClose();
      onSuccess?.(
        t("products.stockAddedSuccessfully", {
          defaultValue: "Stock added successfully!",
        })
      );
    }
  };

  const handleSupplierChange = (value) => {
    handleInputChange("supplier", value);
  };

  const formattedSuppliers = (Array.isArray(suppliers) ? suppliers : []).map(
    (supplier) => ({
      value: supplier.id || supplier._id,
      label: supplier.name || supplier.companyName || "Unknown Supplier",
    })
  );

  const displaySku = selectedVariant?.sku || productContext.sku;
  const currentStockDisplay =
    selectedVariant?.stock?.stock ??
    selectedVariant?.stock ??
    selectedVariant?.stockQuantity ??
    selectedVariant?.inventory?.availableQuantity ??
    (isMultiVariantProduct && !formData.variantId
      ? productContext.stock
      : (productContext.stock ?? 0));

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={t("inventory.stockIn", { defaultValue: "Stock In" })}
      description={t("inventory.addStockForProduct", {
        defaultValue: "Add inventory for {{name}}",
        name: productContext.variantName
          ? `${productContext.name} (${productContext.variantName})`
          : productContext.name,
      })}
      icon={Package}
      width="w-full max-w-[42rem]"
      closeOnOutsideClick={false}
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col h-full overflow-hidden"
      >
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header Product / Variant Summary Card */}
          <div className="bg-[rgb(var(--color-bg-secondary))] rounded-lg p-4 border border-[rgb(var(--color-border-primary))]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[rgb(var(--color-primary))]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Package className="w-6 h-6 text-[rgb(var(--color-primary))]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-[rgb(var(--color-text-primary))] truncate">
                  {productContext.name}
                </h3>
                <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                  {selectedVariant?.displayName || productContext.variantName
                    ? `${selectedVariant?.displayName || productContext.variantName} | `
                    : ""}
                  SKU: {displaySku} |{" "}
                  {t("inventory.currentStock", {
                    defaultValue: "Current Stock",
                  })}
                  :{" "}
                  <span className="font-medium text-[rgb(var(--color-text-primary))]">
                    {currentStockDisplay}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Variant Selection for Multi-Variant Products */}
          {isMultiVariantProduct ? (
            <div>
              <Select
                label={`${t("variants.variant", { defaultValue: "Select Variant" })} *`}
                placeholder={t("variants.selectVariant", {
                  defaultValue: "Select variant",
                })}
                value={formData.variantId || ""}
                onChange={(value) => {
                  handleInputChange("variantId", value);
                  const matched = loadedVariants.find(
                    (v) => String(v.id || v._id) === String(value)
                  );
                  if (
                    matched &&
                    (!formData.purchasePrice ||
                      Number(formData.purchasePrice) === 0)
                  ) {
                    const price =
                      matched.purchasePrice ??
                      matched.stock?.purchasePrice ??
                      matched.basePrice;
                    if (price) {
                      handleInputChange("purchasePrice", String(price));
                    }
                  }
                }}
                options={loadedVariants.map((v) => ({
                  value: v.id || v._id,
                  label: formatVariantOptionLabel(v),
                }))}
                error={Boolean(errors.variantId)}
                errorMessage={errors.variantId}
                searchable={loadedVariants.length > 5}
                loading={isVariantsLoading}
                disabled={isVariantsLoading}
                helperText={
                  isVariantsLoading
                    ? t("common.loading", {
                        defaultValue: "Loading variants...",
                      })
                    : undefined
                }
              />
              {errors.variantId && (
                <p className="text-sm text-red-500 mt-1">{errors.variantId}</p>
              )}
            </div>
          ) : isVariantsLoading ? (
            <div className="flex items-center gap-2 text-xs text-[rgb(var(--color-text-secondary))]">
              <LoaderCircle className="w-3.5 h-3.5 animate-spin text-[rgb(var(--color-primary))]" />
              <span>
                {t("variants.resolvingVariant", {
                  defaultValue: "Resolving product details...",
                })}
              </span>
            </div>
          ) : null}

          {/* Quantity & Purchase Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="stock-in-quantity"
                className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2"
              >
                {t("inventory.quantity", { defaultValue: "Quantity" })} *
              </label>
              <Input
                id="stock-in-quantity"
                type="number"
                value={formData.quantity}
                onChange={(value) => handleInputChange("quantity", value)}
                placeholder={t("inventory.enterQuantity", {
                  defaultValue: "Enter quantity",
                })}
                error={errors.quantity}
              />
              {errors.quantity && (
                <p className="text-sm text-red-500 mt-1">{errors.quantity}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="stock-in-purchase-price"
                className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2"
              >
                {t("inventory.purchasePricePerUnit", {
                  defaultValue: "Purchase Price / Unit",
                })}{" "}
                *
              </label>
              <Input
                id="stock-in-purchase-price"
                type="number"
                step="0.01"
                value={formData.purchasePrice}
                onChange={(value) => handleInputChange("purchasePrice", value)}
                placeholder={t("inventory.enterPurchasePricePerUnit", {
                  defaultValue: "Enter purchase price per unit",
                })}
                error={errors.purchasePrice}
              />
              {errors.purchasePrice && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.purchasePrice}
                </p>
              )}
            </div>
          </div>

          {/* Supplier Selection */}
          <div className="relative">
            <Select
              label={t("inventory.supplierOptional", {
                defaultValue: "Supplier (Optional)",
              })}
              placeholder={t("inventory.searchAndSelectSupplierOptional", {
                defaultValue: "Search and select supplier (optional)",
              })}
              value={formData.supplier || ""}
              onChange={handleSupplierChange}
              error={errors.supplier}
              errorMessage={errors.supplier}
              searchable={true}
              options={formattedSuppliers}
              loading={suppliersLoading}
              disabled={suppliersLoading}
              helperText={t("inventory.optionalTypeToSearchSuppliers", {
                defaultValue: "Optional. Select supplier for this stock batch.",
              })}
            />
          </div>

          {/* Summary Card */}
          <div className="bg-[rgb(var(--color-bg-secondary))] rounded-lg p-4 border border-[rgb(var(--color-border-primary))]">
            <h4 className="font-medium text-[rgb(var(--color-text-primary))] mb-3">
              {t("inventory.stockAdditionSummary", {
                defaultValue: "Stock Addition Summary",
              })}
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-text-secondary))]">
                  {t("inventory.quantity", { defaultValue: "Quantity" })}:
                </span>
                <span className="text-[rgb(var(--color-text-primary))] font-medium">
                  {formData.quantity || 0} units
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-text-secondary))]">
                  {t("inventory.purchasePrice", {
                    defaultValue: "Purchase Price",
                  })}
                  :
                </span>
                <span className="text-[rgb(var(--color-text-primary))] font-medium">
                  ₹{formData.purchasePrice || "0.00"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-text-secondary))]">
                  {t("inventory.totalValue", { defaultValue: "Total Value" })}:
                </span>
                <span className="text-[rgb(var(--color-text-primary))] font-medium">
                  ₹
                  {(
                    (parseFloat(formData.quantity) || 0) *
                    (parseFloat(formData.purchasePrice) || 0)
                  ).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-text-secondary))]">
                  {t("inventory.newStock", { defaultValue: "New Stock" })}:
                </span>
                <span className="text-green-500 font-medium">
                  {Number(currentStockDisplay || 0) +
                    (parseInt(formData.quantity, 10) || 0)}{" "}
                  units
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 p-4 border-t border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))]">
          <div className="flex gap-3">
            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
              disabled={isVariantsLoading}
              leftIcon={Package}
            >
              {t("inventory.addStock", { defaultValue: "Add Stock" })}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              {t("common.cancel", { defaultValue: "Cancel" })}
            </Button>
          </div>
        </div>
      </form>
    </SideDrawer>
  );
};

export default StockInDrawer;
