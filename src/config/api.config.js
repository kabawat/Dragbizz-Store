// src/config/api.config.js
// API endpoints and service configuration

const API_CONFIG = {
  // Base API Configuration
  BASE: {
    URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
    TIMEOUT: process.env.NEXT_PUBLIC_API_TIMEOUT || 10000,
    VERSION: process.env.NEXT_PUBLIC_API_VERSION || 'v1',
  },
  
  // Authentication Endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    CHANGE_PASSWORD: '/auth/change-password',
    PROFILE: '/auth/profile',
  },
  
  // User Management
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    UPLOAD_AVATAR: '/users/avatar',
    DELETE_ACCOUNT: '/users/delete',
    GET_USER: '/users/:id',
    SEARCH_USERS: '/users/search',
  },
  
  // Product Management
  PRODUCTS: {
    BASE: '/products',
    CREATE: '/products',
    UPDATE: '/products/:id',
    DELETE: '/products/:id',
    GET_ALL: '/products',
    GET_BY_ID: '/products/:id',
    SEARCH: '/products/search',
    CATEGORIES: '/products/categories',
    FEATURED: '/products/featured',
    RECENT: '/products/recent',
  },
  
  // Order Management
  ORDERS: {
    BASE: '/orders',
    CREATE: '/orders',
    UPDATE: '/orders/:id',
    CANCEL: '/orders/:id/cancel',
    GET_ALL: '/orders',
    GET_BY_ID: '/orders/:id',
    GET_USER_ORDERS: '/orders/user/:userId',
    GET_STATUS: '/orders/:id/status',
    UPDATE_STATUS: '/orders/:id/status',
  },
  
  // Cart Management
  CART: {
    BASE: '/cart',
    ADD_ITEM: '/cart/add',
    REMOVE_ITEM: '/cart/remove',
    UPDATE_QUANTITY: '/cart/update',
    CLEAR: '/cart/clear',
    GET_ITEMS: '/cart/items',
    GET_TOTAL: '/cart/total',
  },
  
  // Payment Processing
  PAYMENTS: {
    BASE: '/payments',
    CREATE_INTENT: '/payments/create-intent',
    CONFIRM_PAYMENT: '/payments/confirm',
    REFUND: '/payments/refund',
    GET_HISTORY: '/payments/history',
    GET_METHODS: '/payments/methods',
    ADD_METHOD: '/payments/methods/add',
    REMOVE_METHOD: '/payments/methods/remove',
  },
  
  // File Upload
  UPLOAD: {
    BASE: '/upload',
    IMAGE: '/upload/image',
    DOCUMENT: '/upload/document',
    AVATAR: '/upload/avatar',
    PRODUCT_IMAGE: '/upload/product',
    BULK_UPLOAD: '/upload/bulk',
  },
  
  // Notifications
  NOTIFICATIONS: {
    BASE: '/notifications',
    GET_ALL: '/notifications',
    MARK_READ: '/notifications/:id/read',
    MARK_ALL_READ: '/notifications/read-all',
    DELETE: '/notifications/:id',
    DELETE_ALL: '/notifications/delete-all',
    PREFERENCES: '/notifications/preferences',
  },
  
  // Admin Endpoints
  ADMIN: {
    BASE: '/admin',
    USERS: '/admin/users',
    PRODUCTS: '/admin/products',
    ORDERS: '/admin/orders',
    ANALYTICS: '/admin/analytics',
    SETTINGS: '/admin/settings',
    REPORTS: '/admin/reports',
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
