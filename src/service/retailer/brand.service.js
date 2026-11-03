import { API_CONFIG } from "@/config";
import { BaseService } from "@/service/base/BaseService";

class BrandService extends BaseService {
  constructor() {
    super();
    this.endpoint = API_CONFIG?.CORE?.BRAND;
  }

  // Create a new brand
  createBrand(brandData, storeId = null) {
    const payload = { ...brandData, ...(storeId && { store: storeId }) };
    return this.post(this.endpoint, payload);
  }

  // Get all brands with query parameters
  getBrands(params = {}) {
    return this.get(this.endpoint, params);
  }

  // Get a single brand by ID
  getBrandById(brandId, storeId = null) {
    const url = this.buildResourceUrl(this.endpoint, brandId, storeId);
    return this.get(url);
  }

  // Update a brand
  updateBrand(brandId, brandData, storeId = null) {
    const url = this.buildResourceUrl(this.endpoint, brandId, storeId);
    return this.put(url, brandData);
  }

  // Delete a brand
  deleteBrand(brandId, storeId = null) {
    const url = this.buildResourceUrl(this.endpoint, brandId, storeId);
    return this.delete(url);
  }
}

const brandService = new BrandService();
export { brandService };
export default brandService;
