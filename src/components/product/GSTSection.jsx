"use client";
import { Calculator, Hash } from "lucide-react";
import { GST_RATE_OPTIONS } from "@/data";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { Input, Select, Toggle } from "../ui";

const GSTSection = ({ formData, onChange, errors = {}, ...props }) => {
  const { t } = useTranslation();
  const handleFieldChange = (field, value) => {
    onChange(field, value);
  };
  // GST Type options
  const gstTypeOptions = [
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

  // Calculate total GST amount
  const calculateGSTAmount = () => {
    const sellingPrice = parseFloat(formData.sellingPrice) || 0;
    const gstRate = parseFloat(formData.gstInfo?.gstRate) || 0;
    return (sellingPrice * gstRate) / 100;
  };

  const gstAmount = calculateGSTAmount();

  return (
    <>
      <>
        {/* GST Rate */}
        <div className="mb-6">
          <Select
            label={t("products.gstRateLabel")}
            options={GST_RATE_OPTIONS}
            value={formData.gstInfo?.gstRate || ""}
            onChange={(value) => handleFieldChange("gstInfo.gstRate", value)}
            error={errors.gstRate}
            errorMessage={errors.gstRate}
            required
            leftIcon={Calculator}
            searchable
            placeholder={t("products.selectGstRatePlaceholder")}
          />
        </div>

        {/* GST Type */}
        <div className="mb-6">
          <Select
            label={t("products.gstType")}
            options={gstTypeOptions}
            value={formData.gstInfo?.gstType || "CGST_SGST"}
            onChange={(value) => handleFieldChange("gstInfo.gstType", value)}
            error={errors.gstType}
            errorMessage={errors.gstType}
            required
            searchable
            placeholder={t("products.selectGstTypePlaceholder")}
            helperText={t("products.gstTypeHelperText")}
          />
        </div>

        {/* HSN Code */}
        <div className="mb-6">
          <Input
            label={t("products.hsnCode")}
            placeholder={t("products.enterHsnCode")}
            value={formData.gstInfo?.hsnCode || ""}
            onChange={(value) => handleFieldChange("gstInfo.hsnCode", value)}
            error={errors.hsnCode}
            errorMessage={errors.hsnCode}
            leftIcon={Hash}
            maxLength={8}
            helperText={t("products.hsnCodeHelperText")}
          />
        </div>

        {/* GST Summary */}
        {formData.gstInfo?.gstRate && formData.sellingPrice && (
          <div className="p-4 bg-[rgb(var(--color-bg-secondary))] rounded-lg border border-[rgb(var(--color-border-primary))]">
            <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-3">
              {t("products.gstSummary")}
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-text-secondary))]">
                  {t("products.sellingPrice")}:
                </span>
                <span className="font-medium text-[rgb(var(--color-text-primary))]">
                  ₹{parseFloat(formData.sellingPrice).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-text-secondary))]">
                  {t("products.gstRate")}:
                </span>
                <span className="font-medium text-[rgb(var(--color-text-primary))]">
                  {parseFloat(formData.gstInfo?.gstRate).toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-text-secondary))]">
                  {t("products.gstType")}:
                </span>
                <span className="font-medium text-[rgb(var(--color-text-primary))]">
                  {gstTypeOptions.find(
                    (type) => type.value === formData.gstInfo?.gstType
                  )?.label || formData.gstInfo?.gstType}
                </span>
              </div>
              {formData.gstInfo?.hsnCode && (
                <div className="flex justify-between">
                  <span className="text-[rgb(var(--color-text-secondary))]">
                    {t("products.hsnCode")}:
                  </span>
                  <span className="font-medium text-[rgb(var(--color-text-primary))]">
                    {formData.gstInfo.hsnCode}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-text-secondary))]">
                  {t("products.gstAmount")}:
                </span>
                <span className="font-medium text-[rgb(var(--color-primary))]">
                  ₹{gstAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-t border-[rgb(var(--color-border-primary))] pt-2">
                <span className="text-[rgb(var(--color-text-secondary))] font-medium">
                  {t("products.totalPrice")}:
                </span>
                <span className="font-bold text-[rgb(var(--color-primary))]">
                  ₹
                  {(parseFloat(formData.sellingPrice) + gstAmount).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </>
    </>
  );
};

export default GSTSection;
