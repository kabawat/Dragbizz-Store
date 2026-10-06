// Keep in sync with FE/dragbizz-desktop/packages/core/src/product.js
// Product = catalog identity; Variant = sellable SKU (price/sku/barcode/uom)

function toNumber(value) {
  if (value == null || value === "") return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}

function pickNumber(...values) {
  for (const value of values) {
    const num = toNumber(value);
    if (num !== undefined) return num;
  }
  return undefined;
}

function pickString(...values) {
  for (const value of values) {
    if (value == null || value === "") continue;
    return String(value);
  }
  return undefined;
}

function resolveCategoryId(category) {
  if (!category) return "";
  if (typeof category === "string") return category;
  return category._id ?? category.id ?? "";
}

function resolveCategoryObject(category) {
  if (!category) return { _id: "", name: "" };
  if (typeof category === "string") return { _id: category, name: "" };
  return {
    _id: category._id ?? category.id ?? "",
    name: category.name ?? "",
  };
}

function resolveFeatures(input, content) {
  if (Array.isArray(input?.features) && input.features.length > 0) return input.features;
  if (Array.isArray(content?.features) && content.features.length > 0) return content.features;
  return [];
}

function normalizeGstInfo(input = {}) {
  const gstInfo = input.gstInfo ?? {};
  const gstRate = gstInfo.gstRate ?? input.gst ?? input.gstRate;
  return {
    isGstIncluded:
      gstInfo.isGstIncluded ??
      input.isGstIncluded ??
      gstInfo.isGstApplicable ??
      false,
    gstRate: gstRate ?? "",
    hsnCode: gstInfo.hsnCode ?? input.hsnCode ?? input.hsn ?? "",
  };
}

function normalizeContent(input = {}) {
  const content = input.content ?? {};
  const features = resolveFeatures(input, content);
  return {
    shortDescription: content.shortDescription ?? "",
    longDescription: content.longDescription ?? "",
    tags: Array.isArray(content.tags) ? content.tags : [],
    specifications: Array.isArray(content.specifications)
      ? content.specifications
      : Array.isArray(input.specifications)
        ? input.specifications
        : [],
    features,
  };
}

function normalizeImages(images, fallbackImage) {
  if (Array.isArray(images)) return images;
  if (fallbackImage) return [fallbackImage];
  return [];
}

function computeDiscount(mrp, sellingPrice, discount) {
  const mrpNum = toNumber(mrp);
  const spNum = toNumber(sellingPrice);
  if (mrpNum !== undefined && spNum !== undefined && mrpNum > spNum && mrpNum > 0) {
    return Math.round(((mrpNum - spNum) / mrpNum) * 100 * 100) / 100;
  }
  const existing = toNumber(discount);
  return existing ?? 0;
}

function resolveVariantProductId(variant) {
  if (!variant) return null;
  const product = variant.product;
  if (!product) return null;
  if (typeof product === "string") return product;
  return product.id ?? product._id ?? null;
}

/** Pick default variant, else first by sortOrder. */
export function pickDefaultVariant(variants = []) {
  if (!Array.isArray(variants) || variants.length === 0) return null;
  const preferred = variants.find((v) => v?.isDefault === true);
  if (preferred) return preferred;
  return [...variants].sort((a, b) => (a?.sortOrder ?? 0) - (b?.sortOrder ?? 0))[0];
}

/** Merge sellable variant fields onto a product record for UI/forms. */
export function mergeVariantIntoProduct(product, variant) {
  if (!product) return null;
  if (!variant) {
    return {
      ...product,
      defaultVariantId: product.defaultVariantId ?? null,
      variants: product.variants ?? [],
    };
  }

  const variantGst = variant.gstInfo || {};
  const productGst = product.gstInfo || {};

  return {
    ...product,
    sku: variant.sku ?? product.sku ?? "",
    barcode: variant.barcode ?? product.barcode ?? "",
    mrp: variant.mrp ?? product.mrp ?? product.pricing?.mrp ?? "",
    sellingPrice:
      variant.sellingPrice ?? product.sellingPrice ?? product.pricing?.sellingPrice ?? "",
    discount: variant.discount ?? product.discount ?? product.pricing?.discount ?? "",
    uom: variant.uom ?? product.uom ?? product.pricing?.uom ?? "PCS",
    basePrice: product.basePrice ?? product.pricing?.basePrice ?? "",
    gstInfo: {
      ...normalizeGstInfo({ gstInfo: { ...productGst, ...variantGst } }),
      isGstIncluded:
        productGst.isGstIncluded ??
        variantGst.isGstIncluded ??
        product.isGstIncluded ??
        false,
    },
    defaultVariantId: variant.id ?? variant._id ?? null,
    variants: product.variants ?? (variant ? [variant] : []),
  };
}

export function mergeVariantsIntoProducts(products = [], variants = []) {
  if (!Array.isArray(products) || products.length === 0) return products ?? [];

  const byProduct = new Map();
  for (const variant of variants) {
    const productId = String(resolveVariantProductId(variant) ?? "");
    if (!productId) continue;
    if (!byProduct.has(productId)) byProduct.set(productId, []);
    byProduct.get(productId).push(variant);
  }

  return products.map((product) => {
    const id = String(product?.id ?? product?._id ?? "");
    const productVariants = byProduct.get(id) ?? product.variants ?? [];
    const merged = mergeVariantIntoProduct(product, pickDefaultVariant(productVariants));
    return { ...merged, variants: productVariants };
  });
}

export function normalizeProductRecord(input) {
  if (!input || typeof input !== "object") return null;

  const pricing = input.pricing ?? {};
  const content = normalizeContent(input);
  const mrp = pickNumber(input.mrp, pricing.mrp);
  const sellingPrice = pickNumber(input.sellingPrice, pricing.sellingPrice);
  const basePrice = pickNumber(input.basePrice, pricing.basePrice, input.purchasePrice);
  const discount = pickNumber(input.discount, pricing.discount);
  const currency = pickString(input.currency, pricing.currency) ?? "INR";
  const uom = pickString(input.uom, pricing.uom) ?? "PCS";

  const normalized = {
    name: input.name ?? "",
    brand: input.brand ?? "",
    category: resolveCategoryObject(input.category),
    sku: input.sku ?? "",
    barcode: input.barcode ?? "",
    basePrice: basePrice ?? "",
    mrp: mrp ?? "",
    sellingPrice: sellingPrice ?? "",
    discount: discount ?? "",
    currency,
    uom,
    productType: pickString(input.productType) ?? "GOODS",
    status: input.status ?? "",
    showInCatalog: input.showInCatalog !== false,
    featured: Boolean(input.featured),
    bestSeller: Boolean(input.bestSeller),
    newArrival: Boolean(input.newArrival),
    gstInfo: normalizeGstInfo(input),
    content: {
      shortDescription: content.shortDescription,
      longDescription: content.longDescription,
      tags: content.tags,
      specifications: content.specifications,
    },
    features: content.features,
    images: normalizeImages(input.images, input.image),
    stock: pickNumber(input.stock, input.stockQuantity) ?? 0,
    defaultVariantId: input.defaultVariantId ?? null,
    variants: Array.isArray(input.variants) ? input.variants : [],
  };

  if (input.version != null) normalized.version = input.version;
  if (input.store != null) normalized.store = input.store;
  if (input.storeId != null) normalized.storeId = input.storeId;

  return normalized;
}

function toFormValue(value) {
  if (value == null || value === "") return "";
  return value;
}

export function toProductForm(canonical, storeId = null) {
  const record = normalizeProductRecord(canonical) ?? {};
  const content = record.content ?? {};
  const gstInfo = record.gstInfo ?? {};

  return {
    store: storeId ?? canonical?.storeId ?? canonical?.store ?? "",
    name: record.name ?? "",
    brand: record.brand ?? "",
    category: resolveCategoryId(record.category),
    barcode: record.barcode ?? "",
    sku: record.sku ?? "",
    basePrice: toFormValue(record.basePrice),
    mrp: toFormValue(record.mrp),
    sellingPrice: toFormValue(record.sellingPrice),
    discount: toFormValue(record.discount),
    currency: record.currency ?? "INR",
    uom: record.uom ?? "PCS",
    productType: record.productType ?? "GOODS",
    images: Array.isArray(record.images) ? record.images : [],
    status: record.status ?? "",
    showInCatalog: record.showInCatalog !== false,
    featured: Boolean(record.featured),
    bestSeller: Boolean(record.bestSeller),
    newArrival: Boolean(record.newArrival),
    stockQuantity: record.stock ?? 0,
    defaultVariantId: record.defaultVariantId ?? null,
    gstInfo: {
      isGstIncluded: gstInfo.isGstIncluded === true,
      gstRate: gstInfo.gstRate ?? "",
      hsnCode: gstInfo.hsnCode ?? "",
    },
    content: {
      shortDescription: content.shortDescription ?? "",
      longDescription: content.longDescription ?? "",
      tags: Array.isArray(content.tags) ? content.tags : [],
      specifications: Array.isArray(content.specifications) ? content.specifications : [],
      features: Array.isArray(record.features) ? record.features : [],
    },
  };
}

function buildGstPayload(gstInfo = {}, isGstIncluded) {
  const payload = {};
  const included =
    isGstIncluded === true ||
    isGstIncluded === "true" ||
    gstInfo.isGstIncluded === true ||
    gstInfo.isGstIncluded === "true";

  payload.isGstIncluded = included;

  // GST rate is resolved from HSN on the backend — do not send from the form
  if (gstInfo.hsnCode != null && String(gstInfo.hsnCode).trim()) {
    payload.hsnCode = String(gstInfo.hsnCode).trim();
  }

  return payload;
}

/**
 * Build API payloads after product↔variant split.
 * Product keeps catalog fields; variant keeps sellable fields.
 * Product create still includes pricing temporarily so older BE validation passes.
 */
export function splitProductAndVariantPayload(formData = {}) {
  const normalized = normalizeProductRecord(formData) ?? {};
  const discount = computeDiscount(normalized.mrp, normalized.sellingPrice, normalized.discount);

  const images = (formData.images ?? [])
    .map((img) => {
      if (typeof img === "string") return img;
      if (img && typeof img === "object" && img.url) return img.url;
      if (img instanceof File && img.uploadedUrl) return img.uploadedUrl;
      return null;
    })
    .filter(Boolean);

  const gstInfo = buildGstPayload(
    formData.gstInfo ?? normalized.gstInfo,
    formData.gstInfo?.isGstIncluded ?? normalized.gstInfo?.isGstIncluded,
  );

  const specifications = Array.isArray(formData.content?.specifications)
    ? formData.content.specifications
    : Array.isArray(normalized.content?.specifications)
      ? normalized.content.specifications
      : [];

  const productPayload = {
    store: formData.store ?? formData.storeId ?? normalized.store,
    name: formData.name ?? normalized.name,
    brand: formData.brand ?? normalized.brand,
    category: formData.category ?? resolveCategoryId(normalized.category),
    currency: formData.currency ?? normalized.currency ?? "INR",
    productType: formData.productType ?? normalized.productType ?? "GOODS",
    images: images.length > 0 ? images : normalized.images,
    status: formData.status ?? normalized.status,
    showInCatalog: formData.showInCatalog !== false,
    featured: Boolean(formData.featured),
    bestSeller: Boolean(formData.bestSeller),
    newArrival: Boolean(formData.newArrival),
    gstInfo,
    content: {
      shortDescription: formData.content?.shortDescription ?? normalized.content?.shortDescription ?? "",
      longDescription: formData.content?.longDescription ?? normalized.content?.longDescription ?? "",
      tags: formData.content?.tags ?? normalized.content?.tags ?? [],
      features: formData.content?.features ?? normalized.features ?? [],
    },
    specifications,
    // Temporary compat: BE product validation still requires these until fully migrated
    mrp: toNumber(formData.mrp ?? normalized.mrp),
    sellingPrice: toNumber(formData.sellingPrice ?? normalized.sellingPrice),
    discount,
    uom: formData.uom ?? normalized.uom ?? "PCS",
    barcode: formData.barcode ?? normalized.barcode ?? "",
  };

  const basePrice = toNumber(formData.basePrice ?? normalized.basePrice);
  if (basePrice !== undefined) productPayload.basePrice = basePrice;

  const sku = String(formData.sku ?? normalized.sku ?? "").trim().toUpperCase();
  if (sku) productPayload.sku = sku;
  if (!productPayload.barcode) delete productPayload.barcode;

  const variantPayload = {
    displayName: String(formData.name ?? normalized.name ?? "").trim() || undefined,
    mrp: toNumber(formData.mrp ?? normalized.mrp),
    sellingPrice: toNumber(formData.sellingPrice ?? normalized.sellingPrice),
    discount,
    uom: formData.uom ?? normalized.uom ?? "PCS",
    gstInfo: {
      ...(gstInfo.hsnCode ? { hsnCode: gstInfo.hsnCode } : {}),
    },
    status: formData.status || "ACTIVE",
    isDefault: true,
    showInCatalog: formData.showInCatalog !== false,
    sortOrder: 0,
  };

  if (sku) variantPayload.sku = sku;
  const barcode = String(formData.barcode ?? normalized.barcode ?? "").trim();
  if (barcode) variantPayload.barcode = barcode;

  return { productPayload, variantPayload };
}

/** @deprecated Prefer splitProductAndVariantPayload — kept for callers that still send a flat product body. */
export function fromProductForm(formData = {}) {
  const { productPayload } = splitProductAndVariantPayload(formData);
  return productPayload;
}

function formatLastUpdated(timestamp) {
  if (!timestamp) return "Unknown";
  const now = new Date();
  const updated = new Date(timestamp);
  const diffInMs = now - updated;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

  if (diffInDays > 0) return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  if (diffInHours > 0) return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  if (diffInMinutes > 0) return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  return "Just now";
}

export function toProductListItem(input) {
  const record = normalizeProductRecord(input);
  if (!record) return null;

  const id = input?.id ?? input?._id ?? input?.serverId ?? input?.localId ?? "";
  const firstImage = record.images?.[0];
  const imageUrl =
    typeof firstImage === "object" && firstImage?.url
      ? firstImage.url
      : typeof firstImage === "string"
        ? firstImage
        : "https://placehold.co/600x600?text=No+Image";

  return {
    id,
    name: record.name,
    brand: record.brand,
    sku: record.sku,
    barcode: record.barcode,
    category: record.category,
    subcategories: input?.subcategories ?? [],
    sellingPrice: toNumber(record.sellingPrice) ?? 0,
    purchasePrice: toNumber(record.basePrice) ?? 0,
    mrp: toNumber(record.mrp) ?? 0,
    discount: toNumber(record.discount) ?? 0,
    currency: record.currency,
    uom: record.uom,
    gst: toNumber(record.gstInfo?.gstRate) ?? 0,
    hsnCode: record.gstInfo?.hsnCode ?? "",
    isGstIncluded: record.gstInfo?.isGstIncluded === true,
    status: record.status || "DRAFT",
    productType: record.productType ?? "GOODS",
    showInCatalog: record.showInCatalog !== false,
    featured: Boolean(record.featured),
    bestSeller: Boolean(record.bestSeller),
    newArrival: Boolean(record.newArrival),
    createdAt: input?.timestamps?.createdAt ?? input?.createdAt,
    updatedAt: input?.timestamps?.updatedAt ?? input?.updatedAt,
    lastUpdated: (input?.timestamps?.updatedAt ?? input?.updatedAt)
      ? formatLastUpdated(input.timestamps?.updatedAt ?? input.updatedAt)
      : "Unknown",
    slug: input?.slug ?? "",
    image: imageUrl,
    stock: record.stock ?? 0,
    defaultVariantId: record.defaultVariantId ?? null,
  };
}

export function resolveProductUnitPrice(product) {
  const record = normalizeProductRecord(product);
  if (!record) return 0;

  const candidates = [record.sellingPrice, record.mrp, record.basePrice];
  for (const value of candidates) {
    const parsed = toNumber(value);
    if (parsed !== undefined && parsed > 0) return parsed;
  }
  return 0;
}

export function extractProductIdFromCreateResponse(data) {
  if (!data) return null;
  if (typeof data === "string") return data;
  return (
    data?.product?.id ??
    data?.product?._id ??
    data?.id ??
    data?._id ??
    null
  );
}
