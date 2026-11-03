const withPrefix = (prefix, endpoints) =>
  Object.freeze(
    Object.fromEntries(
      Object.entries(endpoints).map(([key, path]) => [
        key,
        path ? `${prefix}${path.startsWith("/") ? path : `/${path}`}` : prefix,
      ])
    )
  );

const API_CONFIG = {
  // Base Configuration
  BASE: {
    URL: process.env.NEXT_PUBLIC_API_URL || "",
    TIMEOUT: process.env.NEXT_PUBLIC_API_TIMEOUT || 10000,
  },

  // Authentication
  AUTH: withPrefix("/auth", {
    BASE_URL: "",
    REFRESH: "/refresh",
    LOGOUT: "/logout",
    PROFILE: "/profile",
    NOTIFICATION_SETTINGS: "/settings/notification",
  }),

  // Core Business Endpoints
  CORE: withPrefix("/core", {
    // Products & Catalog
    PRODUCT: "/product",
    VARIANT: "/variant",
    CATEGORY: "/category",
    BRAND: "/brand",
    CATALOG: "/catalog",

    // Inventory & Stock
    INVENTORY: "/inventory",
    STOCK: "/stock",

    // Customers & Accounts
    CUSTOMER: "/customer",
    CUSTOMER_ACCOUNT: "/customer-account",
    CUSTOMER_ACCOUNT_PAYMENTS: "/customer-account/payments",
    CUSTOMER_ACCOUNT_COLLECT_LINK: "/customer-account/payments/collect-link",
    CUSTOMER_ACCOUNT_TRANSACTIONS: "/customer-account/transactions",

    // Suppliers & Procurement
    SUPPLIER: "/supplier",
    ACCOUNT: "/account",
    PURCHASE_ORDER: "/purchase-order",
    BILL: "/supplier-account/bills",
    PAYMENT: "/supplier-account/payments",

    // Sales & Invoices
    SALES_ORDER: "/sales-order",
    INVOICE: "/invoices",
    INVOICE_PAYMENT_LINK: "/invoices/:id/payment-link",
    PAYMENTS: "/payments",

    // Accounting & Expenses
    CASHBOOK: "/cashbook",
    EXPENSE: "/expense",

    // Store & Organization
    PROFILE: "/profile",
    STORE: "/store",
    AGENCY: "/agencies",
    STAFF: "/staff",
    SETTING: "/setting",
    SIGNATURE: "/signature",
    SUGGESTION: "/suggestion",

    // Analytics & Compliance
    DASHBOARD: "/dashboard",
    ANALYTICS: "/analytics",
    GST: "/gst",
    GST_VERIFY: "/gst/verify",
    INTEGRATIONS: "/integrations",

    // Subscriptions
    PACKAGES: "/packages",
    SUBSCRIPTION: "/subscription",

    // Public Catalog
    PUBLIC_CATALOG: "/public/products",
    PUBLIC_VARIANTS: "/public/variants",
    PUBLIC_CATEGORIES: "/public/categories",
    PUBLIC_TEMPLATES: "/public/templates",
  }),

  // Utility Endpoints
  UTILITY: withPrefix("/utility", {
    BASE_URL: "",
    SOCKET: "/socket.io",
    UPLOAD_URL: "/v1/storage/upload-url",
    DELETE_URL: "/v1/storage/file",
    FCM_REGISTER_DEVICE: "/v1/fcm/device",
    FCM_DELETE_TOKEN: "/v1/fcm/token",
    FCM_SEND: "/v1/fcm/send",
  }),

  // AI & Voice Orchestration
  AI: {
    ...withPrefix("/brain", {
      BASE_URL: "",
      CHAT: "/api/v1/chat",
      CHAT_STREAM: "/api/v1/chat/stream",
      CONFIRM: "/api/v1/chat/confirm",
      SESSIONS: "/api/v1/chat/sessions",
      SESSION_BY_ID: "/api/v1/chat/sessions/:sessionId",
      NOTIFICATIONS: "/api/v1/notifications",
      NOTIFICATION_READ: "/api/v1/notifications/:id/read",
      HEALTH: "/api/v1/health",
      READY: "/api/v1/ready",
    }),
    CHAT_TIMEOUT_MS: 45_000,
  },

  // Payment & Finance
  FINANCE: withPrefix("/finance", {
    CREATE_PACKAGE_PAYMENT: "/subscription/create-order",
    VERIFY_PACKAGE_PAYMENT: "/subscription/verify",
    INVOICES: "/billing/invoices",
    INVOICE_DOWNLOAD: "/billing/invoices/:invoiceId/download",
  }),
};

API_CONFIG.RETAILER = API_CONFIG.CORE;

export default API_CONFIG;
