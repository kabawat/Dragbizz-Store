// src/utils/authFlow.js
import { authService } from '@/service/auth';
import { cookieManager } from '@/utils/cookieManager';

export const refreshRetailerToken = async () => {
  try {
    const authToken = cookieManager.getAuthToken();
    
    if (!authToken) {
      return {
        success: false,
        message: 'No auth service token found. Please login again.',
        redirectTo: '/login'
      };
    }
    
    const retailerResult = await authService.getRetailerToken(authToken);
    
    if (retailerResult.success) {
      // Save retailer token
      if (retailerResult.data.token) {
        cookieManager.setRetailerToken(retailerResult.data.token);
      }
      
      // Check for onboarding requirements
      const { agency, stores } = retailerResult.data;
      
      // If no agency data, redirect to agency onboarding
      if (!agency) {
        return {
          success: false,
          message: 'Agency details required',
          redirectTo: '/onboarding/agency'
        };
      }
      
      // If agency exists but no stores, redirect to store onboarding
      if (agency && (!stores || stores.length === 0)) {
        return {
          success: false,
          message: 'Store details required',
          redirectTo: '/onboarding/store'
        };
      }
      
      return {
        success: true,
        data: retailerResult.data,
        message: 'Retailer token refreshed successfully'
      };
    } else {
      return {
        success: false,
        message: retailerResult.message || 'Failed to refresh retailer token',
        redirectTo: '/login'
      };
    }
  } catch (error) {
    return {
      success: false,
      message: 'Failed to refresh retailer token. Please login again.',
      redirectTo: '/login'
    };
  }
};

export default {
  refreshRetailerToken
};
