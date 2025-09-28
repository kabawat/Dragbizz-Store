// Environment configuration
const ENV_CONFIG = {
  // App Configuration
  APP: {
    NAME: process.env.NEXT_PUBLIC_APP_NAME || 'DragBizz Store',
    VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  },
  
  // Authentication
  AUTH: {
    AUTH_TOKEN_KEY: process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || 'db_auth_token',
    RETAILER_TOKEN_KEY: process.env.NEXT_PUBLIC_RETAILER_TOKEN_KEY || 'db_retailer_token',
  },
  
  // Environment Checks
  ENV: {
    IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
    IS_PRODUCTION: process.env.NODE_ENV === 'production',
    IS_TEST: process.env.NODE_ENV === 'test',
  },
};

export default ENV_CONFIG;