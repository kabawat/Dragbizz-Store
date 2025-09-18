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

  getAuthToken: () => {
    return Cookies.get(ENV_CONFIG.AUTH.TOKEN_KEY) || null;
  },

  clearAuth: () => {
    Cookies.remove(ENV_CONFIG.AUTH.TOKEN_KEY, { path: '/' });
  },
};

export default cookieManager;