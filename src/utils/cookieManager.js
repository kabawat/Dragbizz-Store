import Cookies from 'js-cookie';
import { ENV_CONFIG } from '@/config';

export const cookieManager = {
  setAuthToken: (token, expiresInDays = 7) => {
    const options = {
      expires: expiresInDays,
      secure: false, // Always false for development
      sameSite: 'lax', // Changed from 'strict' to 'lax'
      path: '/',
      httpOnly: false, // Allow client-side access for js-cookie
    };
    
    console.log('Setting auth token:', token);
    console.log('Cookie options:', options);
    console.log('Token key:', ENV_CONFIG.AUTH.TOKEN_KEY);
    
    Cookies.set(ENV_CONFIG.AUTH.TOKEN_KEY, token, options);
    
    // Also set a backup cookie with a simpler name for middleware
    Cookies.set('db_session_id', token, options);
    
    // Verify cookie was set
    const savedToken = Cookies.get(ENV_CONFIG.AUTH.TOKEN_KEY);
    console.log('Token saved successfully:', !!savedToken);
    console.log('Saved token value:', savedToken);
  },

  getAuthToken: () => {
    const token = Cookies.get(ENV_CONFIG.AUTH.TOKEN_KEY) || null;
    console.log('Getting auth token:', token);
    console.log('Token key:', ENV_CONFIG.AUTH.TOKEN_KEY);
    console.log('All cookies:', document.cookie);
    return token;
  },

  setRetailerToken: (token, expiresInDays = 7) => {
    const options = {
      expires: expiresInDays,
      secure: false, // Always false for development
      sameSite: 'lax', // Changed from 'strict' to 'lax'
      path: '/',
    };
    
    Cookies.set('retailer_token', token, options);
  },

  getRetailerToken: () => {
    return Cookies.get('retailer_token') || null;
  },

  clearAuth: () => {
    Cookies.remove(ENV_CONFIG.AUTH.TOKEN_KEY, { path: '/' });
    Cookies.remove('db_session_id', { path: '/' });
    Cookies.remove('retailer_token', { path: '/' });
  },
};

export default cookieManager;