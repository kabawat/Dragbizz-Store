import { API_CONFIG } from '@/config';
import { handleApiSuccess, handleApiErrorResponse } from '@/utils/errorHandler';
import { authAxios } from '@/service/config/axiosConfig';
import { attachQueryParams } from '@/utils/queryParams';

class CategoryService {
  constructor() {
    this.baseURL = API_CONFIG.BASE.URL;
  }

  // Create a new category
  async createCategory(categoryData, storeId = null) {
    try {
      // Add storeId to the request body if provided
      const requestData = {
        ...categoryData,
        ...(storeId && { store: storeId })
      };
      
      const response = await authAxios.post(API_CONFIG?.RETAILER?.CATEGORY, requestData);
      return handleApiSuccess(response?.data, 'Category created successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'category-creation');
    }
  }

  // Get all categories with query parameters
  async getCategories(params = {}) {
    try {
      // Build URL with query parameters
      const url = attachQueryParams(API_CONFIG?.RETAILER?.CATEGORY, params);
      const response = await authAxios.get(url);
      return handleApiSuccess(response?.data, 'Categories fetched successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'categories-list');
    }
  }
}

// Create and export a singleton instance
const categoryService = new CategoryService();
export default categoryService;
