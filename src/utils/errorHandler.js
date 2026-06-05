const DEFAULT_ERROR_MESSAGE = "An error occurred. Please try again.";

function getApiErrorMessage(error) {
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
}

export const handleApiError = (error) => getApiErrorMessage(error);

export const handleApiSuccess = (
  response,
  defaultMessage = "Operation successful"
) => {
  const body = response?.data ?? response;
  const result = {
    success: true,
    data: body?.data ?? body,
    token: body?.token ?? response?.token,
    message: body?.message ?? response?.message ?? defaultMessage,
    meta: body?.meta ?? response?.meta,
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

export const handleApiErrorResponse = (error) => {
  const backendMessage =
    error.response?.data?.message || error.response?.data?.error;
  const statusCode = error.response?.status;

  return {
    success: false,
    error: error.response?.data || error.message,
    message: backendMessage || getApiErrorMessage(error),
    statusCode,
  };
};
