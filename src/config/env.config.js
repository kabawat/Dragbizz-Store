const ENV_CONFIG = {
  APP: {
    NAME: process.env.NEXT_PUBLIC_APP_NAME || "DragBizz Store",
    VERSION: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
  },

  // Environment Checks
  ENV: {
    IS_DEVELOPMENT: process.env.NODE_ENV === "development",
    IS_PRODUCTION: process.env.NODE_ENV === "production",
    IS_TEST: process.env.NODE_ENV === "test",
  },
};

export default ENV_CONFIG;
