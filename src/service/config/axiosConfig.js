// src/service/config/axiosConfig.js
import axios from "axios";
import API_CONFIG from "@/config/api.config";

// Base config
const BASE_URL = API_CONFIG.BASE.URL;

// Common config
const commonConfig = {
  timeout: parseInt(API_CONFIG.BASE.TIMEOUT, 10),
  withCredentials: true, // Cookies
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "69420",
  },
};

// Unauth instance
export const unauthAxios = axios.create({
  ...commonConfig,
  baseURL: BASE_URL,
});

// Auth instance
export const authAxios = axios.create({
  ...commonConfig,
  baseURL: BASE_URL,
});

// Upload instance
export const uploadAxios = axios.create({
  ...commonConfig,
  baseURL: BASE_URL,
  headers: {
    ...commonConfig.headers,
    "Content-Type": "multipart/form-data",
  },
});

// Global refresh state
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

const setupAuthInterceptors = (instance) => {
  // Request interceptor
  instance.interceptors.request.use(
    (config) => {
      // Cookies handled by browser
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      if (axios.isCancel(error)) {
        return Promise.reject(error);
      }

      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // Queue requests while refreshing
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
          // Call refresh token
          const { default: authService } = await import(
            "@/service/auth/auth.service"
          );

          const refreshResponse = await authService.refreshToken();

          if (refreshResponse.success) {
            isRefreshing = false;
            processQueue(null);

            // Retry request
            return instance(originalRequest);
          } else {
            throw new Error("Token refresh failed");
          }
        } catch (refreshError) {
          // Refresh failed
          isRefreshing = false;
          processQueue(refreshError);

          // Redirect to login if on protected route
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

export default {
  authAxios,
  unauthAxios,
  uploadAxios,
};
