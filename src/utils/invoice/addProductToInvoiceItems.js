import { getProductId } from "@/utils/product/findProductByScanCode";
import {
  pickDefaultVariant,
  resolveProductUnitPrice,
  variantOptionLabel,
} from "@/utils/productUtils";

function resolveVariantId(product, explicitVariantId = null) {
  if (explicitVariantId) return String(explicitVariantId);

  if (product?.matchedVariantId) return String(product.matchedVariantId);
  if (product?.variantId) return String(product.variantId);

  const variants = Array.isArray(product?.variants) ? product.variants : [];
  if (variants.length === 0) {
    return product?.defaultVariantId
      ? String(product.defaultVariantId)
      : null;
  }

  const preferred = pickDefaultVariant(variants);
  const id = preferred?.id ?? preferred?._id ?? product?.defaultVariantId ?? null;
  return id ? String(id) : null;
}

function findVariantOnProduct(product, variantId) {
  if (!product || !variantId) return null;
  const variants = Array.isArray(product.variants) ? product.variants : [];
  return (
    variants.find(
      (v) => String(v?.id ?? v?._id ?? "") === String(variantId)
    ) || null
  );
}

function buildLineFromProduct(product, quantity, variantId, customPrice = null) {
  const variant = findVariantOnProduct(product, variantId);
  const priceSource = variant
    ? {
        ...product,
        sellingPrice: variant.sellingPrice ?? product.sellingPrice,
        mrp: variant.mrp ?? product.mrp,
        uom: variant.uom ?? product.uom,
        gstInfo: {
          ...(product.gstInfo || {}),
          ...(variant.gstInfo || {}),
        },
        pricing: {
          ...(product.pricing || {}),
          sellingPrice: variant.sellingPrice,
          mrp: variant.mrp,
          uom: variant.uom,
        },
      }
    : product;

  const defaultPrice = resolveProductUnitPrice(priceSource);
  const productPrice =
    customPrice !== null && !isNaN(customPrice)
      ? Number(customPrice)
      : defaultPrice;

  const gstRate =
    priceSource.gstInfo?.gstRate ?? product.gstInfo?.gstRate ?? 0;
  const isInclusive =
    product.gstInfo?.isGstIncluded ??
    priceSource.gstInfo?.isGstIncluded ??
    false;
  const uom = variant?.uom || product.uom || "Unit";
  const optionLabel = variantOptionLabel(variant);
  const productName = optionLabel
    ? `${product.name || ""} — ${optionLabel}`.trim()
    : product.name || "";

  return {
    product: getProductId(product),
    variant: variantId || null,
    productName,
    sku: variant?.sku ?? product.sku ?? "",
    quantity,
    price: productPrice,
    total: productPrice * quantity,
    gstRate,
    isInclusive,
    uom,
  };
}

/** Add/increment invoice line keyed by product + variant. */
export function addProductToInvoiceItems(
  items,
  product,
  quantityToAdd = 1,
  options = {}
) {
  const productId = getProductId(product);
  if (!productId) return { items, added: false };

  const quantity = parseInt(quantityToAdd, 10) || 1;
  const variantId = resolveVariantId(product, options.variantId ?? null);
  const customPrice =
    options.price !== undefined &&
    options.price !== null &&
    options.price !== "" &&
    !isNaN(options.price)
      ? Number(options.price)
      : null;

  const existingItemIndex = items.findIndex((item) => {
    const itemVariant = item.variant ? String(item.variant) : "";
    return (
      String(item.product) === String(productId) &&
      itemVariant === (variantId || "")
    );
  });

  if (existingItemIndex !== -1) {
    const updatedItems = [...items];
    const existingItem = updatedItems[existingItemIndex];
    const newQuantity = existingItem.quantity + quantity;
    const unitPrice =
      customPrice !== null
        ? customPrice
        : (existingItem.price ?? resolveProductUnitPrice(product));

    updatedItems[existingItemIndex] = {
      ...existingItem,
      quantity: newQuantity,
      price: unitPrice,
      total: unitPrice * newQuantity,
      variant: existingItem.variant ?? variantId ?? null,
    };
    return { items: updatedItems, added: true };
  }

  const newItem = buildLineFromProduct(product, quantity, variantId, customPrice);
  return { items: [...items, newItem], added: true };
}

export { resolveVariantId, findVariantOnProduct, buildLineFromProduct };
