import logger from "./logger";
import { extractFieldErrors } from "./validationErrorHandler";

const DEFAULT_ERROR_MESSAGE = "An error occurred. Please try again.";
const FORM_ERROR_MESSAGE = "Please fix the errors in the form";

export const getErrorMessage = (error) => {
  if (!error) return DEFAULT_ERROR_MESSAGE;

  const errorData = error.response?.data || error.error || error;

  return (
    errorData?.details?.title ||
    errorData?.details?.detail ||
    errorData?.message ||
    errorData?.error ||
    error?.message ||
    DEFAULT_ERROR_MESSAGE
  );
};

// Aliased for backward compatibility with existing imports
export const getContextualErrorMessage = getErrorMessage;

const getFieldErrors = (error) => {
  const errorData = error.response?.data || error.error || error;
  const additionalInfo = errorData?.details?.additionalInfo;

  // Use additionalInfo if it exists, otherwise use errorData
  const targetData =
    additionalInfo &&
      typeof additionalInfo === "object" &&
      Object.keys(additionalInfo).length > 0
      ? additionalInfo
      : errorData;

  return extractFieldErrors(targetData);
};

export const handleError = (error, options = {}) => {
  const { showToast = null, setFieldErrors = null, logError = true } = options;

  if (logError) {
    logger.error("Error:", error);
  }

  const fieldErrors = getFieldErrors(error);
  if (Object.keys(fieldErrors).length > 0) {
    if (setFieldErrors) setFieldErrors(fieldErrors);
    if (showToast) {
      showToast(FORM_ERROR_MESSAGE, "error");
    }
    return { type: "field", handled: true, fieldErrors };
  }

  const message = getErrorMessage(error);
  if (showToast) {
    showToast(message, "error");
  }

  return { type: "general", handled: true, message };
};

export const handleServiceResult = (result, options = {}) => {
  const { showToast = null, setFieldErrors = null, successMessage = null } = options;

  if (!result) {
    if (showToast) showToast(DEFAULT_ERROR_MESSAGE, "error");
    return {
      handled: true,
      type: "general",
      message: DEFAULT_ERROR_MESSAGE,
    };
  }

  if (result.success) {
    if (successMessage && showToast) {
      showToast(successMessage, "success");
    }
    return { handled: false, type: "success", data: result.data };
  }

  if (result.error?.fields) {
    const fieldErrors = extractFieldErrors(result.error);
    if (Object.keys(fieldErrors).length > 0) {
      if (setFieldErrors) setFieldErrors(fieldErrors);
      if (showToast) {
        showToast(FORM_ERROR_MESSAGE, "error");
      }
      return { type: "field", handled: true, fieldErrors };
    }
  }

  const message = result.message || getErrorMessage(result);
  if (showToast) showToast(message, "error");

  return { type: "general", handled: true, message };
};

export default {
  getErrorMessage,
  getContextualErrorMessage,
  handleError,
  handleServiceResult,
};
