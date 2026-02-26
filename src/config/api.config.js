// src/config/api.config.js
// API endpoints and service configuration

const API_CONFIG = {
  // Base API Configuration
  BASE: {
    URL: process.env.NEXT_PUBLIC_API_URL || "",
    TIMEOUT: process.env.NEXT_PUBLIC_API_TIMEOUT || 10000,
    VERSION: process.env.NEXT_PUBLIC_API_VERSION || "v1",
  },

  // Authentication Endpoints
  AUTH: {
    BASE_URL: "/auth",
    LOGIN: "/auth/login",
    LOGIN_VERIFY: "/auth/login",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
    REGISTER: "/auth/register",
    VERIFY_OTP: "/auth/register",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    VERIFY_EMAIL: "/auth/verify-email",
    RESEND_VERIFICATION: "/auth/resend-verification",
    PROFILE: "/auth/profile",
    NOTIFICATION_SETTINGS: "/auth/settings/notification",
    UPLOAD_INIT: "/auth/upload/init",
    UPLOAD_STATUS: "/auth/upload/status",
  },
  RETAILER: {
    INVENTORY: "/retailer/inventory",
    CUSTOMER: "/retailer/customer",
    SUPPLIER: "/retailer/supplier",
    CATEGORY: "/retailer/category",
    PRODUCT: "/retailer/product",
    ACCOUNT: "/retailer/account",
    PROFILE: "/retailer/profile",
    AGENCY: "/retailer/agencies",
    STORE: "/retailer/store",
    STOCK: "/retailer/stock",

    PURCHASE_ORDER: "/retailer/purchase-order",
    PAYMENT: "/retailer/supplier-account/payments",
    BILL: "/retailer/supplier-account/bills",
    INVOICE: "/retailer/invoices",
    EXPENSE: "/retailer/expense",
    DASHBOARD: "/retailer/dashboard",
    ANALYTICS: "/retailer/analytics",
    GST: "/retailer/gst",
    GST_VERIFY: "/retailer/gst/verify",
    PUBLIC_CATALOG: "/retailer/public/products",
    PUBLIC_CATEGORIES: "/retailer/public/categories",
    PUBLIC_SALES_ORDER: "/retailer/public/sales-order",
    SALES_ORDER: "/retailer/sales-order",
    SIGNATURE: "/retailer/signature",
    SUGGESTION: "/retailer/suggestion",
    STAFF: "/retailer/staff",
  },

  // Utility Service Endpoints
  UTILITY: {
    BASE_URL: "/utility",
    SOCKET: "/utility/socket.io",
  },

  // Voice AI Service Endpoints
  VOICE_AI: {
    CUSTOMER_CHAT: "/voice-ai/api/v1/customer/chat",
    SUPPLIER_CHAT: "/voice-ai/api/v1/supplier/chat",
    PRODUCT_EXTRACT: "/voice-ai/api/v1/product/extract-from-image",
  },

  // Subscription Service Endpoints
  SUBSCRIPTION: {
    PACKAGES: "/plans/packages",
    SUBSCRIPTIONS: "/plans/subscriptions",
    CHECKOUT: "/plans/checkout",
    PAYMENT: "/plans/payment",
    WEBHOOKS: "/plans/webhooks",
  },

  // External Services
  EXTERNAL: {
    GOOGLE_MAPS: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API || "",
    STRIPE: process.env.NEXT_PUBLIC_STRIPE_API || "",
    PAYPAL: process.env.NEXT_PUBLIC_PAYPAL_API || "",
    TWILIO: process.env.NEXT_PUBLIC_TWILIO_API || "",
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
