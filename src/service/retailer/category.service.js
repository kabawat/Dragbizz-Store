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

  // Update a category
  updateCategory(categoryId, categoryData, storeId = null) {
    const url = this.buildResourceUrl(this.endpoint, categoryId, storeId);
    return this.put(url, categoryData);
  }

  // Delete a category
  deleteCategory(categoryId, storeId = null) {
    const url = this.buildResourceUrl(this.endpoint, categoryId, storeId);
    return this.delete(url);
  }
}

const categoryService = new CategoryService();
export default categoryService;
