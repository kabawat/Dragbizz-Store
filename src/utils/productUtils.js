// src/utils/productUtils.js
// Utility functions for product data transformation

/**
 * Transform API product data to component format
 * @param {Object} apiProduct - Product data from API
 * @returns {Object} - Transformed product data
 */
export const transformProductData = (apiProduct) => {
  if (!apiProduct) return null;

  return {
    id: apiProduct.id,
    name: apiProduct.name,
    brand: apiProduct.brand,
    sku: apiProduct.sku,
    barcode: apiProduct.barcode,
    category: apiProduct.category,
    subcategories: apiProduct.subcategories || [],
    
    // Pricing information
    sellingPrice: apiProduct.pricing?.sellingPrice || 0,
    purchasePrice: apiProduct.pricing?.basePrice || 0,
    mrp: apiProduct.pricing?.mrp || 0,
    discount: apiProduct.pricing?.discount || 0,
    currency: apiProduct.pricing?.currency || 'INR',
    uom: apiProduct.pricing?.uom || 'PCS',
    
    // GST information
    gst: apiProduct.gstInfo?.gstRate || apiProduct.gst || apiProduct.gstRate || 18,
    gstType: apiProduct.gstInfo?.gstType || apiProduct.gstType || 'CGST_SGST',
    hsnCode: apiProduct.gstInfo?.hsnCode || apiProduct.hsnCode || apiProduct.hsn || '',
    isGstApplicable: apiProduct.gstInfo?.isGstApplicable === true,
    
    // Status and visibility
    status: apiProduct.status || 'DRAFT',
    visibility: apiProduct.visibility || 'VISIBLE',
    featured: apiProduct.featured || false,
    bestSeller: apiProduct.bestSeller || false,
    newArrival: apiProduct.newArrival || false,
    
    // Timestamps
    createdAt: apiProduct.timestamps?.createdAt,
    updatedAt: apiProduct.timestamps?.updatedAt,
    lastUpdated: apiProduct.timestamps?.updatedAt ? 
      formatLastUpdated(apiProduct.timestamps.updatedAt) : 'Unknown',
    
    // Additional fields for display
    slug: apiProduct.slug || '',
    image: apiProduct.image || '/api/placeholder/300/300',
    
    // Stock information (if available)
    stock: apiProduct.stock || 0,
  };
};

/**
 * Format last updated timestamp to human readable format
 * @param {string} timestamp - ISO timestamp
 * @returns {string} - Formatted time string
 */
export const formatLastUpdated = (timestamp) => {
  if (!timestamp) return 'Unknown';
  
  const now = new Date();
  const updated = new Date(timestamp);
  const diffInMs = now - updated;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  
  if (diffInDays > 0) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  } else if (diffInHours > 0) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else if (diffInMinutes > 0) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
};

/**
 * Transform array of API products to component format
 * @param {Array} apiProducts - Array of products from API
 * @returns {Array} - Array of transformed products
 */
export const transformProductsArray = (apiProducts) => {
  if (!Array.isArray(apiProducts)) return [];
  
  return apiProducts.map(transformProductData).filter(Boolean);
};

/**
 * Get status badge configuration
 * @param {string} status - Product status
 * @returns {Object} - Badge configuration
 */
export const getStatusBadgeConfig = (status) => {
  const statusConfig = {
    ACTIVE: { 
      variant: 'success', 
      text: 'Active', 
      color: 'bg-green-500/10 text-green-600 border-green-500/20' 
    },
    INACTIVE: { 
      variant: 'secondary', 
      text: 'Inactive', 
      color: 'bg-gray-500/10 text-gray-600 border-gray-500/20' 
    },
    DRAFT: { 
      variant: 'warning', 
      text: 'Draft', 
      color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' 
    },
    OUT_OF_STOCK: { 
      variant: 'danger', 
      text: 'Out of Stock', 
      color: 'bg-red-500/10 text-red-600 border-red-500/20' 
    },
    LOW_STOCK: { 
      variant: 'warning', 
      text: 'Low Stock', 
      color: 'bg-orange-500/10 text-orange-600 border-orange-500/20' 
    },
    DISCONTINUED: { 
      variant: 'secondary', 
      text: 'Discontinued', 
      color: 'bg-gray-500/10 text-gray-600 border-gray-500/20' 
    },
  };
  
  return statusConfig[status] || statusConfig.DRAFT;
};

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, currency = 'INR') => {
  if (typeof amount !== 'number') return '0';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Get category display name
 * @param {string|Object} category - Category ID or object
 * @returns {string} - Category display name
 */
export const getCategoryDisplayName = (category) => {
  if (typeof category === 'string') {
    return category; // If it's already a string, return as is
  }
  
  if (typeof category === 'object' && category?.name) {
    return category.name;
  }
  
  return 'Uncategorized';
};

export default {
  transformProductData,
  transformProductsArray,
  formatLastUpdated,
  getStatusBadgeConfig,
  formatCurrency,
  getCategoryDisplayName,
};
