// src/service/config/axiosConfig.js
import axios from 'axios';
import { cookieManager } from '@/utils/cookieManager';
import { ENV_CONFIG, API_CONFIG } from '@/config';

// Base configuration
const BASE_URL = API_CONFIG.BASE.URL;

// Common configuration for all axios instances
const commonConfig = {
  timeout: parseInt(API_CONFIG.BASE.TIMEOUT),
  headers: {
    'Content-Type': 'application/json',
  },
};

// Unauthenticated axios instance
export const unauthAxios = axios.create({
  ...commonConfig,
  baseURL: BASE_URL,
});

// Authenticated axios instance
export const authAxios = axios.create({
  ...commonConfig,
  baseURL: BASE_URL,
});

// Request interceptor for authenticated requests
authAxios.interceptors.request.use(
  (config) => {
    const token = cookieManager.getAuthToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
authAxios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      cookieManager.clearAuth();
      
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
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
    return Promise.reject(error);
  }
);

export default {
  authAxios,
  unauthAxios,
};
