/**
 * Utility to handle validation errors from API responses
 * Converts API field errors to a format that can be used with form fields
 */

/**
 * Converts API field errors to a format compatible with form field names
 * Handles nested fields like addresses[0].pincode -> addresses.0.pincode
 * 
 * @param {Object} errorResponse - The error response from API
 * @returns {Object} - Object with field names as keys and error messages as values
 */
export const extractFieldErrors = (errorResponse) => {
  const fieldErrors = {};

  // Check various possible locations for field errors
  let errorFields = null;

  if (errorResponse?.data?.fields) {
    errorFields = errorResponse.data.fields;
  } else if (errorResponse?.data?.data?.fields) {
    errorFields = errorResponse.data.data.fields;
  } else if (errorResponse?.fields) {
    errorFields = errorResponse.fields;
  } else if (errorResponse?.error?.data?.fields) {
    errorFields = errorResponse.error.data.fields;
  } else if (errorResponse?.error?.fields) {
    errorFields = errorResponse.error.fields;
  }

  if (!errorFields || typeof errorFields !== 'object') {
    return fieldErrors;
  }

  // Convert field names from API format to form field format
  // e.g., addresses[0].pincode -> addresses.0.pincode
  Object.keys(errorFields).forEach((key) => {
    // Convert array notation [0] to dot notation .0
    const convertedKey = key.replace(/\[(\d+)\]/g, '.$1');
    
    // Get error message (could be string or array)
    const errorMessage = errorFields[key];
    const message = Array.isArray(errorMessage) 
      ? errorMessage[0] 
      : errorMessage;

    if (message) {
      fieldErrors[convertedKey] = message;
    }
  });

  return fieldErrors;
};

/**
 * Gets error message for a specific field
 * 
 * @param {Object} fieldErrors - Object containing field errors
 * @param {string} fieldName - Name of the field (supports dot notation like 'addresses.0.pincode')
 * @returns {string|null} - Error message or null if no error
 */
export const getFieldError = (fieldErrors, fieldName) => {
  if (!fieldErrors || !fieldName) return null;
  return fieldErrors[fieldName] || null;
};

/**
 * Clears error for a specific field
 * 
 * @param {Object} fieldErrors - Current field errors object
 * @param {string} fieldName - Name of the field to clear
 * @returns {Object} - New field errors object without the specified field
 */
export const clearFieldError = (fieldErrors, fieldName) => {
  if (!fieldErrors || !fieldName) return fieldErrors;
  
  const newErrors = { ...fieldErrors };
  delete newErrors[fieldName];
  
  // Also clear nested errors (e.g., if clearing 'addresses', clear 'addresses.0.pincode')
  Object.keys(newErrors).forEach((key) => {
    if (key.startsWith(`${fieldName}.`)) {
      delete newErrors[key];
    }
  });
  
  return newErrors;
};

/**
 * Clears all errors for fields that start with a prefix
 * Useful for clearing nested field errors
 * 
 * @param {Object} fieldErrors - Current field errors object
 * @param {string} prefix - Prefix to match (e.g., 'addresses', 'companyDetails')
 * @returns {Object} - New field errors object without matching fields
 */
export const clearFieldErrorsByPrefix = (fieldErrors, prefix) => {
  if (!fieldErrors || !prefix) return fieldErrors;
  
  const newErrors = { ...fieldErrors };
  Object.keys(newErrors).forEach((key) => {
    if (key === prefix || key.startsWith(`${prefix}.`)) {
      delete newErrors[key];
    }
  });
  
  return newErrors;
};

export default {
  extractFieldErrors,
  getFieldError,
  clearFieldError,
  clearFieldErrorsByPrefix
};

