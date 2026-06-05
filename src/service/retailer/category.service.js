import { API_CONFIG } from "@/config";
import { BaseService } from "@/service/base/BaseService";

class CategoryService extends BaseService {
  constructor() {
    super();
    this.endpoint = API_CONFIG?.RETAILER?.CATEGORY;
  }

  // Create a new category
  createCategory(categoryData, storeId = null) {
    const payload = { ...categoryData, ...(storeId && { store: storeId }) };
    return this.post(this.endpoint, payload);
  }

  // Get all categories with query parameters
  getCategories(params = {}) {
    return this.get(this.endpoint, params);
  }
}

const categoryService = new CategoryService();
export default categoryService;
