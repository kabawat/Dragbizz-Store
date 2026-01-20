import { extractFieldErrors } from "./validationErrorHandler";
import logger from "./logger";

export const getErrorMessage = (error, context = "general") => {
  if (!error) return "An error occurred. Please try again.";

  const errorData = error.response?.data || error.error || error;

  if (errorData.details?.title) {
    return errorData.details.title;
  }

  if (errorData.details?.detail) {
    return errorData.details.detail;
  }

  if (errorData.message) {
    return errorData.message;
  }

  if (errorData.error) {
    return errorData.error;
  }

  if (error.message) {
    return error.message;
  }

  return "An error occurred. Please try again.";
};

export const isQuotaError = (error) => {
  return (
    error.response?.status === 403 &&
    (error.response?.data?.error === "Quota Exceeded" ||
      error.response?.data?.error === "Forbidden")
  );
};

export const getQuotaData = (error) => {
  if (!isQuotaError(error)) return null;

  const errorData = error.response?.data || {};
  const quotaData = errorData.data || {};

  return {
    message: errorData.message || "Quota exceeded",
    quota: quotaData.quota || quotaData,
    resetTime: quotaData.resetTime || null,
    canUpgrade: quotaData.canUpgrade !== false,
  };
};

export const hasFieldErrors = (error) => {
  const errorData = error.response?.data || error.error || error;
  if (errorData.details?.additionalInfo) {
    const additionalInfo = errorData.details.additionalInfo;
    if (typeof additionalInfo === 'object' && Object.keys(additionalInfo).length > 0) {
      return true;
    }
  }
  const fieldErrors = extractFieldErrors(errorData);
  return Object.keys(fieldErrors).length > 0;
};

export const getFieldErrors = (error) => {
  const errorData = error.response?.data || error.error || error;
  if (errorData.details?.additionalInfo) {
    const additionalInfo = errorData.details.additionalInfo;
    if (typeof additionalInfo === 'object' && Object.keys(additionalInfo).length > 0) {
      return extractFieldErrors(additionalInfo);
    }
  }
  return extractFieldErrors(errorData);
};

export const isNetworkError = (error) => {
  return (
    error.code === "ERR_NETWORK" ||
    error.code === "NETWORK_ERROR" ||
    error.message === "Network Error" ||
    (!error.response && error.request) ||
    error.message?.includes("Network Error") ||
    (typeof navigator !== "undefined" && !navigator.onLine)
  );
};

export const handleError = (error, options = {}) => {
  const {
    showToast = null,
    setFieldErrors = null,
    setQuotaError = null,
    setShowQuotaModal = null,
    context = "general",
    logError = true,
  } = options;

  if (logError) {
    logger.error(`[${context}] Error:`, error);
  }

  if (isQuotaError(error)) {
    const quotaData = getQuotaData(error);
    if (setQuotaError) setQuotaError(quotaData);
    if (setShowQuotaModal) setShowQuotaModal(true);
    return { type: "quota", handled: true, quotaData };
  }

  if (hasFieldErrors(error)) {
    const fieldErrors = getFieldErrors(error);
    if (setFieldErrors) setFieldErrors(fieldErrors);
    if (showToast) {
      showToast("Please fix the errors in the form", "error");
    }
    return { type: "field", handled: true, fieldErrors };
  }

  const message = getErrorMessage(error, context);
  if (showToast) {
    showToast(message, "error");
  }

  return { type: "general", handled: true, message };
};

export const handleServiceResult = (result, options = {}) => {
  const {
    showToast = null,
    setFieldErrors = null,
    setQuotaError = null,
    setShowQuotaModal = null,
    successMessage = null,
    context = "general",
  } = options;

  if (!result) {
    const message = "An unexpected error occurred. Please try again.";
    if (showToast) showToast(message, "error");
    return { handled: true, type: "general", message };
  }

  if (result.success) {
    if (successMessage && showToast) {
      showToast(successMessage, "success");
    }
    return { handled: false, type: "success", data: result.data };
  }

  if (result.statusCode === 403 && result.error) {
    const quotaData = {
      message: result.message || "Quota exceeded",
      quota: result.error?.data?.quota || result.error?.quota || {},
      resetTime: result.error?.data?.resetTime || null,
      canUpgrade: result.error?.data?.canUpgrade !== false,
    };
    if (setQuotaError) setQuotaError(quotaData);
    if (setShowQuotaModal) setShowQuotaModal(true);
    return { type: "quota", handled: true, quotaData };
  }

  if (result.error?.fields) {
    const fieldErrors = extractFieldErrors(result.error);
    if (Object.keys(fieldErrors).length > 0) {
      if (setFieldErrors) setFieldErrors(fieldErrors);
      if (showToast) {
        showToast("Please fix the errors in the form", "error");
      }
      return { type: "field", handled: true, fieldErrors };
    }
  }

  const message = result.message || "An error occurred. Please try again.";
  if (showToast) showToast(message, "error");

  return { type: "general", handled: true, message };
};

export default {
  getErrorMessage,
  isQuotaError,
  getQuotaData,
  hasFieldErrors,
  getFieldErrors,
  isNetworkError,
  handleError,
  handleServiceResult,
};

