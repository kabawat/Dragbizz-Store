export const resolveStoreId = (storeOrId) => {
  if (!storeOrId) return "";
  if (typeof storeOrId === "string" || typeof storeOrId === "number") {
    return String(storeOrId);
  }
  return String(storeOrId._id || storeOrId.id || "");
};

export const mapStoreToForm = (storeData = {}) => {
  const address = storeData.address || {};

  return {
    name: storeData.name || "",
    phone: storeData.phone || "",
    email: storeData.email || "",
    address: {
      street: address.line1 || "",
      line1: address.line1 || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
      landmark: address.landmark || "",
    },
    category: storeData.category || "",
    hasExpiryDate: storeData.hasExpiryDate === true,
    gst: storeData.gst || storeData.metadata?.gst || "",
    gstDetail: storeData.gstDetail || null,
    pan: storeData.pan || "",
    catalogId: storeData.catalogId || "",
  };
};

export const EMPTY_STORE_FORM = {
  name: "",
  phone: "",
  email: "",
  address: {
    street: "",
    line1: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
  },
  category: "",
  hasExpiryDate: false,
  gst: "",
  gstDetail: null,
  pan: "",
  catalogId: "",
};
