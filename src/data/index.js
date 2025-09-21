/**
 * Data Constants Index
 * Centralized export of all static data and constants
 */

// Currency related
export { 
  CURRENCY_OPTIONS, 
  DEFAULT_CURRENCY, 
  getCurrencySymbol, 
  getCurrencyLabel 
} from './constants/currencies.js';

// GST related
export { 
  GST_RATE_OPTIONS, 
  DEFAULT_GST_RATE, 
  getGSTRateLabel, 
  getGSTRateDescription 
} from './constants/gstRates.js';

// Product status related
export { 
  PRODUCT_STATUS_OPTIONS, 
  PRODUCT_VISIBILITY_OPTIONS, 
  DEFAULT_PRODUCT_STATUS, 
  DEFAULT_PRODUCT_VISIBILITY, 
  getProductStatusLabel, 
  getProductVisibilityLabel 
} from './constants/productStatus.js';

// UOM related
export { 
  PRODUCT_UOM, 
  UOM_OPTIONS 
} from './enums/productUOM.js';

// Import all constants for default export
import { 
  CURRENCY_OPTIONS, 
  DEFAULT_CURRENCY, 
  getCurrencySymbol, 
  getCurrencyLabel 
} from './constants/currencies.js';

import { 
  GST_RATE_OPTIONS, 
  DEFAULT_GST_RATE, 
  getGSTRateLabel, 
  getGSTRateDescription 
} from './constants/gstRates.js';

import { 
  PRODUCT_STATUS_OPTIONS, 
  PRODUCT_VISIBILITY_OPTIONS, 
  DEFAULT_PRODUCT_STATUS, 
  DEFAULT_PRODUCT_VISIBILITY, 
  getProductStatusLabel, 
  getProductVisibilityLabel 
} from './constants/productStatus.js';

import { 
  PRODUCT_UOM, 
  UOM_OPTIONS 
} from './enums/productUOM.js';

// Re-export everything as default for convenience
export default {
  // Currency
  CURRENCY_OPTIONS,
  DEFAULT_CURRENCY,
  getCurrencySymbol,
  getCurrencyLabel,
  
  // GST
  GST_RATE_OPTIONS,
  DEFAULT_GST_RATE,
  getGSTRateLabel,
  getGSTRateDescription,
  
  // Product Status
  PRODUCT_STATUS_OPTIONS,
  PRODUCT_VISIBILITY_OPTIONS,
  DEFAULT_PRODUCT_STATUS,
  DEFAULT_PRODUCT_VISIBILITY,
  getProductStatusLabel,
  getProductVisibilityLabel,
  
  // UOM
  PRODUCT_UOM,
  UOM_OPTIONS
};
