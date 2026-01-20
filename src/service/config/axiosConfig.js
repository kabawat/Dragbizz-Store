// src/service/config/axiosConfig.js
import axios from "axios";
import API_CONFIG from "@/config/api.config";
import { cookieManager } from "@/utils/cookieManager";
import { generateCacheKey, setCachedResponse } from "@/utils/requestCache";
import {
  createCancelToken,
  getRequestKey as getCancelKey,
  removeCancelToken,
} from "@/utils/requestCancellation";
import {
  getRequestKey as getDedupKey,
  getPendingRequest,
  setPendingRequest,
} from "@/utils/requestDeduplication";

let globalToastShowError = null;
let networkErrorHandler = null;

export const setGlobalToast = (showErrorFn) => {
  globalToastShowError = showErrorFn;
};

export const setNetworkErrorHandler = (handler) => {
  networkErrorHandler = handler;
};

// Base configuration
const BASE_URL = API_CONFIG.BASE.URL;

// Common configuration for all axios instances
const commonConfig = {
  timeout: parseInt(API_CONFIG.BASE.TIMEOUT, 10),
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "69420",
  },
};

// Unauthenticated axios instance
export const unauthAxios = axios.create({
  ...commonConfig,
  baseURL: BASE_URL,
  headers: {
    "ngrok-skip-browser-warning": "69420",
  },
});

// Authenticated axios instance (for auth service)
export const authAxios = axios.create({
  ...commonConfig,
  baseURL: BASE_URL,
  headers: {
    "ngrok-skip-browser-warning": "69420",
  },
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor for authenticated requests (auth service)
authAxios.interceptors.request.use(
  (config) => {
    const token = cookieManager.getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const method = config.method?.toUpperCase() || "GET";
    const url = config.url || "";
    const params = config.params || {};

    const cacheKey = generateCacheKey(url, method, params);
    const dedupKey = getDedupKey(url, method, params);
    const cancelKey = getCancelKey(url, method, params);

    config.metadata = {
      cacheKey,
      dedupKey,
      cancelKey,
      useCache: config.useCache !== false && method === "GET",
      useDeduplication: config.useDeduplication !== false,
      useCancellation: config.useCancellation !== false,
    };

    if (config.metadata.useCancellation) {
      config.cancelToken = createCancelToken(config.metadata.cancelKey);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

authAxios.interceptors.response.use(
  (response) => {
    const { metadata } = response.config || {};

    if (metadata?.useCache && response.config.method?.toUpperCase() === "GET") {
      setCachedResponse(metadata.cacheKey, response.data);
    }

    if (metadata?.useDeduplication) {
      const pending = getPendingRequest(metadata.dedupKey);
      if (pending) {
        setPendingRequest(metadata.dedupKey, Promise.resolve(response));
      }
    }

    if (metadata?.cancelKey) {
      removeCancelToken(metadata.cancelKey);
    }

    return response;
  },
  async (error) => {
    if (error.__cached) {
      return Promise.resolve({
        ...error.config,
        data: error.data,
        fromCache: true,
      });
    }

    if (error.__deduplicated) {
      return error.promise.then((response) => ({
        ...error.config,
        ...response,
        fromDeduplication: true,
      }));
    }

    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    if (originalRequest?.metadata?.cancelKey) {
      removeCancelToken(originalRequest.metadata.cancelKey);
    }

    // Check for network errors
    const isNetworkError =
      error.code === "ERR_NETWORK" ||
      error.message === "Network Error" ||
      (!error.response && error.request) ||
      error.message?.includes("Network Error");

    if (isNetworkError) {
      if (typeof window !== "undefined") {
        if (networkErrorHandler) {
          networkErrorHandler();
        }
        if (globalToastShowError) {
          globalToastShowError(
            "Network error. Please check your internet connection and try again."
          );
        }
      }
      return Promise.reject(error);
    }

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return authAxios(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = cookieManager.getRefreshToken();

      // If no refresh token, logout
      if (!refreshToken) {
        isRefreshing = false;
        processQueue(error, null);
        cookieManager.clearAuth();

        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      try {
        // Import authService dynamically to avoid circular dependency
        const { default: authService } = await import(
          "@/service/auth/auth.service"
        );

        // Call refresh token endpoint
        const refreshResponse = await authService.refreshToken(refreshToken);

        if (refreshResponse.success && refreshResponse.data) {
          // Handle nested data structure
          const responseData =
            refreshResponse.data.data || refreshResponse.data;
          const { token: newAccessToken, refreshToken: newRefreshToken } =
            responseData;

          // Save new tokens
          if (newAccessToken) {
            cookieManager.setAuthToken(newAccessToken);
          }
          if (newRefreshToken) {
            cookieManager.setRefreshToken(newRefreshToken);
          }

          // Update original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          isRefreshing = false;
          processQueue(null, newAccessToken);

          // Retry original request
          return authAxios(originalRequest);
        } else {
          throw new Error("Token refresh failed");
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        isRefreshing = false;
        processQueue(refreshError, null);
        cookieManager.clearAuth();

        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Response interceptor for unauthenticated requests
unauthAxios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Check for network errors
    const isNetworkError =
      error.code === "ERR_NETWORK" ||
      error.message === "Network Error" ||
      (!error.response && error.request) ||
      error.message?.includes("Network Error");

    if (isNetworkError) {
      if (typeof window !== "undefined") {
        if (networkErrorHandler) {
          networkErrorHandler();
        }
        if (globalToastShowError) {
          globalToastShowError(
            "Network error. Please check your internet connection and try again."
          );
        }
      }
    }
    return Promise.reject(error);
  }
);

export default {
  authAxios,
  unauthAxios,
};
