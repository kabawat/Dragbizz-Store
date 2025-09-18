// src/service/auth/authService.js
import { unauthAxios } from '../config/axiosConfig';
import { API_CONFIG } from '@/config';
import { getUserLocation } from '@/utils/locationUtils';
import { handleApiSuccess, handleApiErrorResponse } from '@/utils/errorHandler';


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
        location: location
      });

      return handleApiSuccess(response, 'Registration successful');
    } catch (error) {
      return handleApiErrorResponse(error, 'register');
    }
  }


  async login(credentials) {
    try {
      const loginData = {
        identifier: credentials.identifier,
        pwds: credentials.password,
        useOtp: credentials.useOtp || false,
        deviceId: credentials.deviceId || 'web_device_' + Date.now(),
        platform: credentials.platform || 'web',
        token: credentials.deviceToken || '',
        location: credentials.location || '0,0'
      };

      console.log('AuthService - Login request:', loginData);

      const response = await unauthAxios.post(API_CONFIG.AUTH.LOGIN, loginData);

      return handleApiSuccess(response, 'Login successful');
    } catch (error) {
      return handleApiErrorResponse(error, 'login');
    }
  }

  async sendOTP(credentials) {
    try {
      const loginData = {
        identifier: credentials.identifier,
        pwds: '', // Empty for OTP login
        useOtp: true,
        deviceId: credentials.deviceId || 'web_device_' + Date.now(),
        platform: credentials.platform || 'web',
        token: credentials.deviceToken || '',
        location: credentials.location || '0,0'
      };

      console.log('AuthService - Send OTP request:', loginData);

      const response = await unauthAxios.post(API_CONFIG.AUTH.LOGIN, loginData);

      return handleApiSuccess(response, 'OTP sent successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'otp-send');
    }
  }

  /**
   * Get retailer service token using auth service token
   * This is called after successful auth service login
   * Acts as a refresh token mechanism for retailer service
   */
  async getRetailerToken(authServiceToken) {
    try {
      console.log('AuthService - Refreshing retailer token with auth service token');
      
      const response = await unauthAxios.post('/retailer/auth/', {}, {
        headers: { 
          'Authorization': `Bearer ${authServiceToken}`,
          'Content-Type': 'application/json'
        }
      });

      return handleApiSuccess(response, 'Retailer token refreshed successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'retailer-auth');
    }
  }


  async verifyLoginOTP(otpData) {
    try {
      const verifyData = {
        code: otpData.code,
        deviceId: otpData.deviceId || 'web_device_' + Date.now(),
        platform: otpData.platform || 'web',
        deviceToken: otpData.deviceToken || '',
        location: otpData.location || '0,0'
      };

      console.log('AuthService - Verify login OTP:', verifyData);

      const response = await unauthAxios.put(API_CONFIG.AUTH.LOGIN_VERIFY, verifyData, {
        headers: {
          'Authorization': `Bearer ${otpData.token}`
        }
      });

      return handleApiSuccess(response, 'OTP verified successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'otp');
    }
  }

  async forgotPassword(identifier) {
    try {
      const response = await unauthAxios.post(API_CONFIG.AUTH.FORGOT_PASSWORD, {
        identifier
      });

      return {
        success: true,
        data: response.data,
        message: 'Password reset email sent'
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      
      return {
        success: false,
        error: error.response?.data || error.message,
        message: error.response?.data?.message || 'Failed to send reset email'
      };
    }
  }


  async resetPassword(resetData) {
    try {
      const response = await unauthAxios.post(API_CONFIG.AUTH.RESET_PASSWORD, {
        token: resetData.token,
        password: resetData.password
      });

      return {
        success: true,
        data: response.data,
        message: 'Password reset successful'
      };
    } catch (error) {
      console.error('Reset password error:', error);
      
      return {
        success: false,
        error: error.response?.data || error.message,
        message: error.response?.data?.message || 'Password reset failed'
      };
    }
  }


  async verifyEmail(token) {
    try {
      const response = await unauthAxios.post(API_CONFIG.AUTH.VERIFY_EMAIL, {
        token
      });

      return {
        success: true,
        data: response.data,
        message: 'Email verified successfully'
      };
    } catch (error) {
      console.error('Email verification error:', error);
      
      return {
        success: false,
        error: error.response?.data || error.message,
        message: error.response?.data?.message || 'Email verification failed'
      };
    }
  }


  async verifyRegistrationOTP(otp, token) {
    try {
      // Get user's current location
      const location = await getUserLocation();

      const response = await unauthAxios.put(API_CONFIG.AUTH.VERIFY_OTP, {
        otp: otp,
        location: location
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return handleApiSuccess(response, 'OTP verified successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'otp');
    }
  }

  async resendRegistrationOTP(userData) {
    try {
      // Get user's current location
      const location = await getUserLocation();
      
      console.log('AuthService - Resending OTP with data:', userData);
      
      const response = await unauthAxios.post(API_CONFIG.AUTH.REGISTER, {
        firstName: userData.firstName,
        lastName: userData.lastName,
        identifier: userData.identifier,
        pwds: userData.pwds,
        location: location
      });

      console.log('AuthService - Resend OTP response:', response.data);

      return handleApiSuccess(response, 'OTP sent successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'otp-resend');
    }
  }

  async createAgency(agencyData, token) {
    try {
      console.log('AuthService - Creating agency:', agencyData);
      
      const response = await unauthAxios.post('/agencies/', agencyData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return handleApiSuccess(response, 'Agency created successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'agency-creation');
    }
  }

  async createStore(storeData, token) {
    try {
      console.log('AuthService - Creating store:', storeData);
      
      const response = await unauthAxios.post('/store/', storeData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return handleApiSuccess(response, 'Store created successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'store-creation');
    }
  }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;
