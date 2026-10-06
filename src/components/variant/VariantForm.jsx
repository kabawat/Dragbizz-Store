"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Barcode,
  Calculator,
  ChevronDown,
  ChevronUp,
  Hash,
  IndianRupee,
  Layers,
  Package,
  Plus,
  Ruler,
  Settings2,
  Trash2,
} from "lucide-react";
import {
  Button,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Select,
  Toggle,
} from "@/components/ui";
import { PRODUCT_STATUS_OPTIONS, UOM_OPTIONS } from "@/data";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/hooks/ui/useTranslation";
import useApiResponse from "@/hooks/useApiResponse";
import { productService } from "@/service";

const DIMENSION_UNITS = [
  { value: "cm", label: "cm" },
  { value: "mm", label: "mm" },
  { value: "in", label: "in" },
  { value: "m", label: "m" },
];

function FormSection({ title, subtitle, icon: Icon, children, action = null }) {
  const { themeConfig, currentVariant } = useTheme();
  const isDark = currentVariant === "dark";

  const glass = isDark
    ? {
        card: "backdrop-blur-[1px] bg-black/20 border border-white/20 shadow-xl",
        header: "border-b border-white/15",
        icon: `bg-[${themeConfig.primary}]/20 border border-[${themeConfig.primary}]/10`,
        title: "text-white",
        description: "text-gray-300",
      }
    : {
        card: "backdrop-blur-[1px] bg-white/20 border border-gray-200/30",
        header: "border-b border-gray-200/20",
        icon: `bg-[${themeConfig.primary}]/20 border border-gray-200/60`,
        title: "text-gray-800",
        description: "text-gray-600",
      };

  return (
    <Card className={`relative break-inside-avoid ${glass.card}`} padding="md">
      <CardHeader className={`${glass.header} !mb-0 !pb-4`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {Icon && (
              <div
                className={`p-2 rounded-lg shrink-0 backdrop-blur-sm ${glass.icon}`}
              >
                <Icon className="w-5 h-5 text-[rgb(var(--color-primary))]" />
              </div>
            )}
            <div className="min-w-0">
              <CardTitle className={`text-lg ${glass.title}`}>{title}</CardTitle>
              {subtitle && (
                <CardDescription className={glass.description}>
                  {subtitle}
                </CardDescription>
              )}
            </div>
          </div>
          {action}
        </div>
      </CardHeader>
      <CardBody className="pt-5 space-y-5">{children}</CardBody>
    </Card>
  );
}

const VariantForm = ({
  formData = {},
  onChange = () => {},
  fieldErrors = {},
  storeId = null,
  readOnly = false,
  lockProduct = false,
  className = "",
}) => {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [showPhysical, setShowPhysical] = useState(() => {
    const d = formData.dimensions || {};
    return Boolean(
      formData.weight || d.length || d.width || d.height
    );
  });
  const { execute: fetchProductsApi, loading: productsLoading } = useApiResponse();

  const fetchProducts = useCallback(async () => {
    if (!storeId || readOnly || lockProduct) return;
    const result = await fetchProductsApi(
      productService.getProducts({
        limit: 100,
        lightweight: true,
        store: storeId,
      }),
      { showToast: false }
    );
    if (result?.success) {
      const list =
        result.data?.products || result.data?.data || result.data || [];
      setProducts(Array.isArray(list) ? list : []);
    }
  }, [storeId, readOnly, lockProduct, fetchProductsApi]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFieldChange = (field, value) => {
    if (readOnly) return;
    onChange(field, value);
  };

  const productOptions = (products || []).map((p) => ({
    value: p.id || p._id,
    label: p.name || p.title || t("common.unknown"),
  }));

  if (lockProduct && formData.productName) {
    const exists = productOptions.some((o) => o.value === formData.product);
    if (!exists && formData.product) {
      productOptions.unshift({
        value: formData.product,
        label: formData.productName,
      });
    }
  }

  const options = Array.isArray(formData.options) ? formData.options : [];

  const addOption = () => {
    handleFieldChange("options", [...options, { name: "", value: "" }]);
  };

  const updateOption = (index, key, value) => {
    const next = options.map((opt, i) =>
      i === index ? { ...opt, [key]: value } : opt
    );
    handleFieldChange("options", next);
  };

  const removeOption = (index) => {
    handleFieldChange(
      "options",
      options.filter((_, i) => i !== index)
    );
  };

  const savings = useMemo(() => {
    const mrp = parseFloat(formData.mrp) || 0;
    const sellingPrice = parseFloat(formData.sellingPrice) || 0;
    if (mrp > sellingPrice) {
      return {
        amount: mrp - sellingPrice,
        percentage: Math.round(((mrp - sellingPrice) / mrp) * 100),
      };
    }
    return { amount: 0, percentage: 0 };
  }, [formData.mrp, formData.sellingPrice]);

  return (
    <div className={`pb-4 ${className}`}>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 xl:gap-6">
        {/* Left column — product + identity */}
        <div className="space-y-5 xl:space-y-6">
          <FormSection
            title={t("products.variantProduct") || "Product"}
            subtitle={
              t("products.variantProductSubtitle") ||
              "Choose the parent product for this SKU"
            }
            icon={Package}
          >
            {readOnly || lockProduct ? (
              <div className="rounded-xl border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-secondary))] px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--color-text-tertiary))] mb-1">
                  {t("products.product") || "Product"}
                </p>
                <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                  {formData.productName || formData.product || "—"}
                </p>
              </div>
            ) : (
              <Select
                label={t("inventory.selectProduct") || "Select product"}
                required
                searchable
                value={formData.product || ""}
                onChange={(value) => handleFieldChange("product", value)}
                options={productOptions}
                placeholder={
                  t("inventory.searchAndSelectProduct") || "Search product"
                }
                error={!!fieldErrors.product}
                errorMessage={fieldErrors.product}
                disabled={productsLoading || readOnly}
                leftIcon={Package}
              />
            )}
          </FormSection>

          <FormSection
            title={t("products.variantIdentity") || "Variant details"}
            subtitle={
              t("products.variantIdentitySubtitle") ||
              "Name, codes and option attributes"
            }
            icon={Layers}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label={t("products.displayName") || "Display name"}
                  placeholder={
                    t("products.enterDisplayName") || "e.g. Red / XL"
                  }
                  value={formData.displayName || ""}
                  onChange={(value) => handleFieldChange("displayName", value)}
                  error={!!fieldErrors.displayName}
                  errorMessage={fieldErrors.displayName}
                  disabled={readOnly}
                />
              </div>
              <Input
                label={t("products.sku") || "SKU"}
                placeholder={t("products.enterSku") || "Auto if empty"}
                value={formData.sku || ""}
                onChange={(value) => handleFieldChange("sku", value)}
                error={!!fieldErrors.sku}
                errorMessage={fieldErrors.sku}
                disabled={readOnly}
                leftIcon={Hash}
              />
              <Input
                label={t("products.barcode") || "Barcode"}
                placeholder={t("products.enterBarcode") || "Barcode"}
                value={formData.barcode || ""}
                onChange={(value) => handleFieldChange("barcode", value)}
                error={!!fieldErrors.barcode}
                errorMessage={fieldErrors.barcode}
                disabled={readOnly}
                leftIcon={Barcode}
              />
            </div>

            <div className="rounded-xl border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-secondary)/0.45)] p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                    {t("products.variantOptions") || "Options"}
                  </p>
                  <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-0.5">
                    {t("products.noVariantOptions") ||
                      "e.g. Color → Red, Size → XL"}
                  </p>
                </div>
                {!readOnly && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    leftIcon={Plus}
                    onClick={addOption}
                  >
                    {t("common.add") || "Add"}
                  </Button>
                )}
              </div>

              {options.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[rgb(var(--color-border-primary))] px-4 py-6 text-center">
                  <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                    {t("products.noVariantOptionsEmpty") ||
                      "No options added yet"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {options.map((opt, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end"
                    >
                      <Input
                        label={
                          index === 0
                            ? t("products.optionName") || "Name"
                            : undefined
                        }
                        placeholder={t("products.optionName") || "Name"}
                        value={opt.name || ""}
                        onChange={(value) =>
                          updateOption(index, "name", value)
                        }
                        disabled={readOnly}
                      />
                      <Input
                        label={
                          index === 0
                            ? t("products.optionValue") || "Value"
                            : undefined
                        }
                        placeholder={t("products.optionValue") || "Value"}
                        value={opt.value || ""}
                        onChange={(value) =>
                          updateOption(index, "value", value)
                        }
                        disabled={readOnly}
                      />
                      {!readOnly && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOption(index)}
                          className="mb-0.5 h-10 w-10 shrink-0 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                          aria-label={t("common.delete") || "Delete"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FormSection>

          <FormSection
            title={t("products.variantFlags") || "Status & visibility"}
            subtitle={
              t("products.variantFlagsSubtitle") ||
              "How this variant appears in catalog"
            }
            icon={Settings2}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label={t("common.status") || "Status"}
                options={PRODUCT_STATUS_OPTIONS}
                value={formData.status || "ACTIVE"}
                onChange={(value) => handleFieldChange("status", value)}
                error={!!fieldErrors.status}
                errorMessage={fieldErrors.status}
                disabled={readOnly}
              />
              <Input
                type="number"
                label={t("products.sortOrder") || "Sort order"}
                value={formData.sortOrder ?? 0}
                onChange={(value) => handleFieldChange("sortOrder", value)}
                error={!!fieldErrors.sortOrder}
                errorMessage={fieldErrors.sortOrder}
                min={0}
                disabled={readOnly}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-secondary)/0.4)] px-4 py-3">
                <Toggle
                  label={t("products.isDefaultVariant") || "Default variant"}
                  helperText={
                    t("products.isDefaultVariantHint") ||
                    "Primary SKU for this product"
                  }
                  checked={formData.isDefault === true}
                  onChange={(checked) =>
                    handleFieldChange("isDefault", checked)
                  }
                  disabled={readOnly}
                />
              </div>
              <div className="rounded-xl border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-secondary)/0.4)] px-4 py-3">
                <Toggle
                  label={t("products.showInCatalog")}
                  helperText={
                    t("products.showInCatalogDescription") ||
                    "Visible on public catalog"
                  }
                  checked={formData.showInCatalog !== false}
                  onChange={(checked) =>
                    handleFieldChange("showInCatalog", checked)
                  }
                  disabled={readOnly}
                />
              </div>
            </div>
          </FormSection>
        </div>

        {/* Right column — pricing + physical */}
        <div className="space-y-5 xl:space-y-6">
          <FormSection
            title={t("products.pricingInformation") || "Pricing"}
            subtitle={
              t("products.pricingInformationSubtitle") ||
              "MRP, selling price and tax details"
            }
            icon={IndianRupee}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="number"
                label={t("products.mrp")}
                placeholder={t("products.enterAmount")}
                value={formData.mrp ?? ""}
                onChange={(value) => handleFieldChange("mrp", value)}
                error={!!fieldErrors.mrp}
                errorMessage={fieldErrors.mrp}
                required
                min={0}
                step={0.01}
                disabled={readOnly}
                leftIcon={() => (
                  <span className="text-[rgb(var(--color-text-tertiary))] font-bold text-md">
                    ₹
                  </span>
                )}
              />
              <Input
                type="number"
                label={t("products.sellingPrice")}
                placeholder={t("products.enterAmount")}
                value={formData.sellingPrice ?? ""}
                onChange={(value) => handleFieldChange("sellingPrice", value)}
                error={!!fieldErrors.sellingPrice}
                errorMessage={fieldErrors.sellingPrice}
                required
                min={0}
                step={0.01}
                disabled={readOnly}
                leftIcon={() => (
                  <span className="text-[rgb(var(--color-text-tertiary))] font-bold text-md">
                    ₹
                  </span>
                )}
              />
              <Input
                type="number"
                label={t("products.discount") || "Discount %"}
                placeholder="0"
                value={formData.discount ?? ""}
                onChange={(value) => handleFieldChange("discount", value)}
                error={!!fieldErrors.discount}
                errorMessage={fieldErrors.discount}
                min={0}
                max={100}
                step={0.01}
                disabled={readOnly}
              />
              <Select
                label={t("products.unitOfMeasure")}
                options={UOM_OPTIONS}
                value={formData.uom || "PCS"}
                onChange={(value) => handleFieldChange("uom", value)}
                error={!!fieldErrors.uom}
                errorMessage={fieldErrors.uom}
                searchable
                disabled={readOnly}
                leftIcon={Package}
              />
              <Input
                label={t("products.hsnCode")}
                placeholder={t("products.enterHsnCode")}
                value={formData.gstInfo?.hsnCode || ""}
                onChange={(value) =>
                  handleFieldChange("gstInfo.hsnCode", value)
                }
                error={!!fieldErrors.hsnCode}
                errorMessage={fieldErrors.hsnCode}
                maxLength={8}
                disabled={readOnly}
                leftIcon={Hash}
              />
            </div>
            <p className="text-xs text-[rgb(var(--color-text-secondary))] -mt-2">
              {t("products.gstRateAuto") ||
                "GST rate is calculated automatically from HSN at runtime"}
            </p>

            <div className="p-4 sm:p-5 rounded-xl border border-[rgb(var(--color-border-primary))] bg-gradient-to-r from-[rgb(var(--color-bg-secondary))] to-[rgb(var(--color-bg-tertiary))]">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-[rgb(var(--color-text-primary))] flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                  {t("products.priceSummary") || "Price summary"}
                </h4>
                <span className="text-[0.65rem] uppercase tracking-wide text-[rgb(var(--color-text-tertiary))] bg-[rgb(var(--color-bg-primary))] px-2 py-1 rounded-full">
                  {t("products.livePreview") || "Live"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))]">
                  <span className="text-[0.6875rem] font-medium text-[rgb(var(--color-text-secondary))] block mb-1">
                    {t("products.mrp")}
                  </span>
                  <span className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                    ₹{(parseFloat(formData.mrp) || 0).toFixed(2)}
                  </span>
                </div>
                <div className="p-3 rounded-lg border border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]">
                  <span className="text-[0.6875rem] font-medium text-white/80 block mb-1">
                    {t("products.sellingPrice")}
                  </span>
                  <span className="text-sm font-bold text-white">
                    ₹{(parseFloat(formData.sellingPrice) || 0).toFixed(2)}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))]">
                  <span className="text-[0.6875rem] font-medium text-[rgb(var(--color-text-secondary))] block mb-1">
                    {t("products.youSave") || "You save"}
                  </span>
                  <span className="text-sm font-semibold text-[rgb(var(--color-primary))]">
                    ₹{savings.amount.toFixed(2)}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))]">
                  <span className="text-[0.6875rem] font-medium text-[rgb(var(--color-text-secondary))] block mb-1">
                    {t("products.discount") || "Discount"}
                  </span>
                  <span className="text-sm font-semibold text-green-600">
                    {savings.percentage}%
                  </span>
                </div>
              </div>
            </div>
          </FormSection>

          <FormSection
            title={t("products.physicalDetails") || "Physical details"}
            subtitle={
              t("products.physicalDetailsSubtitle") ||
              "Optional weight and dimensions"
            }
            icon={Ruler}
            action={
              <button
                type="button"
                onClick={() => setShowPhysical((v) => !v)}
                className="inline-flex items-center gap-1 text-xs font-medium text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-primary))] transition-colors px-2 py-1 rounded-md hover:bg-[rgb(var(--color-bg-secondary))]"
              >
                {showPhysical
                  ? t("common.hide") || "Hide"
                  : t("common.show") || "Show"}
                {showPhysical ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            }
          >
            {showPhysical ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  type="number"
                  label={t("products.weight") || "Weight"}
                  placeholder="0"
                  value={formData.weight ?? ""}
                  onChange={(value) => handleFieldChange("weight", value)}
                  min={0}
                  step={0.01}
                  disabled={readOnly}
                />
                <Select
                  label={t("products.dimensionUnit") || "Unit"}
                  options={DIMENSION_UNITS}
                  value={formData.dimensions?.unit || "cm"}
                  onChange={(value) =>
                    handleFieldChange("dimensions.unit", value)
                  }
                  disabled={readOnly}
                />
                <Input
                  type="number"
                  label={t("products.length") || "Length"}
                  value={formData.dimensions?.length ?? ""}
                  onChange={(value) =>
                    handleFieldChange("dimensions.length", value)
                  }
                  min={0}
                  step={0.01}
                  disabled={readOnly}
                />
                <Input
                  type="number"
                  label={t("products.width") || "Width"}
                  value={formData.dimensions?.width ?? ""}
                  onChange={(value) =>
                    handleFieldChange("dimensions.width", value)
                  }
                  min={0}
                  step={0.01}
                  disabled={readOnly}
                />
                <Input
                  type="number"
                  label={t("products.height") || "Height"}
                  value={formData.dimensions?.height ?? ""}
                  onChange={(value) =>
                    handleFieldChange("dimensions.height", value)
                  }
                  min={0}
                  step={0.01}
                  disabled={readOnly}
                />
              </div>
            ) : (
              <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                {t("products.physicalDetailsCollapsed") ||
                  "Weight and size are optional — expand to fill them in."}
              </p>
            )}
          </FormSection>
        </div>
      </div>
    </div>
  );
};

export default VariantForm;
