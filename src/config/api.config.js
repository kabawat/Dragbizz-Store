const API_CONFIG = {
  BASE: {
    URL: process.env.NEXT_PUBLIC_API_URL || "",
    TIMEOUT: process.env.NEXT_PUBLIC_API_TIMEOUT || 10000,
    VERSION: process.env.NEXT_PUBLIC_API_VERSION || "v1",
  },

  // Authentication Endpoints
  AUTH: {
    BASE_URL: "/auth",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
    PROFILE: "/auth/profile",
    NOTIFICATION_SETTINGS: "/auth/settings/notification",
  },
  RETAILER: {
    INVENTORY: "/retailer/inventory",
    CUSTOMER: "/retailer/customer",
    CUSTOMER_ACCOUNT: "/retailer/customer-account",
    CUSTOMER_ACCOUNT_PAYMENTS: "/retailer/customer-account/payments",
    CUSTOMER_ACCOUNT_COLLECT_LINK: "/retailer/customer-account/payments/collect-link",
    CUSTOMER_ACCOUNT_TRANSACTIONS: "/retailer/customer-account/transactions",
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
    INVOICE_PAYMENT_LINK: "/retailer/invoices/:id/payment-link",
    PAYMENTS: "/retailer/payments",
    EXPENSE: "/retailer/expense",
    CASHBOOK: "/retailer/cashbook",
    DASHBOARD: "/retailer/dashboard",
    ANALYTICS: "/retailer/analytics",
    GST: "/retailer/gst",
    GST_VERIFY: "/retailer/gst/verify",
    INTEGRATIONS: "/retailer/integrations",
    PUBLIC_CATALOG: "/retailer/public/products",
    PUBLIC_CATEGORIES: "/retailer/public/categories",
    PUBLIC_TEMPLATES: "/retailer/public/templates",
    SALES_ORDER: "/retailer/sales-order",
    SIGNATURE: "/retailer/signature",
    SUGGESTION: "/retailer/suggestion",
    STAFF: "/retailer/staff",
    SUBSCRIPTION: "/retailer/subscription",
  },

  UTILITY: {
    BASE_URL: "/utility",
    SOCKET: "/utility/socket.io",
    UPLOAD_URL: "/utility/v1/storage/upload-url",
    DELETE_URL: "/utility/v1/storage/file",
    FCM_REGISTER_DEVICE: "/utility/v1/fcm/device",
    FCM_DELETE_TOKEN: "/utility/v1/fcm/token",
    FCM_SEND: "/utility/v1/fcm/send",
  },

  // AI / Voice orchestration (nginx → dragbizz-ai :4004)
  AI: {
    BASE_URL: "/brain",
    CHAT: "/brain/api/v1/chat",
    CONFIRM: "/brain/api/v1/chat/confirm",
    HEALTH: "/brain/api/v1/health",
    READY: "/brain/api/v1/ready",
    CHAT_TIMEOUT_MS: 45_000,
  },

  // Subscription Service Endpoints
  SUBSCRIPTION: {
    SUBSCRIPTIONS: "/plans/subscription",
    USAGE: "/plans/usage",
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
