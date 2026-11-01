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
  if (Array.isArray(input?.features) && input.features.length > 0)
    return input.features;
  if (Array.isArray(content?.features) && content.features.length > 0)
    return content.features;
  return [];
}

function normalizeGstInfo(input = {}) {
  const gstInfo = input.gstInfo ?? {};
  const gstRate =
    gstInfo.gstRate ??
    input.gst ??
    input.gstRate ??
    input.gst_rate ??
    gstInfo.gst_rate;
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
  if (
    mrpNum !== undefined &&
    spNum !== undefined &&
    mrpNum > spNum &&
    mrpNum > 0
  ) {
    return Math.round(((mrpNum - spNum) / mrpNum) * 100 * 100) / 100;
  }
  const existing = toNumber(discount);
  return existing ?? 0;
}

function resolveVariantProductId(variant) {
  if (!variant) return null;
  const product = variant.product ?? variant.productId ?? variant.product_id;
  if (!product) return null;
  if (typeof product === "string") return product;
  return product.id ?? product._id ?? null;
}

/** Pick default variant, else first by sortOrder. */
export function pickDefaultVariant(variants = []) {
  if (!Array.isArray(variants) || variants.length === 0) return null;
  const preferred = variants.find((v) => v?.isDefault === true);
  if (preferred) return preferred;
  return [...variants].sort(
    (a, b) => (a?.sortOrder ?? 0) - (b?.sortOrder ?? 0)
  )[0];
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
  const mrp = variant.mrp ?? product.mrp ?? product.pricing?.mrp ?? "";
  const sellingPrice =
    variant.sellingPrice ??
    product.sellingPrice ??
    product.pricing?.sellingPrice ??
    "";
  const discount =
    variant.discount ?? product.discount ?? product.pricing?.discount ?? "";
  const uom = variant.uom ?? product.uom ?? product.pricing?.uom ?? "PCS";
  const basePrice = product.basePrice ?? product.pricing?.basePrice ?? "";

  return {
    ...product,
    sku: variant.sku ?? product.sku ?? "",
    barcode: variant.barcode ?? product.barcode ?? "",
    mrp,
    sellingPrice,
    discount,
    uom,
    basePrice,
    // Keep legacy pricing.* readers (POS cards, cart) in sync with variant fields
    pricing: {
      ...(product.pricing || {}),
      basePrice,
      mrp,
      sellingPrice,
      discount,
      uom,
      currency: product.currency ?? product.pricing?.currency ?? "INR",
    },
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

/** Human-readable variant label (options / displayName / sku). */
export function variantOptionLabel(variant) {
  if (!variant) return "";
  if (variant.displayName) return String(variant.displayName).trim();
  if (Array.isArray(variant.options) && variant.options.length > 0) {
    return variant.options
      .map((o) => o?.value)
      .filter(Boolean)
      .join(" / ");
  }
  return String(variant.sku || "").trim();
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
    const productVariants = [
      ...(product.variants ?? []),
      ...(byProduct.get(id) ?? []),
    ].filter((variant, index, list) => {
      const variantId = String(variant?.id ?? variant?._id ?? "");
      return (
        !variantId ||
        list.findIndex(
          (candidate) =>
            String(candidate?.id ?? candidate?._id ?? "") === variantId
        ) === index
      );
    });
    const merged = mergeVariantIntoProduct(
      product,
      pickDefaultVariant(productVariants)
    );
    return { ...merged, variants: productVariants };
  });
}

export function normalizeProductRecord(input) {
  if (!input || typeof input !== "object") return null;

  const pricing = input.pricing ?? {};
  const content = normalizeContent(input);
  const mrp = pickNumber(
    input.mrp,
    pricing.mrp,
    input.mrp_price,
    input.maximum_retail_price,
    input.maximumRetailPrice,
    input.price
  );
  const sellingPrice = pickNumber(
    input.sellingPrice,
    pricing.sellingPrice,
    input.selling_price,
    input.sale_price,
    input.salePrice,
    input.price
  );
  const basePrice = pickNumber(
    input.basePrice,
    pricing.basePrice,
    input.base_price,
    input.purchasePrice,
    input.costPrice
  );
  const discount = pickNumber(
    input.discount,
    pricing.discount,
    input.discount_percent,
    input.discountPercent
  );
  const currency = pickString(input.currency, pricing.currency) ?? "INR";
  const uom =
    pickString(input.uom, pricing.uom, input.unit, input.uom_name) ?? "PCS";

  const normalized = {
    name: input.name ?? "",
    brand: input.brand ?? input.brand_name ?? "",
    brandId: input.brandId ?? input.brand_id ?? null,
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
    variantsCount:
      pickNumber(input.variantsCount, input.variants_count) ??
      (Array.isArray(input.variants) ? input.variants.length : 0),
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
    brandId: record.brandId ?? "",
    brandName: record.brand ?? "",
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
      specifications: Array.isArray(content.specifications)
        ? content.specifications
        : [],
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
 * Build unified product and variant payload matching data.json.
 */
export function buildUnifiedProductPayload({
  formData = {},
  variants = [],
  hasVariants = false,
} = {}) {
  const normalized = normalizeProductRecord(formData) ?? {};
  const discount = computeDiscount(
    formData.mrp ?? normalized.mrp,
    formData.sellingPrice ?? normalized.sellingPrice,
    formData.discount ?? normalized.discount
  );
  const store = formData.store ?? formData.storeId ?? normalized.store;
  const categoryId =
    resolveCategoryId(formData.category) ||
    resolveCategoryId(normalized.category) ||
    formData.category ||
    "";

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
    formData.gstInfo?.isGstIncluded ?? normalized.gstInfo?.isGstIncluded
  );

  const specifications = Array.isArray(formData.specifications)
    ? formData.specifications
    : Array.isArray(formData.content?.specifications)
      ? formData.content.specifications
      : Array.isArray(normalized.content?.specifications)
        ? normalized.content.specifications
        : [];

  const basePrice = toNumber(
    formData.basePrice ??
      formData.purchasePrice ??
      formData.openingStock?.purchasePrice ??
      normalized.basePrice
  );

  const mrp = toNumber(formData.mrp ?? normalized.mrp);
  const sellingPrice = toNumber(
    formData.sellingPrice ?? normalized.sellingPrice
  );
  const uom = formData.uom ?? normalized.uom ?? "PCS";
  const rawSku = String(formData.sku ?? normalized.sku ?? "").trim();
  const sku = rawSku ? rawSku.toUpperCase() : undefined;
  const rawBarcode = String(
    formData.barcode ?? normalized.barcode ?? ""
  ).trim();
  const barcode = rawBarcode || undefined;

  let mappedVariants = [];

  if (hasVariants) {
    // 1. Primary Variant (from Section 1 Basic Info & Section 2 Pricing & Inventory)
    // As per user requirement: displayName MUST NOT be product name, but the value from toggled variant name input box (formData.displayName)
    const primaryDisplayName =
      String(formData.displayName || "").trim() ||
      (formData.name ? `${formData.name} - Variant 1` : "Variant 1");

    const defaultImages = images.length > 0 ? images : (normalized.images ?? []);
    const defaultStockQty =
      toNumber(
        formData.stockQuantity ??
          formData.stock ??
          formData.openingStock?.quantity
      ) ?? 0;
    const defaultPurchasePrice =
      toNumber(
        basePrice ??
          formData.purchasePrice ??
          formData.openingStock?.purchasePrice
      ) ?? 0;
    const defaultSupplier =
      formData.supplierId ?? formData.openingStock?.supplier ?? null;

    const primaryVariant = {
      displayName: primaryDisplayName,
      images: defaultImages,
      sellingPrice: sellingPrice ?? 0,
      mrp: mrp ?? 0,
      discount: discount ?? 0,
      showInCatalog: formData.showInCatalog !== false,
      sortOrder: 0,
      status: formData.status || "ACTIVE",
      stock: {
        stock: defaultStockQty,
        purchasePrice: defaultPurchasePrice,
        supplier: defaultSupplier || null,
      },
    };

    if (sku) primaryVariant.sku = sku;
    if (barcode) primaryVariant.barcode = barcode;
    // NOTE: When hasVariants is checked, isDefault is NEVER passed on any variant!

    // 2. Additional Variants (created from bottom section when user clicks "+ Add Another Variant")
    const additionalVariants = (Array.isArray(variants) ? variants : []).map(
      (v, idx) => {
        const variantImages = (v.images ?? [])
          .map((img) => {
            if (typeof img === "string") return img;
            if (img && typeof img === "object" && img.url) return img.url;
            if (img instanceof File && img.uploadedUrl) return img.uploadedUrl;
            return null;
          })
          .filter(Boolean);

        const finalVariantImages =
          variantImages.length > 0
            ? variantImages
            : images.length > 0
              ? images
              : (normalized.images ?? []);

        const cleanOptions = (v.options || [])
          .filter((o) => o?.name?.trim() && o?.value?.trim())
          .map((o) => ({ name: o.name.trim(), value: o.value.trim() }));

        const autoOptionLabel = cleanOptions.map((o) => o.value).join(" / ");
        const fallbackDisplayName = autoOptionLabel
          ? `${formData.name || normalized.name || "Product"} - ${autoOptionLabel}`
          : `${formData.name || normalized.name || "Product"} - Variant ${idx + 2}`;

        const vDisplayName =
          String(v.displayName || "").trim() || fallbackDisplayName;

        const vMrp = toNumber(v.mrp) ?? 0;
        const vSellingPrice = toNumber(v.sellingPrice) ?? 0;
        const vDiscount = computeDiscount(vMrp, vSellingPrice, v.discount);

        const rawVSku = String(v.sku || "").trim();
        const vSku = rawVSku ? rawVSku.toUpperCase() : undefined;
        const vBarcode = v.barcode ? String(v.barcode).trim() : undefined;

        const vStockQty =
          toNumber(v.stock?.stock ?? v.stock ?? v.openingStock?.quantity) ?? 0;
        const vPurchasePrice =
          toNumber(
            v.stock?.purchasePrice ??
              v.purchasePrice ??
              v.basePrice
          ) ?? 0;
        const vSupplier =
          v.stock?.supplier ??
          v.supplierId ??
          v.supplier ??
          formData.supplierId ??
          formData.openingStock?.supplier ??
          null;

        const variantItem = {
          displayName: vDisplayName,
          images: finalVariantImages,
          sellingPrice: vSellingPrice,
          mrp: vMrp,
          discount: vDiscount,
          showInCatalog: v.showInCatalog !== false,
          sortOrder: idx + 1,
          status: v.status || "ACTIVE",
          stock: {
            stock: vStockQty,
            purchasePrice: vPurchasePrice,
            supplier: vSupplier || null,
          },
        };

        if (vSku) variantItem.sku = vSku;
        if (vBarcode) variantItem.barcode = vBarcode;
        if (cleanOptions.length > 0) variantItem.options = cleanOptions;
        // NOTE: isDefault is NOT passed on any variant when hasVariants is true!

        return variantItem;
      }
    );

    mappedVariants = [primaryVariant, ...additionalVariants];
  } else {
    // Default single variant mode: Seamlessly auto-creates 1 default variant
    const defaultDisplayName =
      String(formData.name ?? normalized.name ?? "").trim() || "Product";
    const defaultImages =
      images.length > 0 ? images : (normalized.images ?? []);
    const defaultStockQty =
      toNumber(
        formData.stockQuantity ??
          formData.stock ??
          formData.openingStock?.quantity
      ) ?? 0;
    const defaultPurchasePrice =
      toNumber(
        basePrice ??
          formData.purchasePrice ??
          formData.openingStock?.purchasePrice
      ) ?? 0;
    const defaultSupplier =
      formData.supplierId ?? formData.openingStock?.supplier ?? null;

    const singleVariant = {
      displayName: defaultDisplayName,
      images: defaultImages,
      sellingPrice: sellingPrice ?? 0,
      mrp: mrp ?? 0,
      isDefault: true,
      discount: discount ?? 0,
      showInCatalog: formData.showInCatalog !== false,
      sortOrder: 0,
      status: formData.status || "ACTIVE",
      stock: {
        stock: defaultStockQty,
        purchasePrice: defaultPurchasePrice,
        supplier: defaultSupplier || null,
      },
    };

    if (sku) singleVariant.sku = sku;
    if (barcode) singleVariant.barcode = barcode;

    mappedVariants = [singleVariant];
  }

  const payload = {
    name: formData.name ?? normalized.name ?? "",
    brandId: formData.brandId || normalized.brandId || null,
    categoryId,
    category: categoryId,
    store,
    productType: formData.productType ?? normalized.productType ?? "GOODS",
    bestSeller: Boolean(formData.bestSeller),
    content: {
      shortDescription:
        formData.content?.shortDescription ??
        normalized.content?.shortDescription ??
        "",
      longDescription:
        formData.content?.longDescription ??
        normalized.content?.longDescription ??
        "",
      tags: formData.content?.tags ?? normalized.content?.tags ?? [],
      features: formData.content?.features ?? normalized.features ?? [],
    },
    currency: formData.currency ?? normalized.currency ?? "INR",
    featured: Boolean(formData.featured),
    newArrival: Boolean(formData.newArrival),
    specifications,
    status: formData.status ?? normalized.status ?? "ACTIVE",
    uom,
    images: images.length > 0 ? images : (normalized.images ?? []),
    gstInfo,
    mrp,
    sellingPrice,
    discount,
    variants: mappedVariants,
  };

  if (basePrice !== undefined) payload.basePrice = basePrice;
  if (sku) payload.sku = sku;
  if (barcode) payload.barcode = barcode;

  return payload;
}

export function splitProductAndVariantPayload(formData = {}) {
  const normalized = normalizeProductRecord(formData) ?? {};
  const discount = computeDiscount(
    normalized.mrp,
    normalized.sellingPrice,
    normalized.discount
  );
  const store = formData.store ?? formData.storeId ?? normalized.store;
  const categoryId =
    resolveCategoryId(formData.category) ||
    resolveCategoryId(normalized.category) ||
    formData.category ||
    "";

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
    formData.gstInfo?.isGstIncluded ?? normalized.gstInfo?.isGstIncluded
  );

  const specifications = Array.isArray(formData.content?.specifications)
    ? formData.content.specifications
    : Array.isArray(normalized.content?.specifications)
      ? normalized.content.specifications
      : [];

  const basePrice = toNumber(
    formData.basePrice ??
      formData.purchasePrice ??
      formData.openingStock?.purchasePrice ??
      normalized.basePrice
  );
  const mrp = toNumber(formData.mrp ?? normalized.mrp);
  const sellingPrice = toNumber(
    formData.sellingPrice ?? normalized.sellingPrice
  );
  const uom = formData.uom ?? normalized.uom ?? "PCS";
  const sku = String(formData.sku ?? normalized.sku ?? "")
    .trim()
    .toUpperCase();
  const barcode = String(formData.barcode ?? normalized.barcode ?? "").trim();

  const variantPayload = {
    store,
    displayName:
      String(formData.name ?? normalized.name ?? "").trim() || undefined,
    images: images.length > 0 ? images : normalized.images,
    mrp,
    sellingPrice,
    discount,
    uom,
    gstInfo: {
      ...(gstInfo.hsnCode ? { hsnCode: gstInfo.hsnCode } : {}),
    },
    status: formData.status || "ACTIVE",
    isDefault: true,
    showInCatalog: formData.showInCatalog !== false,
    sortOrder: 0,
    stock: {
      stock:
        toNumber(
          formData.stockQuantity ??
            formData.stock ??
            formData.openingStock?.quantity
        ) ?? 0,
      purchasePrice:
        toNumber(
          basePrice ??
            formData.purchasePrice ??
            formData.openingStock?.purchasePrice
        ) ?? 0,
      supplier: formData.supplierId ?? formData.openingStock?.supplier ?? null,
    },
  };

  if (sku) variantPayload.sku = sku;
  if (barcode) variantPayload.barcode = barcode;

  const productPayload = {
    store,
    name: formData.name ?? normalized.name,
    brandId: formData.brandId || normalized.brandId || null,
    categoryId,
    category: categoryId,
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
      shortDescription:
        formData.content?.shortDescription ??
        normalized.content?.shortDescription ??
        "",
      longDescription:
        formData.content?.longDescription ??
        normalized.content?.longDescription ??
        "",
      tags: formData.content?.tags ?? normalized.content?.tags ?? [],
      features: formData.content?.features ?? normalized.features ?? [],
    },
    specifications,
    mrp,
    sellingPrice,
    discount,
    uom,
    variants: [variantPayload],
  };

  if (basePrice !== undefined) productPayload.basePrice = basePrice;
  if (sku) productPayload.sku = sku;
  if (barcode) productPayload.barcode = barcode;

  return { productPayload, variantPayload };
}

/** @deprecated Prefer buildUnifiedProductPayload — kept for callers that still send a flat product body. */
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

  if (diffInDays > 0)
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  if (diffInHours > 0)
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  if (diffInMinutes > 0)
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
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

  const rawVariants = Array.isArray(input?.variants)
    ? input.variants
    : Array.isArray(record.variants)
      ? record.variants
      : [];

  const variantsCount =
    pickNumber(
      input?.variantsCount,
      input?.variants_count,
      record.variantsCount
    ) ?? rawVariants.length;

  const hasMultipleVariants =
    input?.hasMultipleVariants ??
    record.hasMultipleVariants ??
    (variantsCount > 1 ||
      (rawVariants.length === 1 && rawVariants[0]?.isDefault !== true));

  let priceRange = null;
  let mrpRange = null;
  if (hasMultipleVariants && rawVariants.length > 0) {
    const variantPrices = rawVariants
      .map((v) => Number(v.sellingPrice))
      .filter((p) => !isNaN(p) && p > 0);
    if (variantPrices.length > 0) {
      priceRange = {
        min: Math.min(...variantPrices),
        max: Math.max(...variantPrices),
      };
    }
    const variantMrps = rawVariants
      .map((v) => Number(v.mrp))
      .filter((m) => !isNaN(m) && m > 0);
    if (variantMrps.length > 0) {
      mrpRange = {
        min: Math.min(...variantMrps),
        max: Math.max(...variantMrps),
      };
    }
  }

  const defaultVariant =
    rawVariants.find((v) => v?.isDefault === true) || rawVariants[0];

  const singleSellingPrice =
    (toNumber(record.sellingPrice) !== undefined && toNumber(record.sellingPrice) > 0
      ? toNumber(record.sellingPrice)
      : undefined) ??
    (toNumber(defaultVariant?.sellingPrice) !== undefined && toNumber(defaultVariant?.sellingPrice) > 0
      ? toNumber(defaultVariant?.sellingPrice)
      : undefined) ??
    (toNumber(defaultVariant?.price) !== undefined && toNumber(defaultVariant?.price) > 0
      ? toNumber(defaultVariant?.price)
      : undefined) ??
    0;

  const singleMrp =
    (toNumber(record.mrp) !== undefined && toNumber(record.mrp) > 0
      ? toNumber(record.mrp)
      : undefined) ??
    (toNumber(defaultVariant?.mrp) !== undefined && toNumber(defaultVariant?.mrp) > 0
      ? toNumber(defaultVariant?.mrp)
      : undefined) ??
    0;

  const singleBasePrice =
    (toNumber(record.basePrice) !== undefined && toNumber(record.basePrice) > 0
      ? toNumber(record.basePrice)
      : undefined) ??
    (toNumber(defaultVariant?.stock?.purchasePrice) !== undefined && toNumber(defaultVariant?.stock?.purchasePrice) > 0
      ? toNumber(defaultVariant?.stock?.purchasePrice)
      : undefined) ??
    (toNumber(defaultVariant?.purchasePrice) !== undefined && toNumber(defaultVariant?.purchasePrice) > 0
      ? toNumber(defaultVariant?.purchasePrice)
      : undefined) ??
    (toNumber(defaultVariant?.basePrice) !== undefined && toNumber(defaultVariant?.basePrice) > 0
      ? toNumber(defaultVariant?.basePrice)
      : undefined) ??
    0;

  const singleSku = record.sku || defaultVariant?.sku || "";
  const singleBarcode = record.barcode || defaultVariant?.barcode || "";

  return {
    id,
    name: record.name,
    brand: record.brand,
    brandId: record.brandId,
    hasMultipleVariants,
    variantsCount,
    priceRange,
    mrpRange,
    sku: hasMultipleVariants ? "Multiple SKUs" : singleSku,
    barcode: hasMultipleVariants ? "" : singleBarcode,
    category: record.category,
    subcategories: input?.subcategories ?? [],
    sellingPrice:
      hasMultipleVariants && priceRange
        ? priceRange.min
        : singleSellingPrice,
    purchasePrice: singleBasePrice,
    mrp:
      hasMultipleVariants && mrpRange
        ? mrpRange.max
        : singleMrp,
    discount: hasMultipleVariants ? 0 : (toNumber(record.discount) ?? 0),
    currency: record.currency,
    uom: record.uom || defaultVariant?.uom || "PCS",
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
    lastUpdated:
      (input?.timestamps?.updatedAt ?? input?.updatedAt)
        ? formatLastUpdated(input.timestamps?.updatedAt ?? input.updatedAt)
        : "Unknown",
    slug: input?.slug ?? "",
    image: imageUrl,
    stock: record.stock ?? 0,
    defaultVariantId: record.defaultVariantId ?? null,
    variants: hasMultipleVariants ? rawVariants : [],
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

/**
 * Expand catalog products into POS sellable rows (one card per variant).
 * Product = catalog identity; Variant = sellable SKU with price.
 */
export function expandProductsForPos(products = []) {
  if (!Array.isArray(products) || products.length === 0) return [];

  const rows = [];
  for (const product of products) {
    const productId = product?.id ?? product?._id;
    if (!productId) continue;

    const variants = Array.isArray(product.variants) ? product.variants : [];
    const sellable = variants.filter((v) => {
      const status = String(v?.status || "ACTIVE").toUpperCase();
      return status === "ACTIVE";
    });

    if (sellable.length === 0) {
      const price = resolveProductUnitPrice(product);
      rows.push({
        ...product,
        id: productId,
        _id: productId,
        productId,
        variantId: product.defaultVariantId ?? null,
        hasMultipleVariants: false,
        isVariantCard: false,
        name: product.name,
        sellingPrice: price,
        price,
        pricing: {
          ...(product.pricing || {}),
          sellingPrice: price,
          mrp: product.mrp ?? product.pricing?.mrp,
          uom: product.uom ?? product.pricing?.uom ?? "PCS",
        },
      });
      continue;
    }

    for (const variant of sellable) {
      const variantId = variant.id ?? variant._id;
      if (!variantId) continue;

      const optionLabel = variantOptionLabel(variant);
      const name =
        optionLabel && optionLabel !== product.name
          ? `${product.name} — ${optionLabel}`
          : product.name;
      const sellingPrice = toNumber(variant.sellingPrice) ?? 0;
      const mrp = toNumber(variant.mrp) ?? toNumber(product.mrp) ?? "";
      const uom = variant.uom ?? product.uom ?? product.pricing?.uom ?? "PCS";

      rows.push({
        ...product,
        id: variantId,
        _id: variantId,
        productId,
        variantId,
        hasMultipleVariants: variants.length > 1,
        isVariantCard: true,
        name,
        sku: variant.sku ?? product.sku ?? "",
        barcode: variant.barcode ?? product.barcode ?? "",
        sellingPrice,
        price: sellingPrice,
        mrp,
        discount: variant.discount ?? product.discount ?? 0,
        uom,
        pricing: {
          ...(product.pricing || {}),
          sellingPrice,
          mrp,
          discount: variant.discount ?? product.discount ?? 0,
          uom,
          currency: product.currency ?? product.pricing?.currency ?? "INR",
        },
        defaultVariantId: variant.isDefault
          ? variantId
          : product.defaultVariantId,
      });
    }
  }

  return rows;
}

export function extractProductIdFromCreateResponse(data) {
  if (!data) return null;
  if (typeof data === "string") return data;
  return (
    data?.product?.id ?? data?.product?._id ?? data?.id ?? data?._id ?? null
  );
}
