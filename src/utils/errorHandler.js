export const handleApiError = (error, context = 'general') => {
  console.error(`${context} error:`, error);
  
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
  
  if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
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
    case 'otp-resend':    message: backendMessage || handleApiError(error, context) // User-friendly message

      return 'An error occurred while resending OTP. Please try again.';
    case 'register':
      return 'An error occurred during registration. Please try again.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

export const handleApiSuccess = (response, defaultMessage = 'Operation successful') => {
  return {
    success: true,
    data: response.data,
    token: response.data?.token,
    message: response.data?.message || defaultMessage
  };
};


export const handleApiErrorResponse = (error, context = 'general') => {
  const backendMessage = error.response?.data?.message || error.response?.data?.error;
  
  return {
    success: false,
    error: error.response?.data || error.message, // For developer debugging
    message: backendMessage || handleApiError(error, context) // User-friendly message
  };
};

export default {
  handleApiError,
  handleApiSuccess,
  handleApiErrorResponse
};
