"use client";
import { Calculator, Hash, Info, Package, Percent } from "lucide-react";
import { CURRENCY_OPTIONS, GST_RATE_OPTIONS, UOM_OPTIONS } from "@/data";
import { useTranslation } from "@/hooks/useTranslation";
import { Input, Select, Toggle } from "../ui";
import { useAppSelector } from "@/store/hooks";
import { useEffect } from "react";

const PricingGSTSection = ({ formData, onChange, errors = {}, ...props }) => {
  const { t } = useTranslation();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const hasStoreGst = !!selectedStore?.gst;

  useEffect(() => {
    // Logic to auto-set GST defaults if needed, can be empty now if no auto-toggle is needed
  }, [hasStoreGst, onChange]);

  const handleFieldChange = (field, value) => {
    onChange(field, value);
  };

  // GST Type options
  const gstTypeOptions = (t) => [
    {
      value: "CGST_SGST",
      label: t("products.cgstSgst"),
      description: t("products.cgstSgstDescription"),
    },
    {
      value: "IGST",
      label: t("products.igst"),
      description: t("products.igstDescription"),
    },
    {
      value: "UTGST",
      label: t("products.utgst"),
      description: t("products.utgstDescription"),
    },
  ];

  // Calculate GST amount based on include/exclude option
  const calculateGSTAmount = () => {
    const sellingPrice = parseFloat(formData.sellingPrice) || 0;
    const gstRate = parseFloat(formData.gstInfo?.gstRate) || 0;
    const isGstIncluded = formData.gstInfo?.isGstIncluded || false;

    if (isGstIncluded) {
      // If GST is included, calculate GST from the selling price
      // GST = (Selling Price * GST Rate) / (100 + GST Rate)
      return (sellingPrice * gstRate) / (100 + gstRate);
    } else {
      // If GST is excluded, calculate GST on top of selling price
      // GST = (Selling Price * GST Rate) / 100
      return (sellingPrice * gstRate) / 100;
    }
  };

  // Calculate base price (price without GST)
  const calculateBasePrice = () => {
    const sellingPrice = parseFloat(formData.sellingPrice) || 0;
    const gstAmount = calculateGSTAmount();
    const isGstIncluded = formData.gstInfo?.isGstIncluded || false;

    if (isGstIncluded) {
      // If GST is included, base price = selling price - GST
      return sellingPrice - gstAmount;
    } else {
      // If GST is excluded, base price = selling price
      return sellingPrice;
    }
  };

  // Calculate total price (selling price + GST if excluded)
  const calculateTotalPrice = () => {
    const sellingPrice = parseFloat(formData.sellingPrice) || 0;
    const gstAmount = calculateGSTAmount();
    const isGstIncluded = formData.gstInfo?.isGstIncluded || false;

    if (isGstIncluded) {
      // If GST is included, total = selling price
      return sellingPrice;
    } else {
      // If GST is excluded, total = selling price + GST
      return sellingPrice + gstAmount;
    }
  };

  const gstAmount = calculateGSTAmount();
  const basePrice = calculateBasePrice();
  const totalPrice = calculateTotalPrice();

  return (
    <>
      {/* Pricing Information */}
      <div className="mb-8">
        {/* Price Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* MRP */}
          <div>
            <Input
              type="number"
              label={t("products.mrp")}
              placeholder={t("products.enterAmount")}
              value={formData.mrp || ""}
              onChange={(value) => handleFieldChange("mrp", value)}
              error={errors.mrp}
              errorMessage={errors.mrp}
              required
              leftIcon={() => (
                <span className="text-[rgb(var(--color-text-tertiary))] font-bold text-md">
                  ₹
                </span>
              )}
              min={0}
              step={0.01}
              precision={2}
              helperText={t("products.mrpHelperText")}
              className="transition-all duration-200 group-hover:shadow-sm"
            />
          </div>

          {/* Selling Price */}
          <div>
            <Input
              type="number"
              label={t("products.sellingPrice")}
              placeholder={t("products.enterAmount")}
              value={formData.sellingPrice || ""}
              onChange={(value) => handleFieldChange("sellingPrice", value)}
              error={errors.sellingPrice}
              errorMessage={errors.sellingPrice}
              required
              leftIcon={() => (
                <span className="text-[rgb(var(--color-text-tertiary))] font-bold text-md">
                  ₹
                </span>
              )}
              min={0}
              step={0.01}
              precision={2}
              helperText={t("products.sellingPriceHelperText")}
              className="transition-all duration-200 group-hover:shadow-sm"
            />
          </div>
        </div>

        {/* Currency and UOM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label={t("products.currency")}
            options={CURRENCY_OPTIONS}
            value={formData.currency || "INR"}
            onChange={(value) => handleFieldChange("currency", value)}
            error={errors.currency}
            errorMessage={errors.currency}
            required
            disabled
            searchable
            placeholder={t("products.selectCurrency")}
          />
          <Select
            label={t("products.unitOfMeasure")}
            options={UOM_OPTIONS}
            value={formData.uom || "PCS"}
            onChange={(value) => handleFieldChange("uom", value)}
            error={errors.uom}
            errorMessage={errors.uom}
            required
            leftIcon={Package}
            searchable
            placeholder={t("products.selectUnitOfMeasure")}
          />
        </div>

        {/* Price Summary */}
        <div className="mt-6 p-6 bg-gradient-to-r from-[rgb(var(--color-bg-secondary))] to-[rgb(var(--color-bg-tertiary))] rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] flex items-center">
              <span className="text-[rgb(var(--color-primary))] font-bold text-xl mr-2">
                ₹
              </span>
              {t("products.priceSummary")}
            </h4>
            <div className="text-xs text-[rgb(var(--color-text-tertiary))] bg-[rgb(var(--color-bg-primary))] px-2 py-1 rounded-full">
              {t("products.livePreview")}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column - Prices */}
            <div className="space-y-3">
              {formData.mrp ? (
                <div className="flex justify-between items-center p-3 rounded-lg bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))]">
                  <span className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">
                    {t("products.mrp")}:
                  </span>
                  <span className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                    ₹{parseFloat(formData.mrp).toFixed(2)}
                  </span>
                </div>
              ) : (
                <div className="flex justify-between items-center p-3 rounded-lg bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] opacity-50">
                  <span className="text-sm font-medium text-[rgb(var(--color-text-tertiary))]">
                    {t("products.mrp")}:
                  </span>
                  <span className="text-sm font-semibold text-[rgb(var(--color-text-tertiary))]">
                    ₹0.00
                  </span>
                </div>
              )}

              {formData.sellingPrice ? (
                <div className="flex justify-between items-center p-3 rounded-lg border border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]">
                  <span className="text-sm font-medium text-white">
                    {t("products.sellingPrice")}:
                  </span>
                  <span className="text-sm font-bold text-white">
                    ₹{parseFloat(formData.sellingPrice).toFixed(2)}
                  </span>
                </div>
              ) : (
                <div className="flex justify-between items-center p-3 rounded-lg border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))] opacity-50">
                  <span className="text-sm font-medium text-[rgb(var(--color-text-tertiary))]">
                    {t("products.sellingPrice")}:
                  </span>
                  <span className="text-sm font-bold text-[rgb(var(--color-text-tertiary))]">
                    ₹0.00
                  </span>
                </div>
              )}
            </div>

            {/* Right Column - Savings */}
            <div className="space-y-3">
              {formData.mrp &&
                formData.sellingPrice &&
                parseFloat(formData.mrp) > parseFloat(formData.sellingPrice) ? (
                <div className="flex justify-between items-center p-3 rounded-lg border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))]">
                  <span className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">
                    {t("products.youSave")}:
                  </span>
                  <span className="text-sm font-bold text-[rgb(var(--color-primary))]">
                    ₹
                    {(
                      parseFloat(formData.mrp) -
                      parseFloat(formData.sellingPrice)
                    ).toFixed(2)}
                  </span>
                </div>
              ) : (
                <div className="flex justify-between items-center p-3 bg-[rgb(var(--color-bg-primary))] rounded-lg border border-[rgb(var(--color-border-primary))] opacity-50">
                  <span className="text-sm font-medium text-[rgb(var(--color-text-tertiary))]">
                    {t("products.youSave")}:
                  </span>
                  <span className="text-sm font-semibold text-[rgb(var(--color-text-tertiary))]">
                    ₹0.00
                  </span>
                </div>
              )}

              {formData.mrp &&
                formData.sellingPrice &&
                parseFloat(formData.mrp) > parseFloat(formData.sellingPrice) ? (
                <div className="flex justify-between items-center p-3 rounded-lg border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))]">
                  <span className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">
                    {t("products.discount")}:
                  </span>
                  <span className="text-sm font-bold text-green-600">
                    {Math.round(
                      ((parseFloat(formData.mrp) -
                        parseFloat(formData.sellingPrice)) /
                        parseFloat(formData.mrp)) *
                      100
                    )}
                    %
                  </span>
                </div>
              ) : (
                <div className="flex justify-between items-center p-3 bg-[rgb(var(--color-bg-primary))] rounded-lg border border-[rgb(var(--color-border-primary))] opacity-50">
                  <span className="text-sm font-medium text-[rgb(var(--color-text-tertiary))]">
                    {t("products.discount")}:
                  </span>
                  <span className="text-sm font-semibold text-[rgb(var(--color-text-tertiary))]">
                    0%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* GST Information */}
      <div>
        <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4 flex items-center">
          <Calculator className="w-5 h-5 mr-2 text-[rgb(var(--color-primary))]" />
          {t("products.gstInformation")}
        </h3>



        {/* GST Fields - Always show, but some parts conditional */}
        <>
          {/* GST Rate, Type, and HSN Code - Single Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* GST Rate */}
            <div>
              <Select
                label={t("products.gstRate")}
                options={GST_RATE_OPTIONS}
                value={formData.gstInfo?.gstRate || ""}
                onChange={(value) =>
                  handleFieldChange("gstInfo.gstRate", value)
                }
                error={errors.gstRate}
                errorMessage={errors.gstRate}
                required={hasStoreGst}
                leftIcon={Calculator}
                searchable
                placeholder={t("products.selectGstRate")}
              />
            </div>

            {/* GST Type */}
            <div>
              <Select
                label={t("products.gstType")}
                options={gstTypeOptions(t)}
                value={formData.gstInfo?.gstType || "CGST_SGST"}
                onChange={(value) =>
                  handleFieldChange("gstInfo.gstType", value)
                }
                error={errors.gstType}
                errorMessage={errors.gstType}
                required={hasStoreGst}
                searchable
                placeholder={t("products.selectGstType")}
              />
            </div>

            {/* HSN Code */}
            <div>
              <Input
                label={t("products.hsnCode")}
                placeholder={t("products.enterHsnCode")}
                value={formData.gstInfo?.hsnCode || ""}
                onChange={(value) =>
                  handleFieldChange("gstInfo.hsnCode", value)
                }
                error={errors.hsnCode}
                errorMessage={errors.hsnCode}
                required={hasStoreGst}
                leftIcon={Hash}
                maxLength={8}
              />
            </div>
          </div>

          {/* GST Include/Exclude Option */}
          <div className="mb-6">
            {hasStoreGst ? (
              <>
                <div className="flex flex-col space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="gstIncluded"
                      value="excluded"
                      checked={formData.gstInfo?.isGstIncluded === false}
                      onChange={() =>
                        handleFieldChange("gstInfo.isGstIncluded", false)
                      }
                      className="w-4 h-4 text-[rgb(var(--color-primary))] border-[rgb(var(--color-border-primary))] focus:ring-[rgb(var(--color-primary))] focus:ring-2"
                    />
                    <span className="ml-3 text-sm text-[rgb(var(--color-text-primary))]">
                      <span className="font-medium">
                        {t("products.gstExcluded") || "GST Excluded"}
                      </span>
                      <span className="text-[rgb(var(--color-text-secondary))] ml-1">
                        - {t("products.gstExcludedDescription") || "Base Price + GST"}
                      </span>
                    </span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="gstIncluded"
                      value="included"
                      checked={formData.gstInfo?.isGstIncluded === true}
                      onChange={() =>
                        handleFieldChange("gstInfo.isGstIncluded", true)
                      }
                      className="w-4 h-4 text-[rgb(var(--color-primary))] border-[rgb(var(--color-border-primary))] focus:ring-[rgb(var(--color-primary))] focus:ring-2"
                    />
                    <span className="ml-3 text-sm text-[rgb(var(--color-text-primary))]">
                      <span className="font-medium">
                        {t("products.gstIncluded") || "GST Included"}
                      </span>
                      <span className="text-[rgb(var(--color-text-secondary))] ml-1">
                        - {t("products.gstIncludedDescription") || "Selling Price includes GST"}
                      </span>
                    </span>
                  </label>
                </div>
                <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-2">
                  {t("products.gstPricingMethodHelperText")}
                </p>
              </>
            ) : (
              <p className="text-sm text-[rgb(var(--color-text-secondary))] flex items-start gap-2">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  <span className="font-semibold">Note: </span>
                  {t("products.noGstInfoMessage") ||
                    "Since your store doesn't have a GST number, this information is collected for future reference only."}
                </span>
              </p>
            )}
          </div>

          {/* GST Summary */}
          <div className="p-6 bg-gradient-to-r from-[rgb(var(--color-bg-secondary))] to-[rgb(var(--color-bg-tertiary))] rounded-lg">
            <h4 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4 flex items-center">
              <Calculator className="w-5 h-5 mr-2 text-[rgb(var(--color-primary))]" />
              {t("products.gstSummary")}
            </h4>

            {/* Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {/* Price Field */}


              {/* GST Rate */}
              <div className="p-3 rounded-lg bg-[rgb(var(--color-bg-primary))]">
                <span className="text-xs font-medium text-[rgb(var(--color-text-secondary))] block mb-1">
                  {t("products.gstRate")}
                </span>
                <span className="font-semibold text-[rgb(var(--color-text-primary))]">
                  {(parseFloat(formData.gstInfo?.gstRate) || 0).toFixed(2)}%
                </span>
              </div>

              {/* GST Type */}
              <div className="p-3 rounded-lg bg-[rgb(var(--color-bg-primary))]">
                <span className="text-xs font-medium text-[rgb(var(--color-text-secondary))] block mb-1">
                  {t("products.gstType")}
                </span>
                <span className="font-semibold text-[rgb(var(--color-text-primary))] truncate" title={gstTypeOptions(t).find(
                  (type) => type.value === formData.gstInfo?.gstType
                )?.label || formData.gstInfo?.gstType}>
                  {gstTypeOptions(t).find(
                    (type) => type.value === formData.gstInfo?.gstType
                  )?.label || formData.gstInfo?.gstType}
                </span>
              </div>

              {/* GST Status */}
              <div className="p-3 rounded-lg bg-[rgb(var(--color-bg-primary))]">
                <span className="text-xs font-medium text-[rgb(var(--color-text-secondary))] block mb-1">
                  {t("products.gstStatus")}
                </span>
                <span className={`font-semibold ${formData.gstInfo?.isGstIncluded ? "text-green-600" : "text-blue-600"}`}>
                  {formData.gstInfo?.isGstIncluded
                    ? t("products.included")
                    : t("products.excluded")}
                </span>
              </div>

              {/* HSN Code - Conditional */}
              <div className="p-3 rounded-lg bg-[rgb(var(--color-bg-primary))]">
                <span className="text-xs font-medium text-[rgb(var(--color-text-secondary))] block mb-1">
                  {t("products.hsnCode")}
                </span>
                <span className="font-semibold text-[rgb(var(--color-text-primary))]">
                  {formData.gstInfo?.hsnCode ? formData.gstInfo.hsnCode : "-"}
                </span>
              </div>
            </div>

            {/* Totals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between items-center py-2 px-4 rounded-lg bg-[rgb(var(--color-primary)/0.8)] text-white">
                <span className="text-sm font-medium opacity-90">
                  {t("products.gstAmount")}
                </span>
                <span className="text-lg font-bold">
                  ₹{gstAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 px-4 rounded-lg bg-green-500 text-white">
                <span className="text-sm font-medium opacity-90">
                  {t("products.totalPrice")}
                </span>
                <span className="text-lg font-bold">
                  ₹{totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </>
      </div >
    </>
  );
};

export default PricingGSTSection;
