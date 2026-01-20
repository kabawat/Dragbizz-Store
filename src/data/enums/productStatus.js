// Who can see the product
export const PRODUCT_VISIBILITY_OPTIONS = [
  {
    value: "PUBLIC",
    label: "Public - Visible to everyone",
    description: "Visible to all customers",
  },
  {
    value: "PRIVATE",
    label: "Private - Hidden from public",
    description: "Only visible to admin",
  },
  {
    value: "CATALOG",
    label: "Catalog - Visible in catalog only",
    description: "Visible in catalog but not in search",
  },
];

export const PRODUCT_STATUS = [
  "DRAFT", // Product created but not ready for publish
  "PENDING", // Waiting for admin/store approval
  "ACTIVE", // Available for sale
  "INACTIVE", // Disabled manually by store/admin
  "OUT_OF_STOCK", // Temporarily unavailable (stock = 0)
  "DISCONTINUED", // Permanently stopped (no longer sold)
  "ARCHIVED", // Old product, kept for records
  "DELETED", // Soft-deleted (not visible to users)
  "PREORDER", // Available for pre-booking only
  "BACKORDER", // Temporarily out, but can accept orders (future stock)
];

// Product Status Options for Select Component
export const PRODUCT_STATUS_OPTIONS = PRODUCT_STATUS.map((status) => ({
  value: status,
  label: status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
}));

// Product Status Color
export const getProductStatusColor = (status) => {
  const colors = {
    DRAFT: "text-yellow-600 dark:text-yellow-400",
    PENDING: "text-blue-600 dark:text-blue-400",
    ACTIVE: "text-green-600 dark:text-green-400",
    INACTIVE: "text-gray-600 dark:text-gray-400",
    OUT_OF_STOCK: "text-red-600 dark:text-red-400",
    DISCONTINUED: "text-red-600 dark:text-red-400",
    ARCHIVED: "text-gray-600 dark:text-gray-400",
    DELETED: "text-red-600 dark:text-red-400",
    PREORDER: "text-purple-600 dark:text-purple-400",
    BACKORDER: "text-orange-600 dark:text-orange-400",
  };
  return colors[status] || "text-gray-600 dark:text-gray-400";
};

export default PRODUCT_STATUS;
