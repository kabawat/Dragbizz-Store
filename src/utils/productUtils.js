import { toProductListItem } from "./productCanonical.js";

const transformProductsArray = (apiProducts) => {
  if (!Array.isArray(apiProducts)) return [];
  return apiProducts
    .map((product) => toProductListItem(product))
    .filter(Boolean);
};

export {
  buildUnifiedProductPayload,
  expandProductsForPos,
  extractProductIdFromCreateResponse,
  fromProductForm,
  mergeVariantIntoProduct,
  mergeVariantsIntoProducts,
  normalizeProductRecord,
  pickDefaultVariant,
  resolveProductUnitPrice,
  splitProductAndVariantPayload,
  toProductForm,
  toProductListItem,
  variantOptionLabel,
} from "./productCanonical.js";

export { toProductListItem as transformProductData, transformProductsArray };
