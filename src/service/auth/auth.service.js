// src/service/auth/auth.service.js

import { API_CONFIG } from "@/config";
import { handleApiErrorResponse, handleApiSuccess } from "@/utils/errorHandler";
import { getUserLocation } from "@/utils/locationUtils";
import { authAxios, unauthAxios } from "../config/axiosConfig";

class AuthService {
  constructor() {
    this.baseURL = API_CONFIG.BASE.URL;
  }

  async register(userData) {
    try {
      // Get user's current location
      const location = await getUserLocation();

      const response = await unauthAxios.post(API_CONFIG.AUTH.REGISTER, {
        firstName: userData.firstName,
        lastName: userData.lastName,
        identifier: userData.identifier,
        pwds: userData.pwds,
        location: location,
      });

      return handleApiSuccess(response, "Registration successful");
    } catch (error) {
      return handleApiErrorResponse(error, "register");
    }
  }

  async login(credentials) {
    try {
      const loginData = {
        identifier: credentials.identifier,
        pwds: credentials.password,
        useOtp: credentials.useOtp || false,
        deviceId: credentials.deviceId || `web_device_${Date.now()}`,
        platform: credentials.platform || "web",
        deviceToken: credentials.deviceToken || "",
        location: credentials.location || "0,0",
      };

      const response = await unauthAxios.post(API_CONFIG.AUTH.LOGIN, loginData);

      return handleApiSuccess(response, "Login successful");
    } catch (error) {
      return handleApiErrorResponse(error, "login");
    }
  }

  async sendOTP(credentials) {
    try {
      const loginData = {
        identifier: credentials.identifier,
        pwds: "", // Empty for OTP login
        useOtp: true,
        deviceId: credentials.deviceId || `web_device_${Date.now()}`,
        platform: credentials.platform || "web",
        deviceToken: credentials.deviceToken || "",
        location: credentials.location || "0,0",
      };
      const response = await unauthAxios.post(API_CONFIG.AUTH.LOGIN, loginData);

      return handleApiSuccess(response, "OTP sent successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "otp-send");
    }
  }

  // verify otp
  async verifyLoginOTP(otpData) {
    try {
      const { code, token } = otpData;

      if (!code) {
        return {
          success: false,
          message: "Verification code is required",
          error: "Missing OTP code",
        };
      }

      if (!token) {
        return {
          success: false,
          message: "OTP token is required",
          error: "Missing OTP token",
        };
      }

      // OTP verification uses PUT method
      // Convert location string "lat,lng" to object { latitude, longitude }
      let locationData = null;
      if (otpData.location) {
        if (typeof otpData.location === "string") {
          const [lat, lng] = otpData.location.split(",").map(Number);
          if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
            locationData = { latitude: lat, longitude: lng };
          }
        } else if (
          typeof otpData.location === "object" &&
          otpData.location.latitude &&
          otpData.location.longitude
        ) {
          locationData = otpData.location;
        }
      }

      const response = await unauthAxios.put(
        API_CONFIG.AUTH.LOGIN_VERIFY,
        {
          code: code,
          deviceId: otpData.deviceId || `web_device_${Date.now()}`,
          platform: otpData.platform || "web",
          deviceToken: otpData.deviceToken || "",
          location: locationData,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return handleApiSuccess(response, "OTP verified successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "otp");
    }
  }

  async forgotPassword(identifier) {
    try {
      const response = await unauthAxios.post(API_CONFIG.AUTH.FORGOT_PASSWORD, {
        identifier,
      });

      return {
        success: true,
        data: response.data,
        message: "Password reset email sent",
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message,
        message: error.response?.data?.message || "Failed to send reset email",
      };
    }
  }

  async resetPassword(resetData) {
    try {
      const response = await unauthAxios.post(API_CONFIG.AUTH.RESET_PASSWORD, {
        token: resetData.token,
        password: resetData.password,
      });

      return {
        success: true,
        data: response.data,
        message: "Password reset successful",
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message,
        message: error.response?.data?.message || "Password reset failed",
      };
    }
  }

  async verifyEmail(token) {
    try {
      const response = await unauthAxios.post(API_CONFIG.AUTH.VERIFY_EMAIL, {
        token,
      });

      return {
        success: true,
        data: response.data,
        message: "Email verified successfully",
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message,
        message: error.response?.data?.message || "Email verification failed",
      };
    }
  }

  async verifyRegistrationOTP(otp, token) {
    try {
      // Get user's current location
      const location = await getUserLocation();

      const response = await unauthAxios.put(
        API_CONFIG.AUTH.VERIFY_OTP,
        {
          otp: otp,
          location: location,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return handleApiSuccess(response, "OTP verified successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "otp");
    }
  }

  async resendRegistrationOTP(userData) {
    try {
      // Get user's current location
      const location = await getUserLocation();

      const response = await unauthAxios.post(API_CONFIG.AUTH.REGISTER, {
        firstName: userData.firstName,
        lastName: userData.lastName,
        identifier: userData.identifier,
        pwds: userData.pwds,
        location: location,
      });
      return handleApiSuccess(response, "OTP sent successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "otp-resend");
    }
  }

  async createAgency(agencyData, token) {
    try {
      const response = await unauthAxios.post("/agencies/", agencyData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return handleApiSuccess(response, "Agency created successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "agency-creation");
    }
  }

  async createStore(storeData, token) {
    try {
      const response = await unauthAxios.post("/store/", storeData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return handleApiSuccess(response, "Store created successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "store-creation");
    }
  }

  // Refresh Access Token using Refresh Token
  async refreshToken(refreshToken) {
    try {
      const response = await unauthAxios.post(API_CONFIG.AUTH.REFRESH, null, {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      });

      return handleApiSuccess(response, "Token refreshed successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "token-refresh");
    }
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
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;
