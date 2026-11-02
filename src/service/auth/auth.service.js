// src/service/auth/auth.service.js

import { API_CONFIG } from "@/config";
import { handleApiErrorResponse, handleApiSuccess } from "@/utils/errorHandler";
import { authAxios, unauthAxios } from "../config/axiosConfig";
import { getStoredFcmDeviceId } from "@/service/utility/fcm.service";

// Single in-flight refresh promise so /auth/refresh is only called once at a time
let refreshPromise = null;

class AuthService {
  constructor() {
    this.baseURL = API_CONFIG.BASE.URL;
  }

  // Refresh Access Token using Refresh Token (via cookies). Deduped.
  async refreshToken() {
    if (refreshPromise) return refreshPromise;
    refreshPromise = (async () => {
      try {
        const fcmDeviceId = getStoredFcmDeviceId();
        const body = fcmDeviceId ? { fcmDeviceId } : {};
        const response = await unauthAxios.post(API_CONFIG.AUTH.REFRESH, body);
        const result = handleApiSuccess(response, "Token refreshed successfully");
        if (!result.data) {
          return { success: false, message: "Refresh failed", error: "null_data" };
        }
        return result;
      } catch (error) {
        return handleApiErrorResponse(error, "token-refresh");
      } finally {
        refreshPromise = null;
      }
    })();
    return refreshPromise;
  }


  // Get authenticated user profile from auth service
  async getProfile() {
    try {
      const response = await authAxios.get(API_CONFIG.AUTH.PROFILE);
      return handleApiSuccess(response, "Profile fetched successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "get-profile");
    }
  }

  // Update authenticated user profile in auth service
  async updateProfile(profileData) {
    try {
      const response = await authAxios.put(
        API_CONFIG.AUTH.PROFILE,
        profileData
      );
      return handleApiSuccess(response, "Profile updated successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "update-profile");
    }
  }

  // Update password for the logged-in user
  async updatePassword(passwordData) {
    try {
      const response = await authAxios.put("/auth/password", passwordData);
      return handleApiSuccess(response, "Password updated successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "update-password");
    }
  }

  // Logout method
  async logout() {
    try {
      const response = await authAxios.post(API_CONFIG.AUTH.LOGOUT || "/auth/logout");
      return handleApiSuccess(response, "Logged out successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "logout");
    }
  }

  // Notification Settings
  async getNotificationSettings() {
    try {
      const response = await authAxios.get(API_CONFIG.AUTH.NOTIFICATION_SETTINGS);
      return handleApiSuccess(response, "Notification settings fetched successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "get-notification-settings");
    }
  }

  async updateNotificationSettings(settingsData) {
    try {
      const response = await authAxios.put(
        API_CONFIG.AUTH.NOTIFICATION_SETTINGS,
        settingsData
      );
      return handleApiSuccess(response, "Notification settings updated successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "update-notification-settings");
    }
  }

  async resetNotificationSettings() {
    try {
      const response = await authAxios.post(
        `${API_CONFIG.AUTH.NOTIFICATION_SETTINGS}/reset`
      );
      return handleApiSuccess(response, "Notification settings reset successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "reset-notification-settings");
    }
  }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;
