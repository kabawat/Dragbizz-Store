"use client";
import { useCallback, useState } from "react";
import { useGlobalToast } from "@/contexts/ToastContext";
import { handleError, handleServiceResult } from "@/utils/errorHandling";

export const useErrorHandling = () => {
  const { showError, showSuccess } = useGlobalToast();
  const [fieldErrors, setFieldErrors] = useState({});

  const handleApiError = useCallback(
    (error, context = "general") => {
      return handleError(error, {
        showToast: showError,
        setFieldErrors,
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
