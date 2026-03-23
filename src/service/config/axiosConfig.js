// src/service/config/axiosConfig.js
import axios from "axios";
import API_CONFIG from "@/config/api.config";
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
export const setGlobalToast = (showErrorFn) => {
  globalToastShowError = showErrorFn;
};

// Base configuration
const BASE_URL = API_CONFIG.BASE.URL;

// Common configuration for all axios instances
const commonConfig = {
  timeout: parseInt(API_CONFIG.BASE.TIMEOUT, 10),
  withCredentials: true, // Crucial for sending cookies
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "69420",
    "X-Requested-With": "XMLHttpRequest" // CSRF protection header
  },
};

// Unauthenticated axios instance
export const unauthAxios = axios.create({
  ...commonConfig,
  baseURL: BASE_URL,
});

// Authenticated axios instance (for auth service)
export const authAxios = axios.create({
  ...commonConfig,
  baseURL: BASE_URL,
});

// Axios instance for file uploads (authenticated)
export const uploadAxios = axios.create({
  ...commonConfig,
  baseURL: BASE_URL,
  headers: {
    ...commonConfig.headers,
    "Content-Type": "multipart/form-data",
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

const setupAuthInterceptors = (instance) => {
  // Request interceptor for authenticated requests
  instance.interceptors.request.use(
    (config) => {
      // No need to manually attach token, cookies are handled by browser

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

  instance.interceptors.response.use(
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

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => {
              return instance(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Call refresh token endpoint (browser will automatically send the rt cookie)
          const { default: authService } = await import(
            "@/service/auth/auth.service"
          );

          const refreshResponse = await authService.refreshToken();

          if (refreshResponse.success) {
            isRefreshing = false;
            processQueue(null);

            // Retry original request (browser will now have the new at cookie)
            return instance(originalRequest);
          } else {
            throw new Error("Token refresh failed");
          }
        } catch (refreshError) {
          // Refresh failed
          isRefreshing = false;
          processQueue(refreshError);

          // Only redirect to login when user is on a protected/dashboard route.
          if (typeof window !== "undefined") {
            const pathname = window.location.pathname || "";
            const protectedPrefixes = ["/dashboard", "/profile", "/settings", "/admin", "/onboarding"];
            const isProtectedRoute = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
            if (isProtectedRoute) {
              window.location.href = "/login";
            }
          }

          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};

setupAuthInterceptors(authAxios);
setupAuthInterceptors(uploadAxios);

// Response interceptor for unauthenticated requests
unauthAxios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {

    return Promise.reject(error);
  }
);

export default {
  authAxios,
  unauthAxios,
  uploadAxios,
};
