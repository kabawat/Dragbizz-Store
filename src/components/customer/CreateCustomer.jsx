"use client";
import { Save } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CustomerForm } from "@/components/customer";
import { Button } from "@/components/ui";
import useErrorHandling from "@/hooks/useErrorHandling";
import { useTranslation } from "@/hooks/useTranslation";
import { useUsageQuota } from "@/hooks/useUsageQuota";
import { customerService } from "@/service";

const CreateCustomer = ({
  storeId,
  onSuccess,
  onCancel,
  showCancelButton = true,
  autoRedirect = false,
  mode = "page", // 'page' or 'drawer'
}) => {
  const { t } = useTranslation();
  const quotaRefreshRef = useRef(null);

  // Get quota information for frontend validation
  const {
    quota,
    isLoading: quotaLoading,
    refresh: refreshQuota,
  } = useUsageQuota("customer_management");

  const [loading, setLoading] = useState(false);
  const {
    handleApiError,
    handleApiResult,
    fieldErrors,
    setFieldErrors,
    QuotaModal,
    showSuccess,
    clearFieldErrors,
    setQuotaErrorManually,
  } = useErrorHandling();

  // Check if quota is available
  const isQuotaAvailable = () => {
    // If quota is loading or not loaded, allow (enable button)
    if (quotaLoading || !quota) return true;
    // If unlimited, allow
    if (quota.remaining === -1 || quota.limit === -1) return true;
    // If hasAccess is explicitly false, disallow
    if (quota.hasAccess === false) return false;
    // If remaining is explicitly 0 or less, disallow
    if (quota.remaining !== undefined && quota.remaining <= 0) return false;
    // Default: allow (enable button)
    return true;
  };

  // Set quota refresh ref
  useEffect(() => {
    quotaRefreshRef.current = refreshQuota;
  }, [refreshQuota]);

  // Initial form data
  const getInitialFormData = () => ({
    store: storeId || "",
    name: "",
    phone: "",
    email: "",
    address: "",
    companyDetails: {
      gstin: "",
      companyName: "",
    },
    addresses: null,
  });

  const [formData, setFormData] = useState(getInitialFormData());

  // Update store ID when storeId prop changes
  useEffect(() => {
    if (storeId) {
      setFormData((prevData) => ({
        ...prevData,
        store: storeId,
      }));
    }
  }, [storeId]);

  // Handle form data changes
  const handleFormDataChange = (fieldName, value) => {
    // Handle special clearError command
    if (fieldName === "clearError") {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[value];
        return newErrors;
      });
      return;
    }

    // Ensure fieldName is a string
    if (typeof fieldName !== "string") {
      return;
    }

    // Clear error for this field when user starts typing
    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }

    // Handle nested field errors (like companyDetails.gstin)
    if (fieldName === "companyDetails") {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        Object.keys(newErrors).forEach((key) => {
          if (key.startsWith("companyDetails.")) {
            delete newErrors[key];
          }
        });
        return newErrors;
      });
    }

    // Handle addresses field errors
    if (fieldName === "addresses") {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        Object.keys(newErrors).forEach((key) => {
          if (key.startsWith("addresses.")) {
            delete newErrors[key];
          }
        });
        return newErrors;
      });
    }

    setFormData((prevData) => ({
      ...prevData,
      [fieldName]: value,
    }));
  };

  // Handle save and publish
  const handleSaveAndPublish = async () => {
    // Frontend validation: Check quota before making API call
    if (!isQuotaAvailable()) {
      const quotaData = quota || {};
      setQuotaErrorManually({
        message:
          quota.remaining === 0
            ? `Daily limit reached. You have used all ${quota.limit} customers for today. Please try again tomorrow or upgrade your plan.`
            : "Quota exceeded. Please upgrade your plan to continue.",
        quota: quotaData,
        resetTime:
          quota.usageType === "DAILY_FIXED"
            ? "tomorrow"
            : quota.usageType === "MONTHLY_TOTAL"
              ? "next month"
              : null,
        canUpgrade: true,
      });
      return;
    }

    try {
      setLoading(true);
      clearFieldErrors();

      // Prepare payload: make companyDetails optional (omit when empty)
      const payload = (() => {
        const data = { ...formData };
        const gstin = data?.companyDetails?.gstin?.trim?.() || "";
        const companyName = data?.companyDetails?.companyName?.trim?.() || "";
        if (!gstin && !companyName) {
          const { companyDetails, ...rest } = data;
          return rest;
        }
        return data;
      })();

      const result = await customerService.createCustomer(payload);
      const handled = handleApiResult(
        result,
        t("customers.createSuccess"),
        "customer-creation"
      );

      if (handled.type === "success") {
        if (quotaRefreshRef.current) {
          quotaRefreshRef.current();
        }
        if (onSuccess) {
          onSuccess(result.data);
        }
        setFormData(getInitialFormData());
        clearFieldErrors();
      }
    } catch (error) {
      handleApiError(error, "customer-creation");
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const _resetForm = () => {
    setFormData(getInitialFormData());
    clearFieldErrors();
  };

  return (
    <>
      <div
        className={`flex flex-col ${mode === "drawer" ? "h-full" : "min-h-full"}`}
      >
        <div
          className={`${mode === "drawer" ? "flex-1 overflow-y-auto space-y-4 sm:space-y-6 min-h-0" : ""}`}
        >
          <CustomerForm
            formData={formData}
            onChange={handleFormDataChange}
            fieldErrors={fieldErrors}
          />
        </div>

        {/* Action Buttons */}
        {(mode === "drawer" || showCancelButton) && (
          <div
            className={`flex-shrink-0 ${mode === "drawer" ? "bg-[rgb(var(--color-bg-primary))] border-t border-[rgb(var(--color-border-primary))] p-3 sm:p-4 -mx-3 sm:-mx-4 md:-mx-6 -mb-3 sm:-mb-4 md:-mb-6" : "mt-auto bg-[rgb(var(--color-bg-primary))] border-t border-[rgb(var(--color-border-primary))] pt-4 pb-4"} flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-2 sm:gap-3`}
          >
            <Button
              variant="success"
              onClick={handleSaveAndPublish}
              disabled={loading}
              loading={loading}
              leftIcon={Save}
              className="w-full sm:w-auto"
              size="sm"
            >
              {t("customers.saveCustomer")}
            </Button>
            {showCancelButton && onCancel && (
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={loading}
                className="w-full sm:w-auto"
                size="sm"
              >
                {t("common.cancel")}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Quota Modal from useErrorHandling hook */}
      {QuotaModal}
    </>
  );
};

export default CreateCustomer;
