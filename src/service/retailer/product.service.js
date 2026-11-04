import { API_CONFIG } from "@/config";
import { BaseService } from "@/service/base/BaseService";
import { mergeVariantsIntoProducts } from "@/utils/productCanonical";
import { variantService } from "./variant.service";

function unwrapList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.variants)) return data.variants;
  return [];
}

function getPagination(response) {
  return (
    response?.pagination ||
    response?.data?.pagination ||
    response?.data?.meta?.pagination ||
    response?.data?.data?.pagination ||
    response?.data?.data?.meta?.pagination ||
    null
  );
}

function applyEnrichedList(response, enriched) {
  const body = response?.data;
  if (!body || typeof body !== "object") return response;

  if (Array.isArray(body.data)) {
    body.data = enriched;
  } else if (Array.isArray(body.products)) {
    body.products = enriched;
  } else if (Array.isArray(body)) {
    response.data = enriched;
  }

  return response;
}

class ProductService extends BaseService {
  constructor() {
    super();
    this.endpoint = API_CONFIG?.CORE?.PRODUCT;
  }

  createProduct(productData) {
    return this.post(this.endpoint, productData);
  }

  updateProduct(productId, productData, storeId = null) {
    const url = this.buildResourceUrl(this.endpoint, productId, storeId);
    return this.put(url, productData);
  }

  async getProducts(params = {}) {
    const { includeVariants = false, ...requestParams } = params;
    const response = await this.get(this.endpoint, requestParams);

    // Only load store-wide variants if explicitly requested via includeVariants: true
    if (params?.id || !includeVariants) return response;

    try {
      const store = params.store;
      if (!store) return response;

      // Variants hold invoice-selectable price/SKU; load page by page when requested
      const variantLimit = 50;
      const products = unwrapList(response?.data?.data ?? response?.data);
      const variants = [];
      let nextCursor = null;
      do {
        const variantsResponse = await variantService.getVariants({
          store,
          limit: variantLimit,
          ...(nextCursor ? { nextCursor } : {}),
        });
        variants.push(
          ...unwrapList(variantsResponse?.data?.data ?? variantsResponse?.data)
        );
        const pagination = getPagination(variantsResponse);
        nextCursor = pagination?.hasNextPage
          ? pagination.nextCursor || null
          : null;
      } while (nextCursor);
      const enriched = mergeVariantsIntoProducts(products, variants);
      return applyEnrichedList(response, enriched);
    } catch {
      return response;
    }
  }

  deleteProduct(productId, storeId = null, options = {}) {
    const resolvedId =
      typeof productId === "object" && productId !== null
        ? (productId.id ?? productId._id ?? productId.productId)
        : productId;
    const resolvedStoreId =
      storeId ??
      (typeof productId === "object" && productId !== null
        ? (productId.store ?? productId.storeId)
        : null);
    const url = this.buildResourceUrl(
      this.endpoint,
      resolvedId,
      resolvedStoreId
    );
    const isForce =
      typeof options === "boolean" ? options : Boolean(options?.force);
    const params = isForce ? { force: true } : {};
    const config = isForce ? { data: { force: true } } : {};
    return this.delete(url, params, config);
  }

  bulkUploadProducts(file, storeId) {
    const url = `${this.endpoint}/bulk`;
    const formData = new FormData();
    formData.append("file", file);
    if (storeId) formData.append("store", storeId);

    return this.uploadAxios.post(url, formData);
  }

  saveProductImage(imageData, params = {}) {
    const url = `${this.endpoint}/image`;
    return this.post(url, imageData, params);
  }

  getProductImages({ entityId, entityType = "Product", store } = {}) {
    const url = `${this.endpoint}/image`;
    return this.get(url, { entityId, entityType, store });
  }

  deleteProductImage(imageId, storeId = null) {
    const url = this.buildResourceUrl(
      `${this.endpoint}/image`,
      imageId,
      storeId
    );
    return this.delete(url);
  }
}

export const productService = new ProductService();
export default productService;
