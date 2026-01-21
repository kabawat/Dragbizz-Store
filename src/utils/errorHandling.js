import logger from "./logger";
import { extractFieldErrors } from "./validationErrorHandler";

const ERROR_MESSAGES = {
  general: "An error occurred. Please try again.",
  network: "Network error. Please check your internet connection.",
  server: "Server error. Please try again later.",
  unauthorized: "Invalid credentials. Please check your information.",
  forbidden: "Access denied. Please check your subscription plan.",
  quotaExceeded: "Quota exceeded",
  tooManyRequests: "Too many requests. Please try again later.",
  invalidRequest: "Invalid request. Please check your input.",
  formErrors: "Please fix the errors in the form",
  unexpected: "An unexpected error occurred. Please try again.",
  login: {
    unauthorized:
      "Invalid email/phone or password. Please check your credentials.",
    tooManyRequests: "Too many login attempts. Please try again later.",
    default: "An error occurred during login. Please try again.",
  },
  otp: {
    unauthorized: "Invalid or expired OTP. Please request a new code.",
    tooManyRequests: "Too many verification attempts. Please try again later.",
    default: "An error occurred during verification. Please try again.",
  },
  otpSend: {
    unauthorized: "Invalid email/phone number. Please check your credentials.",
    tooManyRequests: "Too many OTP requests. Please try again later.",
    default: "An error occurred while sending OTP. Please try again.",
  },
  otpResend: {
    unauthorized: "Session expired. Please start login again.",
    tooManyRequests:
      "Too many resend requests. Please wait before trying again.",
    default: "An error occurred while resending OTP. Please try again.",
  },
  register: {
    unauthorized: "Invalid registration data. Please check your information.",
    default: "An error occurred during registration. Please try again.",
  },
  retailerAuth: {
    unauthorized:
      "Invalid or missing authentication token. Please login again.",
    default:
      "An error occurred during retailer authentication. Please try again.",
  },
  agencyCreation: {
    default: "An error occurred while creating agency. Please try again.",
  },
  storeCreation: {
    default: "An error occurred while creating store. Please try again.",
  },
};

export const getErrorMessage = (error, context = "general") => {
  if (!error) return ERROR_MESSAGES.general;

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

  const contextMessages = ERROR_MESSAGES[context];
  if (contextMessages && typeof contextMessages === "object") {
    return contextMessages.default || ERROR_MESSAGES.general;
  }

  return ERROR_MESSAGES.general;
};

export const getContextualErrorMessage = (error, context = "general") => {
  if (!error) {
    const contextMessages = ERROR_MESSAGES[context];
    if (contextMessages && typeof contextMessages === "object") {
      return contextMessages.default || ERROR_MESSAGES.general;
    }
    return ERROR_MESSAGES.general;
  }

  const statusCode = error.response?.status;
  const contextMessages = ERROR_MESSAGES[context];

  if (statusCode === 401 && contextMessages?.unauthorized) {
    return contextMessages.unauthorized;
  }

  if (statusCode === 429 && contextMessages?.tooManyRequests) {
    return contextMessages.tooManyRequests;
  }

  if (statusCode === 400) {
    return error.response?.data?.message || ERROR_MESSAGES.invalidRequest;
  }

  if (statusCode === 403) {
    const errorData = error.response?.data;
    const quota = errorData?.fields?.quota || errorData?.data?.quota || {};
    if (quota.hasAccess === false) {
      return "Voice AI feature aapke current subscription plan mein available nahi hai. Kripya apna plan upgrade karein.";
    }
    if (errorData?.message) {
      return errorData.message;
    }
    return ERROR_MESSAGES.forbidden;
  }

  if (statusCode >= 500) {
    return ERROR_MESSAGES.server;
  }

  if (isNetworkError(error)) {
    return ERROR_MESSAGES.network;
  }

  const message = getErrorMessage(error, context);
  if (message !== ERROR_MESSAGES.general) {
    return message;
  }

  if (contextMessages && typeof contextMessages === "object") {
    return contextMessages.default || ERROR_MESSAGES.general;
  }

  return ERROR_MESSAGES.general;
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
    message: errorData.message || ERROR_MESSAGES.quotaExceeded,
    quota: quotaData.quota || quotaData,
    resetTime: quotaData.resetTime || null,
    canUpgrade: quotaData.canUpgrade !== false,
  };
};

export const hasFieldErrors = (error) => {
  const errorData = error.response?.data || error.error || error;
  if (errorData.details?.additionalInfo) {
    const additionalInfo = errorData.details.additionalInfo;
    if (
      typeof additionalInfo === "object" &&
      Object.keys(additionalInfo).length > 0
    ) {
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
    if (
      typeof additionalInfo === "object" &&
      Object.keys(additionalInfo).length > 0
    ) {
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
      showToast(ERROR_MESSAGES.formErrors, "error");
    }
    return { type: "field", handled: true, fieldErrors };
  }

  const message = getContextualErrorMessage(error, context);
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
    if (showToast) showToast(ERROR_MESSAGES.unexpected, "error");
    return {
      handled: true,
      type: "general",
      message: ERROR_MESSAGES.unexpected,
    };
  }

  if (result.success) {
    if (successMessage && showToast) {
      showToast(successMessage, "success");
    }
    return { handled: false, type: "success", data: result.data };
  }

  if (result.statusCode === 403 && result.error) {
    const quotaData = {
      message: result.message || ERROR_MESSAGES.quotaExceeded,
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
        showToast(ERROR_MESSAGES.formErrors, "error");
      }
      return { type: "field", handled: true, fieldErrors };
    }
  }

  const message = result.message || getContextualErrorMessage(result, context);
  if (showToast) showToast(message, "error");

  return { type: "general", handled: true, message };
};

export default {
  getErrorMessage,
  getContextualErrorMessage,
  isQuotaError,
  getQuotaData,
  hasFieldErrors,
  getFieldErrors,
  isNetworkError,
  handleError,
  handleServiceResult,
  ERROR_MESSAGES,
};
