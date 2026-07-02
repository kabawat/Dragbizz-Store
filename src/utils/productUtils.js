import { toProductListItem } from "@/utils/productCanonical";

const transformProductsArray = (apiProducts) => {
  if (!Array.isArray(apiProducts)) return [];
  return apiProducts.map((product) => toProductListItem(product)).filter(Boolean);
};

export {
  normalizeProductRecord,
  toProductForm,
  fromProductForm,
  toProductListItem,
  resolveProductUnitPrice,
} from "@/utils/productCanonical";

export { toProductListItem as transformProductData, transformProductsArray };
