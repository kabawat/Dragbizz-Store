import { getContextualErrorMessage } from "./errorHandling";

export const handleApiError = (error, context = "general") => {
  return getContextualErrorMessage(error, context);
};

export const handleApiSuccess = (
  response,
  defaultMessage = "Operation successful"
) => {
  const result = {
    success: true,
    data: response?.data?.data || response?.data || response,
    token: response?.data?.token || response?.token,
    message: response?.data?.message || response?.message || defaultMessage,
    meta: response?.data?.meta || response?.meta,
  };

  if (response?.nextCursor) {
    result.nextCursor = response.nextCursor;
  }

  if (response?.pagination) {
    result.pagination = response.pagination;
  }

  if (response?.meta?.nextCursor) {
    result.nextCursor = response.meta.nextCursor;
  }

  return result;
};

export const handleApiErrorResponse = (error, context = "general") => {
  const backendMessage = error.response?.data?.message || error.response?.data?.error;
  const statusCode = error.response?.status;

  return {
    success: false,
    error: error.response?.data || error.message,
    message: backendMessage || getContextualErrorMessage(error, context),
    statusCode: statusCode,
  };
};

export default {
  handleApiError,
  handleApiSuccess,
  handleApiErrorResponse,
};
