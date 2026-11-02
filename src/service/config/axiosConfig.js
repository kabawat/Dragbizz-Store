import { createSessionRecovery } from "@dragorbit/core/auth";
// src/service/config/axiosConfig.js
import axios from "axios";
import API_CONFIG from "@/config/api.config";
import {
  hasValidStoreOnConfig,
  markPendingStoreIdToastSuppress,
  urlNeedsStoreParam,
} from "@/utils/bootstrapStoreGuard";

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

// In-flight GET request deduplication map to prevent duplicate concurrent network calls
const inFlightRequests = new Map();

export const createDeduplicatingAdapter = (baseAdapter) => async (config) => {
  const method = (config.method || "get").toLowerCase();
  // Only deduplicate safe, idempotent GET requests unless explicitly disabled
  if (method !== "get" || config.skipDeduplication) {
    return baseAdapter(config);
  }
  const key = [
    method,
    config.baseURL || "",
    config.url || "",
    JSON.stringify(config.params || {}),
  ].join("::");

  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key);
  }

  const promise = (async () => {
    try {
      return await baseAdapter(config);
    } finally {
      inFlightRequests.delete(key);
    }
  })();

  inFlightRequests.set(key, promise);
  return promise;
};

// The browser XHR adapter is unavailable during Next.js server rendering.
// Select the runtime's supported adapter before wrapping it for GET dedupe.
const runtimeAdapter = typeof window === "undefined" ? "http" : "xhr";
const defaultAdapter = axios.getAdapter(commonConfig.adapter || runtimeAdapter);
const deduplicatingAdapter = createDeduplicatingAdapter(defaultAdapter);

// Unauth instance
export const unauthAxios = axios.create({
  ...commonConfig,
  baseURL: BASE_URL,
  adapter: deduplicatingAdapter,
});

// Auth instance
export const authAxios = axios.create({
  ...commonConfig,
  baseURL: BASE_URL,
  adapter: deduplicatingAdapter,
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

const recoverSession = createSessionRecovery({
  refresh: async () => {
    const { default: authService } = await import(
      "@/service/auth/auth.service"
    );
    return authService.refreshToken();
  },
  onExpired: () => {
    if (typeof window !== "undefined")
      window.dispatchEvent(new Event("dragbizz:session-expired"));
  },
});
const setupAuthInterceptors = (instance) => {
  instance.interceptors.request.use((config) => {
    const requestPath = String(config?.url || "").split("?")[0];
    const isPrivateRead =
      config?.method?.toLowerCase() === "get" &&
      (/^\/?auth\//.test(requestPath) || /^\/?retailer\//.test(requestPath));

    if (isPrivateRead) {
      if (typeof config.headers?.set === "function") {
        config.headers.set("Cache-Control", "no-store");
        config.headers.set("Pragma", "no-cache");
      } else {
        config.headers = {
          ...config.headers,
          "Cache-Control": "no-store",
          Pragma: "no-cache",
        };
      }
    }

    if (
      urlNeedsStoreParam(String(config?.url || "")) &&
      !hasValidStoreOnConfig(config)
    )
      config.__bootstrapBadStore = true;
    return config;
  });
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const message =
        error?.response?.data?.message || error?.response?.data?.error || "";
      if (
        /invalid or missing store id/i.test(String(message)) &&
        error?.config?.__bootstrapBadStore
      )
        markPendingStoreIdToastSuppress();
      if (axios.isCancel(error)) throw error;
      return recoverSession(error, (request) => instance(request));
    }
  );
};
setupAuthInterceptors(authAxios);
setupAuthInterceptors(uploadAxios);
export default { authAxios, unauthAxios, uploadAxios };
