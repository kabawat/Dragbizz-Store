export const handleApiError = (error, context = 'general') => {
  // Handle specific HTTP status codes
  if (error.response?.status === 401) {
    switch (context) {
      case 'login':
        return 'Invalid email/phone or password. Please check your credentials.';
      case 'otp':
        return 'Invalid or expired OTP. Please request a new code.';
      case 'otp-send':
        return 'Invalid email/phone number. Please check your credentials.';
      case 'otp-resend':
        return 'Session expired. Please start login again.';
      case 'register':
        return 'Invalid registration data. Please check your information.';
      case 'retailer-auth':
        return 'Invalid or missing authentication token. Please login again.';
      default:
        return 'Invalid credentials. Please check your information.';
    }
  }

  if (error.response?.status === 400) {
    return error.response?.data?.message || 'Invalid request. Please check your input.';
  }

  if (error.response?.status === 429) {
    switch (context) {
      case 'login':
        return 'Too many login attempts. Please try again later.';
      case 'otp':
        return 'Too many verification attempts. Please try again later.';
      case 'otp-send':
        return 'Too many OTP requests. Please try again later.';
      case 'otp-resend':
        return 'Too many resend requests. Please wait before trying again.';
      default:
        return 'Too many requests. Please try again later.';
    }
  }

  if (error.response?.status >= 500) {
    return 'Server error. Please try again later.';
  }

  // Check for network errors
  const isNetworkError = error.code === 'ERR_NETWORK' || 
                        error.code === 'NETWORK_ERROR' || 
                        error.message === 'Network Error' ||
                        (!error.response && error.request) ||
                        (error.message && error.message.includes('Network Error')) ||
                        (!navigator.onLine);

  if (isNetworkError) {
    // Show toast will be handled by axios interceptor
    return 'Network error. Please check your internet connection.';
  }

  // Default error message
  switch (context) {
    case 'login':
      return 'An error occurred during login. Please try again.';
    case 'otp':
      return 'An error occurred during verification. Please try again.';
    case 'otp-send':
      return 'An error occurred while sending OTP. Please try again.';
    case 'otp-resend':
      return 'An error occurred while resending OTP. Please try again.';
    case 'register':
      return 'An error occurred during registration. Please try again.';
    case 'retailer-auth':
      return 'An error occurred during retailer authentication. Please try again.';
    case 'agency-creation':
      return 'An error occurred while creating agency. Please try again.';
    case 'store-creation':
      return 'An error occurred while creating store. Please try again.';
  }
};

export const handleApiSuccess = (response, defaultMessage = 'Operation successful') => {
  const result = {
    success: true,
    data: response.data,
    token: response?.data?.token,
    message: response?.data?.message || defaultMessage
  };
  
  // Preserve nextCursor if it exists at root level of response
  if (response?.nextCursor) {
    result.nextCursor = response.nextCursor;
  }
  
  // Preserve pagination if it exists
  if (response?.pagination) {
    result.pagination = response.pagination;
  }
  
  // Also preserve meta.nextCursor if it exists
  if (response?.meta?.nextCursor) {
    result.nextCursor = response.meta.nextCursor;
  }
  
  return result;
};


export const handleApiErrorResponse = (error, context = 'general') => {
  const backendMessage = error.response?.data?.message || error.response?.data?.error;
  const statusCode = error.response?.status;

  // Check for network errors and show toast
  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || (!error.response && error.request)) {
    // Show network error toast at bottom center
    if (typeof window !== 'undefined') {
      // Try to get global toast
      try {
        // Dynamic import to avoid circular dependency
        import('@/contexts/ToastContext').then(({ useGlobalToast }) => {
          // This will be handled by axios interceptor, but we can also handle here
          // The toast will be shown by axios interceptor
        }).catch(() => {
          // Toast will be shown by axios interceptor
        });
      } catch (e) {
        // Toast will be shown by axios interceptor
      }
    }
  }

  return {
    success: false,
    error: error.response?.data || error.message,
    message: backendMessage || handleApiError(error, context),
    statusCode: statusCode // Preserve HTTP status code for quota error detection
  };
};

export default {
  handleApiError,
  handleApiSuccess,
  handleApiErrorResponse
};
