/**
 * Product Status Options
 * Different states a product can be in
 */

export const PRODUCT_STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft - Not published', description: 'Product is being prepared' },
  { value: 'ACTIVE', label: 'Active - Live and available', description: 'Product is live and available for purchase' },
  { value: 'INACTIVE', label: 'Inactive - Temporarily disabled', description: 'Product is temporarily disabled' },
  { value: 'DISCONTINUED', label: 'Discontinued - No longer available', description: 'Product is no longer available' },
  { value: 'OUT_OF_STOCK', label: 'Out of Stock - Temporarily unavailable', description: 'Product is temporarily out of stock' }
];

/**
 * Product Visibility Options
 * Who can see the product
 */

export const PRODUCT_VISIBILITY_OPTIONS = [
  { value: 'PUBLIC', label: 'Public - Visible to everyone', description: 'Visible to all customers' },
  { value: 'PRIVATE', label: 'Private - Hidden from public', description: 'Only visible to admin' },
  { value: 'CATALOG', label: 'Catalog - Visible in catalog only', description: 'Visible in catalog but not in search' }
];

/**
 * Default product status
 */
export const DEFAULT_PRODUCT_STATUS = 'ACTIVE';

/**
 * Default product visibility
 */
export const DEFAULT_PRODUCT_VISIBILITY = 'PUBLIC';

/**
 * Get product status label by value
 * @param {string} status - Product status value
 * @returns {string} Product status label
 */
export const getProductStatusLabel = (status) => {
  const productStatus = PRODUCT_STATUS_OPTIONS.find(s => s.value === status);
  return productStatus ? productStatus.label : 'Active - Live and available';
};

/**
 * Get product visibility label by value
 * @param {string} visibility - Product visibility value
 * @returns {string} Product visibility label
 */
export const getProductVisibilityLabel = (visibility) => {
  const productVisibility = PRODUCT_VISIBILITY_OPTIONS.find(v => v.value === visibility);
  return productVisibility ? productVisibility.label : 'Public - Visible to everyone';
};

export default {
  PRODUCT_STATUS_OPTIONS,
  PRODUCT_VISIBILITY_OPTIONS,
  DEFAULT_PRODUCT_STATUS,
  DEFAULT_PRODUCT_VISIBILITY,
  getProductStatusLabel,
  getProductVisibilityLabel
};
