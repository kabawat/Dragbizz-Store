import Cookies from 'js-cookie';
import { ENV_CONFIG } from '@/config';

export const cookieManager = {
  // Auth Microservice Token (from login/register)
  setAuthToken: (token, expiresInDays = 7) => {
    const options = {
      expires: expiresInDays,
      secure: false,
      sameSite: 'lax',
      path: '/',
      httpOnly: false,
    };
    
    // Set auth token cookie
    Cookies.set(ENV_CONFIG.AUTH.AUTH_TOKEN_KEY, token, options);
    // Verify cookie was set
    const savedToken = Cookies.get(ENV_CONFIG.AUTH.AUTH_TOKEN_KEY);
  },

  getAuthToken: () => {
    const token = Cookies.get(ENV_CONFIG.AUTH.AUTH_TOKEN_KEY) || null;
    return token;
  },

  // Refresh Token (from login/register)
  setRefreshToken: (token, expiresInDays = 7) => {
    const options = {
      expires: expiresInDays,
      secure: false,
      sameSite: 'lax',
      path: '/',
      httpOnly: false,
    };
    
    // Set refresh token cookie
    Cookies.set(ENV_CONFIG.AUTH.REFRESH_TOKEN_KEY, token, options);
    // Verify cookie was set
    const savedToken = Cookies.get(ENV_CONFIG.AUTH.REFRESH_TOKEN_KEY);
  },

  getRefreshToken: () => {
    const token = Cookies.get(ENV_CONFIG.AUTH.REFRESH_TOKEN_KEY) || null;
    return token;
  },

  // Retailer Microservice Token (from retailer service)
  setRetailerToken: (token, expiresInDays = 7) => {
    const options = {
      expires: expiresInDays,
      secure: false,
      sameSite: 'lax',
      path: '/',
      httpOnly: false,
    };
    
    // Set retailer token cookie
    Cookies.set(ENV_CONFIG.AUTH.RETAILER_TOKEN_KEY, token, options);
    
    // Verify cookie was set
    const savedToken = Cookies.get(ENV_CONFIG.AUTH.RETAILER_TOKEN_KEY);
  },

  getRetailerToken: () => {
    const token = Cookies.get(ENV_CONFIG.AUTH.RETAILER_TOKEN_KEY) || null;
    return token;
  },

  // Clear all authentication tokens
  clearAuth: () => {    
    // Clear auth microservice tokens
    Cookies.remove(ENV_CONFIG.AUTH.AUTH_TOKEN_KEY, { path: '/' });
    
    // Clear refresh token
    Cookies.remove(ENV_CONFIG.AUTH.REFRESH_TOKEN_KEY, { path: '/' });
    
    // Clear retailer microservice tokens
    Cookies.remove(ENV_CONFIG.AUTH.RETAILER_TOKEN_KEY, { path: '/' });
  },

};

export default cookieManager;