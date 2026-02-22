// src/config/index.js
// Main configuration file - combines ENV and API config modules

import API_CONFIG from "./api.config";
// Import config modules
import ENV_CONFIG from "./env.config";

// Combined configuration object
const CONFIG = {
  // Environment configuration
  ENV: ENV_CONFIG,

  // API configuration
  API: API_CONFIG,
};

// Export individual configs
export { ENV_CONFIG, API_CONFIG };

// Export combined config
export { CONFIG };

// Default export for backward compatibility
export default CONFIG;

// Legacy export for existing code
export const SECRET = ENV_CONFIG;
