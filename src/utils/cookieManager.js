// src/utils/cookieManager.js
import Cookies from 'js-cookie';
import { ENV_CONFIG } from '@/config';

export const cookieManager = {
  setAuthToken: (token, expiresInDays = 7) => {
    const options = {
      expires: expiresInDays,
      secure: ENV_CONFIG.ENV.IS_PRODUCTION,
      sameSite: 'strict',
      path: '/',
    };
    
    Cookies.set(ENV_CONFIG.AUTH.TOKEN_KEY, token, options);
  },


  setRefreshToken: (refreshToken, expiresInDays = 30) => {
    const options = {
      expires: expiresInDays,
      secure: ENV_CONFIG.ENV.IS_PRODUCTION,
      sameSite: 'strict',
      path: '/',
    };
    
    Cookies.set(ENV_CONFIG.AUTH.REFRESH_TOKEN_KEY, refreshToken, options);
  },

 
  getAuthToken: () => {
    return Cookies.get(ENV_CONFIG.AUTH.TOKEN_KEY) || null;
  },


  getRefreshToken: () => {
    return Cookies.get(ENV_CONFIG.AUTH.REFRESH_TOKEN_KEY) || null;
  },

  
  removeAuthToken: () => {
    Cookies.remove(ENV_CONFIG.AUTH.TOKEN_KEY, { path: '/' });
  },

  
  removeRefreshToken: () => {
    Cookies.remove(ENV_CONFIG.AUTH.REFRESH_TOKEN_KEY, { path: '/' });
  },

  clearAuth: () => {
    cookieManager.removeAuthToken();
    cookieManager.removeRefreshToken();
  },


  isAuthenticated: () => {
    return !!cookieManager.getAuthToken();
  },

  setTokens: (authToken, refreshToken, authExpiresInDays = 7, refreshExpiresInDays = 30) => {
    cookieManager.setAuthToken(authToken, authExpiresInDays);
    cookieManager.setRefreshToken(refreshToken, refreshExpiresInDays);
  },

  /**
   * Get both tokens
   * @returns {object} Object containing authToken and refreshToken
   */
  getTokens: () => {
    return {
      authToken: cookieManager.getAuthToken(),
      refreshToken: cookieManager.getRefreshToken(),
    };
  },
};

export default cookieManager;
