import { API_CONFIG } from "@/config";
import { handleApiSuccess, handleApiErrorResponse } from "@/utils/errorHandler";
import { authAxios } from "@/service/config/axiosConfig";
import { attachQueryParams } from "@/utils/queryParams";

class ProductService {
  constructor() {
    this.baseURL = API_CONFIG.BASE.URL;
  }

  // Create a new product
  async createProduct(productData) {
    try {
      const response = await authAxios.post(
        API_CONFIG?.RETAILER?.PRODUCT,
        productData,
      );
      return handleApiSuccess(response?.data, "Product created successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "product-creation");
    }
  }
  // Update an existing product
  async updateProduct(productId, productData, storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.PRODUCT}/${productId}`;

      // Add storeId as query parameter if provided
      if (storeId) {
        const params = { store: storeId };
        url = attachQueryParams(url, params);
      }

      const response = await authAxios.put(url, productData);
      return handleApiSuccess(response?.data, "Product updated successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "product-updation");
    }
  }

  // Get all products with query parameters
  async getProducts(params = {}) {
    try {
      // Build URL with query parameters
      const url = attachQueryParams(API_CONFIG?.RETAILER?.PRODUCT, params);
      const response = await authAxios.get(url);
      return handleApiSuccess(response?.data, "Products fetched successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "products-list");
    }
  }

  // Delete a product by ID
  async deleteProduct(productId, storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.PRODUCT}/${productId}`;

      // Add storeId as query parameter if provided
      if (storeId) {
        const params = { store: storeId };
        url = attachQueryParams(url, params);
      }

      const response = await authAxios.delete(url);
      return handleApiSuccess(response?.data, "Product deleted successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "product-deletion");
    }
  }
}

// Create and export a singleton instance
const productService = new ProductService();
export default productService;
