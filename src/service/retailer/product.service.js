import { API_CONFIG } from '@/config';
import { handleApiSuccess, handleApiErrorResponse } from '@/utils/errorHandler';
import { retailerAxios } from '@/service/config/axiosConfig';

class ProductService {
  constructor() {
    this.baseURL = API_CONFIG.BASE.URL;
  }

  // Create a new product
  async createProduct(productData) {
    try {
      const response = await retailerAxios.post(API_CONFIG?.RETAILER?.PRODUCT, productData);
      return handleApiSuccess(response?.data, 'Product created successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'product-creation');
    }
  }
}

// Create and export a singleton instance
const productService = new ProductService();
export default productService;
