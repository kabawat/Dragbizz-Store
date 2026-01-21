"use client";
import { useCallback, useState } from "react";
import { QuotaExceededModal } from "@/components/common";
import { useGlobalToast } from "@/contexts/ToastContext";
import { handleError, handleServiceResult } from "@/utils/errorHandling";

export const useErrorHandling = () => {
  const { showError, showSuccess } = useGlobalToast();
  const [quotaError, setQuotaError] = useState(null);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleApiError = useCallback(
    (error, context = "general") => {
      return handleError(error, {
        showToast: showError,
        setFieldErrors,
        setQuotaError,
        setShowQuotaModal,
        context,
      });
    },
    [showError]
  );

  const handleApiResult = useCallback(
    (result, successMessage = null, context = "general") => {
      return handleServiceResult(result, {
        showToast: result?.success ? showSuccess : showError,
        setFieldErrors,
        setQuotaError,
        setShowQuotaModal,
        successMessage,
        context,
      });
    },
    [showError, showSuccess]
  );

  const clearErrors = useCallback(() => {
    setQuotaError(null);
    setShowQuotaModal(false);
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

  const setQuotaErrorManually = useCallback((quotaData) => {
    setQuotaError(quotaData);
    setShowQuotaModal(true);
  }, []);

  const QuotaModal = showQuotaModal
    ? <QuotaExceededModal
        isOpen={showQuotaModal}
        onClose={() => setShowQuotaModal(false)}
        message={quotaError?.message}
        quota={quotaError?.quota}
        resetTime={quotaError?.resetTime}
        canUpgrade={quotaError?.canUpgrade}
      />
    : null;

  return {
    handleApiError,
    handleApiResult,
    clearErrors,
    clearFieldErrors,
    setFieldError,
    getFieldError,
    fieldErrors,
    setFieldErrors,
    quotaError,
    showQuotaModal,
    setShowQuotaModal,
    setQuotaErrorManually,
    QuotaModal,
    showError,
    showSuccess,
  };
};

export default useErrorHandling;
