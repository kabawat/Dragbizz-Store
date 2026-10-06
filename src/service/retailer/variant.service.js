import { API_CONFIG } from "@/config";
import { BaseService } from "@/service/base/BaseService";

class VariantService extends BaseService {
  constructor() {
    super();
    this.endpoint = API_CONFIG?.RETAILER?.VARIANT || "/retailer/variant";
  }

  getVariants(params = {}) {
    return this.get(this.endpoint, params);
  }

  createVariant(variantData) {
    return this.post(this.endpoint, variantData);
  }

  updateVariant(variantId, variantData, storeId = null) {
    const url = this.buildResourceUrl(this.endpoint, variantId, storeId);
    return this.put(url, variantData);
  }

  deleteVariant(variantId, storeId = null) {
    const url = this.buildResourceUrl(this.endpoint, variantId, storeId);
    return this.delete(url);
  }
}

export const variantService = new VariantService();
export default variantService;
