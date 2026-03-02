"use client";
import { useCallback, useState } from "react";
import { useGlobalToast } from "@/contexts/ToastContext";
import { handleError, handleServiceResult } from "@/utils/errorHandling";
import { useSubscription } from "@/contexts/SubscriptionContext";

export const useErrorHandling = () => {
  const { showError, showSuccess } = useGlobalToast();
  const [fieldErrors, setFieldErrors] = useState({});

  const { showUpgradeModal } = useSubscription();

  const handleApiError = useCallback(
    (error, context = "general") => {
      // Extract error payload
      const errorData = error?.response?.data || error?.error || error;
      const code = errorData?.code;
      const message = errorData?.message || "An error occurred";

      // Intercept Subscription / Quota errors
      if (code === "SUBSCRIPTION_REQUIRED" || code === "FEATURE_NOT_AVAILABLE") {
        showUpgradeModal(message, "UPGRADE");
        return { type: "general", handled: true, message };
      }

      if (code === "QUOTA_EXCEEDED") {
        showUpgradeModal(message, "QUOTA");
        return { type: "general", handled: true, message };
      }

      return handleError(error, {
        showToast: showError,
        setFieldErrors,
        context,
      });
    },
    [showError, showUpgradeModal]
  );

  const handleApiResult = useCallback(
    (result, successMessage = null, context = "general") => {
      return handleServiceResult(result, {
        showToast: result?.success ? showSuccess : showError,
        setFieldErrors,
        successMessage,
        context,
      });
    },
    [showError, showSuccess]
  );

  const clearErrors = useCallback(() => {
    setFieldErrors({});
  }, []);

  const clearFieldErrors = useCallback(() => {
    setFieldErrors({});
  }, []);

  const setFieldError = useCallback((fieldName, errorMessage) => {
    setFieldErrors((prev) => ({
      ...prev,
      [fieldName]: errorMessage,
    }));
  }, []);

  const getFieldError = useCallback(
    (fieldName) => {
      return fieldErrors[fieldName] || null;
    },
    [fieldErrors]
  );

  return {
    handleApiError,
    handleApiResult,
    clearErrors,
    clearFieldErrors,
    setFieldError,
    getFieldError,
    fieldErrors,
    setFieldErrors,
    showError,
    showSuccess,
  };
};

export default useErrorHandling;
