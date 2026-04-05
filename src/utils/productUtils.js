// Transform single API product to component format
const transformProductData = (apiProduct) => {
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
    currency: apiProduct.pricing?.currency || "INR",
    uom: apiProduct.pricing?.uom || "PCS",

    // GST information
    gst: apiProduct.gstInfo?.gstRate || apiProduct.gst || apiProduct.gstRate || 0,
    gstType: apiProduct.gstInfo?.gstType || apiProduct.gstType || "CGST_SGST",
    hsnCode: apiProduct.gstInfo?.hsnCode || apiProduct.hsnCode || apiProduct.hsn || "",
    isGstIncluded: apiProduct.gstInfo?.isGstIncluded === true,

    // Status and catalog
    status: apiProduct.status || "DRAFT",
    showInCatalog: apiProduct.showInCatalog !== false, // Default to true if not specified
    featured: apiProduct.featured || false,
    bestSeller: apiProduct.bestSeller || false,
    newArrival: apiProduct.newArrival || false,

    // Timestamps
    createdAt: apiProduct.timestamps?.createdAt,
    updatedAt: apiProduct.timestamps?.updatedAt,
    lastUpdated: apiProduct.timestamps?.updatedAt
      ? formatLastUpdated(apiProduct.timestamps.updatedAt)
      : "Unknown",

    slug: apiProduct.slug || "",
    // Use first image URL from array or fallback
    image: apiProduct.images?.[0] || "/api/placeholder/300/300",

    // Stock information (if available)
    stock: apiProduct.stock || 0,
  };
};

// relative time string
const formatLastUpdated = (timestamp) => {
  if (!timestamp) return "Unknown";

  const now = new Date();
  const updated = new Date(timestamp);
  const diffInMs = now - updated;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

  if (diffInDays > 0) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  } else if (diffInHours > 0) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  } else if (diffInMinutes > 0) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  } else {
    return "Just now";
  }
};

const transformProductsArray = (apiProducts) => {
  if (!Array.isArray(apiProducts)) return [];
  return apiProducts.map(transformProductData).filter(Boolean);
};

export { transformProductsArray };
