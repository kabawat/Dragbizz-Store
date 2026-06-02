import { getProductId } from "@/utils/product/findProductByScanCode";

/**
 * Add or increment a product line on an invoice draft.
 */
export function addProductToInvoiceItems(items, product, quantityToAdd = 1) {
  const productId = getProductId(product);
  if (!productId) return { items, added: false };

  const productPrice = product.pricing?.sellingPrice ?? product.sellingPrice ?? 0;
  const quantity = parseInt(quantityToAdd, 10) || 1;
  const gstRate = product.gstInfo?.gstRate || 0;
  const isInclusive = product.gstInfo?.isGstIncluded ?? false;
  const uom = product.pricing?.uom || product.uom || "Unit";

  const existingItemIndex = items.findIndex((item) => item.product === productId);

  if (existingItemIndex !== -1) {
    const updatedItems = [...items];
    const existingItem = updatedItems[existingItemIndex];
    const newQuantity = existingItem.quantity + quantity;

    updatedItems[existingItemIndex] = {
      ...existingItem,
      quantity: newQuantity,
      total: productPrice * newQuantity,
      gstRate: existingItem.gstRate !== undefined ? existingItem.gstRate : gstRate,
      isInclusive:
        existingItem.isInclusive !== undefined ? existingItem.isInclusive : isInclusive,
    };
    return { items: updatedItems, added: true };
  }

  const newItem = {
    product: productId,
    productName: product.name || "",
    quantity,
    price: productPrice,
    total: productPrice * quantity,
    gstRate,
    isInclusive,
    uom,
  };

  return { items: [...items, newItem], added: true };
}
