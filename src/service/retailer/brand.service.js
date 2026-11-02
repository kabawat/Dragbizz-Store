import { API_CONFIG } from "@/config";
import { BaseService } from "@/service/base/BaseService";

class BrandService extends BaseService {
  constructor() {
    super();
    this.endpoint = API_CONFIG?.RETAILER?.BRAND || "/retailer/brand";
  }

  createBrand(brandData, storeId = null) {
    const payload = { ...brandData, ...(storeId && { store: storeId }) };
    return this.post(this.endpoint, payload);
  }

  getBrands(params = {}) {
    return this.get(this.endpoint, params);
  }

  updateBrand(brandId, brandData, storeId = null) {
    const url = this.buildResourceUrl(this.endpoint, brandId, storeId);
    return this.put(url, brandData);
  }

  deleteBrand(brandId, storeId = null) {
    const url = this.buildResourceUrl(this.endpoint, brandId, storeId);
    return this.delete(url);
  }
}

const brandService = new BrandService();
export default brandService;
