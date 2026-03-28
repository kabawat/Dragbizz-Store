"use client";
import { useCallback, useState } from "react";
import { handleError, handleServiceResult } from "@/utils/errorHandling";

export const useErrorHandler = () => {
  const [quotaError, setQuotaError] = useState(null);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleApiError = useCallback(
    (
      error,
      setFieldErrorsFn,
      defaultMessage = "An error occurred. Please try again."
    ) => {
      const result = handleError(error, {
        setFieldErrors: setFieldErrorsFn || setFieldErrors,
        setQuotaError,
        setShowQuotaModal,
        context: "general",
      });

      if (result.type === "quota" || result.type === "field") {
        return result;
      }

      setErrorMessage(result.message || defaultMessage);
      setShowErrorModal(true);
      return {
        handled: true,
        type: "general",
        message: result.message || defaultMessage,
      };
    },
    []
  );

  const handleApiResult = useCallback(
    (
      result,
      setFieldErrorsFn,
      defaultMessage = "An error occurred. Please try again."
    ) => {
      if (!result.success) {
        const handledResult = handleServiceResult(result, {
          setFieldErrors: setFieldErrorsFn || setFieldErrors,
          setQuotaError,
          setShowQuotaModal,
          context: "general",
        });

        if (handledResult.type === "quota" || handledResult.type === "field") {
          return handledResult;
        }

        setErrorMessage(handledResult.message || defaultMessage);
        setShowErrorModal(true);
        return {
          handled: true,
          type: "general",
          message: handledResult.message || defaultMessage,
        };
      }

      return { handled: false };
    },
    []
  );

  const clearErrors = useCallback(() => {
    setQuotaError(null);
    setShowQuotaModal(false);
    setErrorMessage("");
    setShowErrorModal(false);
    setFieldErrors({});
  }, []);

  return {
    quotaError,
    showQuotaModal,
    errorMessage,
    showErrorModal,
    fieldErrors,
    setQuotaError,
    setShowQuotaModal,
    setErrorMessage,
    setShowErrorModal,
    setFieldErrors,
    handleApiError,
    handleApiResult,
    clearErrors,
  };
};
