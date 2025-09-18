// src/config/env.config.js
// Environment configuration

const ENV_CONFIG = {
  // App Configuration
  APP: {
    NAME: process.env.NEXT_PUBLIC_APP_NAME || 'DragBizz Store',
    VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  },
  
  // Authentication
  AUTH: {
    TOKEN_KEY: process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || 'db_session_id',
  },
  
  // Environment Checks
  ENV: {
    IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
    IS_PRODUCTION: process.env.NODE_ENV === 'production',
    IS_TEST: process.env.NODE_ENV === 'test',
  },
};

// Validate required environment variables
const validateEnv = () => {
  const requiredVars = [
    'NEXT_PUBLIC_API_URL',
    'NEXT_PUBLIC_APP_NAME',
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn('Missing environment variables:', missingVars);
  }
};

// Run validation in development
if (ENV_CONFIG.ENV.IS_DEVELOPMENT) {
  validateEnv();
}

export default ENV_CONFIG;