// Currency related
export {  CURRENCY_OPTIONS } from './constants/currencies.js';

// GST related
export { 
  GST_RATE_OPTIONS
} from './constants/gstRates.js';

// UOM related
export { 
  UOM_OPTIONS 
} from './enums/productUOM.js';

// Product Status related
export { 
  PRODUCT_STATUS,
  PRODUCT_STATUS_OPTIONS,
  PRODUCT_VISIBILITY_OPTIONS,
  getProductStatusColor
} from './enums/productStatus.js';

// Select options
export { PRODUCT_CATEGORY_OPTIONS } from './selectOptions/categories.js';

import { 
  GST_RATE_OPTIONS
} from './constants/gstRates.js';

import { 
  UOM_OPTIONS 
} from './enums/productUOM.js';

import { 
  PRODUCT_STATUS,
  PRODUCT_STATUS_OPTIONS,
  PRODUCT_VISIBILITY_OPTIONS,
  getProductStatusColor
} from './enums/productStatus.js';

import { 
  PRODUCT_CATEGORY_OPTIONS
} from './selectOptions/categories.js';

// Re-export everything as default for convenience
export default {
  // GST
  GST_RATE_OPTIONS,
  
  // Product Status
  PRODUCT_STATUS,
  PRODUCT_STATUS_OPTIONS,
  PRODUCT_VISIBILITY_OPTIONS,
  getProductStatusColor,
  
  // UOM
  UOM_OPTIONS,
  
  // Select Options
  PRODUCT_CATEGORY_OPTIONS
};
