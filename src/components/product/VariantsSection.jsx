"use client";

import {
  Barcode,
  Check,
  Copy,
  Hash,
  Image as ImageIcon,
  IndianRupee,
  Layers,
  Loader2,
  Package,
  Plus,
  Sparkles,
  Tag,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { utilityService } from "@/service";
import { getInitialVariantFormData } from "@/utils/variantForm";
import { Button, Input } from "../ui";

export const createEmptyVariant = (index = 0, baseData = {}) => {
  const initial = getInitialVariantFormData(baseData.store || "");
  const baseSku = baseData.sku ? `${baseData.sku}-V${index + 1}` : initial.sku;

  return {
    ...initial,
    id: `var_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    displayName: "",
    images: [],
    sku: baseSku,
    barcode: "",
    options: [],
    mrp: "",
    sellingPrice: "",
    basePrice: "",
    purchasePrice: "",
    stock: "",
    uom: baseData.uom || initial.uom,
    status: baseData.status || initial.status,
    showInCatalog: baseData.showInCatalog ?? initial.showInCatalog,
    gstInfo: {
      ...initial.gstInfo,
      hsnCode: baseData.gstInfo?.hsnCode || initial.gstInfo?.hsnCode || "",
    },
  };
};

export default function VariantsSection({
  variants = [],
  onChange = () => {},
  hasVariants = false,
  onHasVariantsChange = () => {},
  baseFormData = {},
  disabled = false,
}) {
  const { t } = useTranslation();
  const [uploadingVariantIndex, setUploadingVariantIndex] = useState(null);



  const handleUploadVariantImages = async (variantIndex, files) => {
    if (!files || files.length === 0) return;
    setUploadingVariantIndex(variantIndex);

    try {
      const uploadedUrls = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const { publicFileUrl } = await utilityService.uploadFile(
            file,
            "products"
          );
          if (publicFileUrl) {
            uploadedUrls.push(publicFileUrl);
          }
        } catch (err) {
          console.error("Variant image upload failed:", err);
        }
      }

      if (uploadedUrls.length > 0) {
        const updated = [...variants];
        const existingImages = Array.isArray(updated[variantIndex]?.images)
          ? updated[variantIndex].images
          : [];
        updated[variantIndex] = {
          ...updated[variantIndex],
          images: [...existingImages, ...uploadedUrls],
        };
        onChange(updated);
      }
    } finally {
      setUploadingVariantIndex(null);
    }
  };

  const handleRemoveVariantImage = (variantIndex, imageIndex) => {
    const updated = [...variants];
    const existingImages = Array.isArray(updated[variantIndex]?.images)
      ? [...updated[variantIndex].images]
      : [];
    existingImages.splice(imageIndex, 1);
    updated[variantIndex] = {
      ...updated[variantIndex],
      images: existingImages,
    };
    onChange(updated);
  };

  const handleAddAnotherVariant = useCallback(() => {
    const nextIndex = variants.length + 1;
    const newVariant = createEmptyVariant(nextIndex, baseFormData);
    onChange([...variants, newVariant]);
  }, [variants, baseFormData, onChange]);

  const handleDuplicateVariant = (indexToDuplicate) => {
    const source = variants[indexToDuplicate];
    if (!source) return;

    const duplicated = {
      ...source,
      id: `var_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      displayName: source.displayName ? `${source.displayName} (Copy)` : "",
      images: [...(source.images || [])],
      sku: source.sku ? `${source.sku}-COPY` : "",
      barcode: "",
      isDefault: false,
      options: (source.options || []).map((opt) => ({
        ...opt,
        id: `opt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      })),
    };

    const nextVariants = [...variants];
    nextVariants.splice(indexToDuplicate + 1, 0, duplicated);
    onChange(nextVariants);
  };

  const handleRemoveVariant = (indexToRemove) => {
    const filtered = variants.filter((_, idx) => idx !== indexToRemove);
    onChange(filtered);
  };

  const handleVariantFieldChange = (index, field, value) => {
    const updated = [...variants];
    if (typeof field === "object" && field !== null) {
      updated[index] = {
        ...updated[index],
        ...field,
      };
    } else {
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
    }
    onChange(updated);
  };

  const handleOptionChange = (variantIndex, optionIndex, key, val) => {
    const updated = [...variants];
    const currentOptions = [...(updated[variantIndex].options || [])];
    currentOptions[optionIndex] = {
      ...currentOptions[optionIndex],
      [key]: val,
    };
    updated[variantIndex] = {
      ...updated[variantIndex],
      options: currentOptions,
    };

    const autoDisplayName = currentOptions
      .map((o) => o.value?.trim())
      .filter(Boolean)
      .join(" / ");
    if (
      autoDisplayName &&
      (!updated[variantIndex].displayName || updated[variantIndex]._autoNamed)
    ) {
      updated[variantIndex].displayName = autoDisplayName;
      updated[variantIndex]._autoNamed = true;
    }

    onChange(updated);
  };

  const handleAddOption = (variantIndex) => {
    const updated = [...variants];
    const currentOptions = [...(updated[variantIndex].options || [])];
    currentOptions.push({
      id: `opt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: "",
      value: "",
    });
    updated[variantIndex] = {
      ...updated[variantIndex],
      options: currentOptions,
    };
    onChange(updated);
  };

  const handleRemoveOption = (variantIndex, optionIndex) => {
    const updated = [...variants];
    const currentOptions = (updated[variantIndex].options || []).filter(
      (_, idx) => idx !== optionIndex
    );
    updated[variantIndex] = {
      ...updated[variantIndex],
      options: currentOptions,
    };
    onChange(updated);
  };

  const handleAutoGenerateSku = (variantIndex) => {
    const variant = variants[variantIndex];
    if (!variant) return;

    const rawPrefix = baseFormData.sku || baseFormData.name || "";
    const basePrefix = rawPrefix
      .trim()
      .substring(0, 6)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");

    const optionParts = (variant.options || [])
      .map((o) =>
        (o.value || "")
          .trim()
          .substring(0, 4)
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, "")
      )
      .filter(Boolean)
      .join("-");

    const suffix = String(variantIndex + 1).padStart(2, "0");
    const generatedSku = [basePrefix, optionParts, suffix]
      .filter(Boolean)
      .join("-");

    handleVariantFieldChange(variantIndex, "sku", generatedSku);
  };

  if (!hasVariants) {
    return null;
  }

  if (variants.length === 0) {
    return (
      <div className="w-full">
        <button
          type="button"
          onClick={handleAddAnotherVariant}
          disabled={disabled}
          className="w-full py-5 px-6 rounded-2xl border-2 border-dashed border-blue-500/40 hover:border-blue-500 bg-slate-900/40 hover:bg-blue-500/10 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-3.5 text-blue-500 font-semibold group cursor-pointer shadow-sm hover:shadow-md"
        >
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center group-hover:scale-110 shadow-sm transition-transform shrink-0">
            <Plus className="w-5 h-5" />
          </div>
          <div className="text-left">
            <span className="block text-sm sm:text-base font-bold text-[rgb(var(--color-text-primary))]">
              + {t("products.addAnotherVariant", "Add Another Variant")}
            </span>
            <span className="block text-xs text-[rgb(var(--color-text-secondary))] font-normal">
              {t(
                "products.addAnotherVariantSubtitle",
                "Add Another Variant Subtitle"
              )}
            </span>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))] shadow-sm overflow-hidden transition-all duration-200">
      {/* Section Header */}
      <div className="p-5 sm:p-6 border-b border-[rgb(var(--color-border-primary))] bg-gradient-to-r from-[rgb(var(--color-bg-secondary))] via-[rgb(var(--color-bg-primary))] to-[rgb(var(--color-bg-secondary))] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[rgb(var(--color-primary)/0.12)] border border-[rgb(var(--color-primary)/0.25)] flex items-center justify-center text-[rgb(var(--color-primary))] shadow-sm shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-[rgb(var(--color-text-primary))]">
                {t("products.variants", "Product Variants")}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[rgb(var(--color-primary)/0.1)] text-[rgb(var(--color-primary))] border border-[rgb(var(--color-primary)/0.2)]">
                +{variants.length}{" "}
                {variants.length === 1
                  ? t("products.additionalVariant", "Additional Variant")
                  : t("products.additionalVariants", "Additional Variants")}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[rgb(var(--color-text-secondary))] mt-0.5">
              {t(
                "products.variantsDescription",
                "Add options like size, color, or capacity. You can create variants one by one."
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 sm:p-6 space-y-6">
        <div className="rounded-xl border border-[rgb(var(--color-primary)/0.2)] bg-[rgb(var(--color-primary)/0.03)] p-4 flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-[rgb(var(--color-primary))] shrink-0" />
          <p className="text-xs sm:text-sm text-[rgb(var(--color-text-secondary))]">
            {t(
              "products.variantsActiveInfo",
              "Variant mode is active. Customize each variant below with its own display name, specific images, attributes (Size, Color), price, and stock. If variant images or name are left empty, product defaults will be used."
            )}
          </p>
        </div>

        {/* Active Variants List */}
        <div className="space-y-6">
          {variants.map((variant, index) => {
            const mrpNum = parseFloat(variant.mrp) || 0;
            const spNum = parseFloat(variant.sellingPrice) || 0;
            const hasDiscount = mrpNum > spNum && spNum > 0;
            const discountPercent = hasDiscount
              ? Math.round(((mrpNum - spNum) / mrpNum) * 100)
              : 0;
            const isInvalidPricing = spNum > mrpNum && mrpNum > 0;
            const variantKey = variant.id || `variant-${index}`;

            return (
              <div
                key={variantKey}
                className="relative rounded-xl border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-secondary)/0.2)] hover:border-[rgb(var(--color-primary)/0.4)] transition-all duration-200 p-5 sm:p-6"
              >
                {/* Variant Card Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-[rgb(var(--color-border-primary))]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] text-xs font-bold text-[rgb(var(--color-text-primary))] flex items-center justify-center shadow-xs">
                      #{index + 2}
                    </span>
                    <span className="text-sm font-bold text-[rgb(var(--color-text-primary))]">
                      {variant.displayName?.trim() ||
                        `${t("products.variant", "Variant")} ${index + 2}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 ml-auto">
                    <button
                      type="button"
                      onClick={() => handleDuplicateVariant(index)}
                      title={t(
                        "products.duplicateVariant",
                        "Duplicate Variant"
                      )}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border-primary))] transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">
                        {t("common.duplicate", "Duplicate")}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(index)}
                      title={t("products.removeVariant", "Remove Variant")}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-500/10 border border-rose-200 dark:border-rose-900/50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">
                        {t("common.delete", "Delete")}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Attributes / Options Section */}
                <div className="mb-5 p-4 rounded-xl bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))]">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--color-text-secondary))]">
                        {t(
                          "products.attributesAndOptions",
                          "Variant Attributes (Options)"
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {(variant.options || []).length === 0 ? (
                      <p className="text-xs text-[rgb(var(--color-text-tertiary))] py-1">
                        {t(
                          "products.noAttributesAdded",
                          "No attributes added yet. Click below to add an option (e.g., Size, Color)."
                        )}
                      </p>
                    ) : (
                      (variant.options || []).map((opt, optIdx) => {
                        const optKey = opt.id || `${variantKey}-opt-${optIdx}`;
                        return (
                          <div key={optKey} className="flex items-center gap-2">
                            <div className="w-1/3 min-w-[120px]">
                              <Input
                                placeholder={t(
                                  "products.attributeName",
                                  "Option Name"
                                )}
                                value={opt.name || ""}
                                onChange={(val) =>
                                  handleOptionChange(index, optIdx, "name", val)
                                }
                                className="text-xs sm:text-sm"
                              />
                            </div>
                            <span className="text-[rgb(var(--color-text-tertiary))] font-bold">
                              :
                            </span>
                            <div className="flex-1">
                              <Input
                                placeholder={t(
                                  "products.attributeValue",
                                  "Option Value"
                                )}
                                value={opt.value || ""}
                                onChange={(val) =>
                                  handleOptionChange(
                                    index,
                                    optIdx,
                                    "value",
                                    val
                                  )
                                }
                                className="text-xs sm:text-sm"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(index, optIdx)}
                              className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                              title="Remove option"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })
                    )}

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddOption(index)}
                      leftIcon={Plus}
                      className="text-xs text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary)/0.08)] mt-1"
                    >
                      {t("products.addAttribute", "+ Add Attribute")}
                    </Button>
                  </div>
                </div>

                {/* 1. Variant Display Name */}
                <div className="mb-4">
                  <Input
                    label={t(
                      "products.variantDisplayName",
                      "Variant Display Name (वेरिएंट का नाम)"
                    )}
                    placeholder={
                      baseFormData.name
                        ? `${baseFormData.name} - Variant ${index + 1}`
                        : t(
                            "products.enterVariantName",
                            "Enter variant display name"
                          )
                    }
                    value={variant.displayName || ""}
                    onChange={(val) => {
                      const updated = [...variants];
                      updated[index] = {
                        ...updated[index],
                        displayName: val,
                        _autoNamed: false,
                      };
                      onChange(updated);
                    }}
                    leftIcon={Package}
                    helperText={t(
                      "products.variantDisplayNameHelper",
                      "Customer-facing title in catalog & invoice. (If left blank, product name + attributes will be used)"
                    )}
                  />
                </div>

                {/* 2. Variant Images / Media */}
                <div className="mb-5 p-4 rounded-xl bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))]">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--color-text-secondary))]">
                        {t(
                          "products.variantImages",
                          "Variant Images (वेरिएंट की फोटो)"
                        )}
                      </span>
                    </div>
                    {Array.isArray(variant.images) &&
                      variant.images.length > 0 && (
                        <span className="text-xs font-medium text-[rgb(var(--color-primary))]">
                          {variant.images.length}{" "}
                          {variant.images.length === 1 ? "Image" : "Images"}
                        </span>
                      )}
                  </div>

                  {Array.isArray(variant.images) &&
                  variant.images.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-3">
                      {variant.images.map((imgUrl, imgIdx) => {
                        const imgSrc =
                          typeof imgUrl === "string"
                            ? imgUrl
                            : imgUrl?.url || "";
                        const imgKey = imgSrc || `var-${index}-img-${imgIdx}`;
                        return (
                          <div
                            key={imgKey}
                            className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-secondary))] group shadow-xs"
                          >
                            {/* biome-ignore lint/performance/noImgElement: dynamic user uploaded thumbnails */}
                            <img
                              src={imgSrc}
                              alt={`Variant ${index + 1} asset ${imgIdx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveVariantImage(index, imgIdx)
                              }
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/75 hover:bg-rose-600 text-white flex items-center justify-center opacity-85 group-hover:opacity-100 transition-all cursor-pointer shadow-sm"
                              title="Remove image"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}

                      <label className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 border-dashed border-[rgb(var(--color-border-primary))] hover:border-[rgb(var(--color-primary))] bg-[rgb(var(--color-bg-secondary)/0.5)] hover:bg-[rgb(var(--color-primary)/0.05)] flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-primary))]">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          disabled={uploadingVariantIndex === index}
                          onChange={(e) =>
                            handleUploadVariantImages(index, e.target.files)
                          }
                        />
                        {uploadingVariantIndex === index ? (
                          <Loader2 className="w-4 h-4 animate-spin text-[rgb(var(--color-primary))]" />
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            <span className="text-[10px] font-medium">
                              + Add
                            </span>
                          </>
                        )}
                      </label>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-dashed border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-secondary)/0.3)]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[rgb(var(--color-primary)/0.08)] text-[rgb(var(--color-primary))] flex items-center justify-center shrink-0">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-[rgb(var(--color-text-primary))]">
                            {t(
                              "products.usingDefaultProductImage",
                              "Using product cover photos by default"
                            )}
                          </p>
                          <p className="text-[11px] text-[rgb(var(--color-text-tertiary))]">
                            {t(
                              "products.uploadVariantImageHint",
                              "Optional: Upload unique photos if this variant has distinct color or packaging"
                            )}
                          </p>
                        </div>
                      </div>

                      <label className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[rgb(var(--color-bg-primary))] hover:bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-text-primary))] border border-[rgb(var(--color-border-primary))] hover:border-[rgb(var(--color-primary))] cursor-pointer transition-all shrink-0">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          disabled={uploadingVariantIndex === index}
                          onChange={(e) =>
                            handleUploadVariantImages(index, e.target.files)
                          }
                        />
                        {uploadingVariantIndex === index ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[rgb(var(--color-primary))]" />
                            <span>{t("common.uploading", "Uploading...")}</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5 text-[rgb(var(--color-primary))]" />
                            <span>
                              {t(
                                "products.uploadVariantImage",
                                "Upload Variant Image"
                              )}
                            </span>
                          </>
                        )}
                      </label>
                    </div>
                  )}
                </div>
                {/* Row 1: MRP & Selling Price */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {/* MRP */}
                  <div>
                    <Input
                      type="number"
                      label={t("products.mrp", "MRP (₹)")}
                      placeholder="0.00"
                      value={variant.mrp || ""}
                      onChange={(val) =>
                        handleVariantFieldChange(index, "mrp", val)
                      }
                      required
                      min={0}
                      step={0.01}
                      leftIcon={IndianRupee}
                    />
                  </div>

                  {/* Selling Price */}
                  <div>
                    <Input
                      type="number"
                      label={t("products.sellingPrice", "Selling Price (₹)")}
                      placeholder="0.00"
                      value={variant.sellingPrice || ""}
                      onChange={(val) =>
                        handleVariantFieldChange(index, "sellingPrice", val)
                      }
                      required
                      min={0}
                      step={0.01}
                      leftIcon={IndianRupee}
                      error={isInvalidPricing}
                      errorMessage={
                        isInvalidPricing
                          ? t(
                              "products.sellingPriceExceedsMrp",
                              "Selling price cannot exceed MRP"
                            )
                          : undefined
                      }
                    />
                  </div>
                </div>

                {/* Row 2: SKU & Barcode */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {/* SKU with Auto-generate */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-[rgb(var(--color-text-secondary))]">
                        {t("products.sku", "SKU")}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAutoGenerateSku(index)}
                        className="inline-flex items-center gap-1 text-[11px] text-[rgb(var(--color-primary))] hover:underline cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>{t("products.autoGenerate", "Auto SKU")}</span>
                      </button>
                    </div>
                    <Input
                      placeholder={t("products.enterSku", "Enter SKU")}
                      value={variant.sku || ""}
                      onChange={(val) =>
                        handleVariantFieldChange(
                          index,
                          "sku",
                          (val || "").toUpperCase()
                        )
                      }
                      leftIcon={Hash}
                    />
                  </div>

                  {/* Barcode */}
                  <div>
                    <span className="block text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1">
                      {t("products.barcode", "Barcode")}
                    </span>
                    <Input
                      placeholder={t("products.enterBarcode", "Enter Barcode")}
                      value={variant.barcode || ""}
                      onChange={(val) =>
                        handleVariantFieldChange(index, "barcode", val)
                      }
                      leftIcon={Barcode}
                    />
                  </div>
                </div>

                {/* Row 3: Initial Stock & Conditional Purchase Price (Only when stock is added) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Opening Stock */}
                  <div>
                    <span className="block text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1">
                      {t("products.openingStock", "Initial Stock (Qty)")}
                    </span>
                    <Input
                      type="number"
                      placeholder="0"
                      min={0}
                      value={
                        variant.stock !== undefined && variant.stock !== null
                          ? variant.stock
                          : ""
                      }
                      onChange={(val) =>
                        handleVariantFieldChange(index, "stock", val)
                      }
                      leftIcon={Package}
                    />
                  </div>

                  {/* Cost / Purchase Price (Shown only if stock is added/entered > 0) */}
                  {variant.stock !== undefined &&
                    variant.stock !== "" &&
                    Number(variant.stock) > 0 && (
                      <div>
                        <span className="block text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1">
                          {t(
                            "products.purchasePrice",
                            "Cost / Purchase Price (₹)"
                          )}
                        </span>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={
                            variant.purchasePrice || variant.basePrice || ""
                          }
                          onChange={(val) => {
                            handleVariantFieldChange(index, {
                              purchasePrice: val,
                              basePrice: val,
                            });
                          }}
                          min={0}
                          step={0.01}
                          leftIcon={IndianRupee}
                        />
                      </div>
                    )}
                </div>

                {/* Price Feedback Summary */}
                {hasDiscount && (
                  <div className="mt-3.5 flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                    <Check className="w-3.5 h-3.5" />
                    <span>
                      {discountPercent}% OFF • Customer saves ₹
                      {(mrpNum - spNum).toFixed(2)} on this variant
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Button to create variants one by one */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleAddAnotherVariant}
              disabled={disabled}
              className="w-full py-5 px-6 rounded-2xl border-2 border-dashed border-blue-500/40 hover:border-blue-500 bg-slate-900/40 hover:bg-blue-500/10 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-3.5 text-blue-500 font-semibold group cursor-pointer shadow-sm hover:shadow-md"
            >
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center group-hover:scale-110 shadow-sm transition-transform shrink-0">
                <Plus className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="block text-sm sm:text-base font-bold text-[rgb(var(--color-text-primary))]">
                  + {t("products.addAnotherVariant", "Add Another Variant")}
                </span>
                <span className="block text-xs text-[rgb(var(--color-text-secondary))] font-normal">
                  {t(
                    "products.addAnotherVariantSubtitle",
                    "Add Another Variant Subtitle"
                  )}
                </span>
              </div>
            </button>
          </div>

          {/* Bottom Summary Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 text-xs text-[rgb(var(--color-text-secondary))] border-t border-[rgb(var(--color-border-primary))]">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>
                {variants.length}{" "}
                {variants.length === 1 ? "Variant" : "Variants"} ready.
              </span>
            </div>
            <span className="text-[rgb(var(--color-text-tertiary))]">
              {t(
                "products.variantsSavedOnPublish",
                "All variants will be created upon clicking Save & Publish."
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
