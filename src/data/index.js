// Import all constants for default export
import { CURRENCY_OPTIONS } from "./constants/currencies.js";
import { GST_RATE_OPTIONS } from "./constants/gstRates.js";
import { STORE_CATEGORIES } from "./constants/storeCategories.js";
import {
  getProductStatusColor,
  PRODUCT_STATUS,
  PRODUCT_STATUS_OPTIONS,
  PRODUCT_VISIBILITY_OPTIONS,
} from "./enums/productStatus.js";
import { UOM_OPTIONS } from "./enums/productUOM.js";
import { PRODUCT_CATEGORY_OPTIONS } from "./selectOptions/categories.js";

// Named exports
export { CURRENCY_OPTIONS } from "./constants/currencies.js";
export { GST_RATE_OPTIONS } from "./constants/gstRates.js";
export { STORE_CATEGORIES } from "./constants/storeCategories.js";
export {
  getProductStatusColor,
  PRODUCT_STATUS,
  PRODUCT_STATUS_OPTIONS,
  PRODUCT_VISIBILITY_OPTIONS,
} from "./enums/productStatus.js";
export { UOM_OPTIONS } from "./enums/productUOM.js";
export { PRODUCT_CATEGORY_OPTIONS } from "./selectOptions/categories.js";

// Default export for convenience
export default {
  CURRENCY_OPTIONS,
  GST_RATE_OPTIONS,
  STORE_CATEGORIES,
  UOM_OPTIONS,
  PRODUCT_STATUS,
  PRODUCT_STATUS_OPTIONS,
  PRODUCT_VISIBILITY_OPTIONS,
  getProductStatusColor,
  PRODUCT_CATEGORY_OPTIONS,
};
