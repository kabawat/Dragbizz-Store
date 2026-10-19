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
