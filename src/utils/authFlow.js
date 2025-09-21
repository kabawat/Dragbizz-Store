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
    
    console.log('Manually refreshing retailer token...');
    const retailerResult = await authService.getRetailerToken(authToken);
    
    if (retailerResult.success) {
      console.log('Retailer token refresh successful');
      
      // Save retailer token
      if (retailerResult.data.token) {
        cookieManager.setRetailerToken(retailerResult.data.token);
        console.log('Retailer token refreshed and saved successfully');
      }
      
      // Check for onboarding requirements
      const { agency, stores } = retailerResult.data;
      
      // If no agency data, redirect to agency onboarding
      if (!agency) {
        console.log('No agency data found, redirecting to agency onboarding');
        return {
          success: false,
          message: 'Agency details required',
          redirectTo: '/onboarding/agency'
        };
      }
      
      // If agency exists but no stores, redirect to store onboarding
      if (agency && (!stores || stores.length === 0)) {
        console.log('Agency exists but no stores found, redirecting to store onboarding');
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
      console.error('Retailer token refresh failed:', retailerResult.message);
      return {
        success: false,
        message: retailerResult.message || 'Failed to refresh retailer token',
        redirectTo: '/login'
      };
    }
  } catch (error) {
    console.error('Manual retailer token refresh error:', error);
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
