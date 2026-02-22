const isDevelopment = process.env.NODE_ENV === "development";

const logger = {
  log: (...args) => {
    if (isDevelopment) {
      
    }
  },

  warn: (...args) => {
    if (isDevelopment) {
      
    }
  },

  error: (...args) => {
    
  },

  info: (...args) => {
    if (isDevelopment) {
      
    }
  },

  debug: (...args) => {
    if (isDevelopment) {
      
    }
  },
};

export default logger;
