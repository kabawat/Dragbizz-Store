// src/config/api.config.js
// API endpoints and service configuration

const API_CONFIG = {
  // Base API Configuration
  BASE: {
    URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost',
    TIMEOUT: process.env.NEXT_PUBLIC_API_TIMEOUT || 10000,
    VERSION: process.env.NEXT_PUBLIC_API_VERSION || 'v1',
  },
  
  // Authentication Endpoints
  AUTH: {
    LOGIN: '/auth/login',
    LOGIN_VERIFY: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY_OTP: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    PROFILE: '/auth/profile',
  },
  RETAILER: {
    PROFILE: '/retailer/profile',
    AGENCY: '/retailer/agencies',
    STORE: '/retailer/store',
    PRODUCT: '/retailer/product',
    CUSTOMER: '/retailer/customer',
    SUPPLIER: '/retailer/supplier',
    INVENTORY: '/retailer/inventory',
    CATEGORY: '/retailer/category',
    BILL: '/retailer/bill',
    PAYMENT: '/retailer/payment',
    ACCOUNT: '/retailer/account',
    PURCHASE_ORDER: '/retailer/purchase-order',
    STOCK: '/retailer/stock',
  },
    
  // External Services
  EXTERNAL: {
    GOOGLE_MAPS: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API || '',
    STRIPE: process.env.NEXT_PUBLIC_STRIPE_API || '',
    PAYPAL: process.env.NEXT_PUBLIC_PAYPAL_API || '',
    TWILIO: process.env.NEXT_PUBLIC_TWILIO_API || '',
  },
  
  // Request Configuration
  REQUEST: {
    RETRY_ATTEMPTS: process.env.NEXT_PUBLIC_API_RETRY_ATTEMPTS || 3,
    RETRY_DELAY: process.env.NEXT_PUBLIC_API_RETRY_DELAY || 1000,
    CACHE_DURATION: process.env.NEXT_PUBLIC_API_CACHE_DURATION || 300000, // 5 minutes
  },
  
  // Response Configuration
  RESPONSE: {
    SUCCESS_CODES: [200, 201, 202],
    ERROR_CODES: [400, 401, 403, 404, 422, 500],
    TIMEOUT_CODE: 408,
  },
};

export default API_CONFIG;
