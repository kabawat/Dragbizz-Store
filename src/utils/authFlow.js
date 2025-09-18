// src/utils/authFlow.js
import { authService } from '@/service/auth';
import { cookieManager } from '@/utils/cookieManager';

/**
 * Complete authentication flow:
 * 1. Auth service login is already complete
 * 2. Refresh retailer token using auth service token
 * 3. Store both tokens
 * 4. Return success/error
 * 
 * This acts as a refresh token mechanism for retailer service
 */
export const completeAuthFlow = async (authServiceToken) => {
  try {
    console.log('Starting retailer token refresh flow with auth service token');
    
    // Refresh retailer token using auth service token
    const retailerResult = await authService.getRetailerToken(authServiceToken);
    
    if (retailerResult.success) {
      console.log('Retailer token refresh successful');
      
      // Save retailer token
      if (retailerResult.data.token) {
        cookieManager.setRetailerToken(retailerResult.data.token);
        console.log('Retailer token refreshed and saved successfully');
      }
      
      return {
        success: true,
        data: {
          authToken: authServiceToken,
          retailerToken: retailerResult.data.token,
          user: retailerResult.data.user
        },
        message: 'Retailer token refreshed successfully'
      };
    } else {
      console.error('Retailer token refresh failed:', retailerResult.message);
      return {
        success: false,
        message: retailerResult.message || 'Failed to refresh retailer token'
      };
    }
  } catch (error) {
    console.error('Retailer token refresh flow error:', error);
    return {
      success: false,
      message: 'Retailer token refresh failed. Please try again.'
    };
  }
};

/**
 * Check if user has both tokens (auth service + retailer)
 */
export const hasValidTokens = () => {
  const authToken = cookieManager.getAuthToken();
  const retailerToken = cookieManager.getRetailerToken();
  
  return {
    hasAuthToken: !!authToken,
    hasRetailerToken: !!retailerToken,
    hasBothTokens: !!(authToken && retailerToken)
  };
};

/**
 * Clear all authentication tokens
 */
export const clearAllAuth = () => {
  cookieManager.clearAuth();
  console.log('All authentication tokens cleared');
};

/**
 * Manually refresh retailer token using existing auth service token
 * This can be called when retailer token expires
 */
export const refreshRetailerToken = async () => {
  try {
    const authToken = cookieManager.getAuthToken();
    
    if (!authToken) {
      return {
        success: false,
        message: 'No auth service token found. Please login again.'
      };
    }
    
    console.log('Manually refreshing retailer token...');
    const result = await completeAuthFlow(authToken);
    
    if (result.success) {
      console.log('Retailer token manually refreshed successfully');
    }
    
    return result;
  } catch (error) {
    console.error('Manual retailer token refresh error:', error);
    return {
      success: false,
      message: 'Failed to refresh retailer token. Please login again.'
    };
  }
};

/**
 * Check if retailer token needs refresh (basic check)
 */
export const needsTokenRefresh = () => {
  const retailerToken = cookieManager.getRetailerToken();
  const authToken = cookieManager.getAuthToken();
  
  return {
    hasRetailerToken: !!retailerToken,
    hasAuthToken: !!authToken,
    needsRefresh: !retailerToken && !!authToken
  };
};

export default {
  completeAuthFlow,
  hasValidTokens,
  clearAllAuth,
  refreshRetailerToken,
  needsTokenRefresh
};
