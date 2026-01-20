"use client";
import React from "react";
import { Select, Toggle, Input } from "../ui";
import { Star, Award, Sparkles, Package } from "lucide-react";
import {
  PRODUCT_STATUS_OPTIONS,
  PRODUCT_VISIBILITY_OPTIONS,
  getProductStatusColor,
} from "@/data";
import { useTranslation } from "@/hooks/useTranslation";

const StatusSection = ({ formData, onChange, errors = {}, ...props }) => {
  const { t } = useTranslation();
  const handleFieldChange = (field, value) => {
    onChange(field, value);
  };

  // Use imported options from data constants
  const statusOptions = PRODUCT_STATUS_OPTIONS;
  const visibilityOptions = PRODUCT_VISIBILITY_OPTIONS;

  return (
    <>
      {/* Status & Visibility Toggle */}
      <div className="mb-6">
        <Toggle
          label={t("products.configureStatusVisibility")}
          checked={formData.statusInfo?.isEnabled || false}
          onChange={(checked) => {
            const updatedStatusInfo = {
              ...formData.statusInfo,
              isEnabled: checked,
            };
            handleFieldChange("statusInfo", updatedStatusInfo);
          }}
          helperText={t("products.configureStatusVisibilityHelperText")}
        />
      </div>

      {/* Status Fields - Only show if enabled */}
      {formData.statusInfo?.isEnabled && (
        <>
          {/* Visibility */}
          <div className="mb-6">
            <Select
              label={t("products.visibilityLabel")}
              options={visibilityOptions}
              value={formData.visibility || "PUBLIC"}
              onChange={(value) => handleFieldChange("visibility", value)}
              error={errors.visibility}
              errorMessage={errors.visibility}
              required
              helperText={t("products.whoCanSeeProduct")}
              searchable
              placeholder={t("products.selectVisibility")}
            />
          </div>

          {/* Product Flags */}
          <div className="space-y-4 mb-6">
            <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
              {t("products.productFlags")}
            </h4>

            <div className="space-y-4">
              <Toggle
                label={t("products.featuredProduct")}
                checked={formData.featured || false}
                onChange={(checked) => handleFieldChange("featured", checked)}
                helperText={t("products.featuredProductHelperText")}
              />

              <Toggle
                label={t("products.bestSeller")}
                checked={formData.bestSeller || false}
                onChange={(checked) => handleFieldChange("bestSeller", checked)}
                helperText={t("products.bestSellerHelperText")}
              />

              <Toggle
                label={t("products.newArrival")}
                checked={formData.newArrival || false}
                onChange={(checked) => handleFieldChange("newArrival", checked)}
                helperText={t("products.newArrivalHelperText")}
              />
            </div>
          </div>

          {/* Status Summary */}
          <div className="p-4 bg-[rgb(var(--color-bg-secondary))] rounded-lg border border-[rgb(var(--color-border-primary))]">
            <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-3">
              {t("products.productStatusSummary")}
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-text-secondary))]">
                  {t("products.visibilityLabel")}:
                </span>
                <span className="font-medium text-[rgb(var(--color-text-primary))]">
                  {visibilityOptions.find(
                    (v) => v.value === formData.visibility,
                  )?.label || formData.visibility}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-text-secondary))]">
                  {t("products.flags")}:
                </span>
                <div className="flex space-x-2">
                  {formData.featured && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      <Star className="w-3 h-3 mr-1" />
                      {t("products.featured")}
                    </span>
                  )}
                  {formData.bestSeller && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <Award className="w-3 h-3 mr-1" />
                      {t("products.bestSeller")}
                    </span>
                  )}
                  {formData.newArrival && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {t("products.newArrival")}
                    </span>
                  )}
                  {!formData.featured &&
                    !formData.bestSeller &&
                    !formData.newArrival && (
                      <span className="text-[rgb(var(--color-text-tertiary))]">
                        {t("products.none")}
                      </span>
                    )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default StatusSection;
