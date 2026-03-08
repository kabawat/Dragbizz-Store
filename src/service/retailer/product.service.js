import { API_CONFIG } from "@/config";
import { BaseService } from "@/service/base/BaseService";

class ProductService extends BaseService {
  constructor() {
    super();
    this.endpoint = API_CONFIG?.RETAILER?.PRODUCT;
  }

  // Create a new product
  createProduct(productData) {
    return this.post(this.endpoint, productData);
  }

  // Update an existing product
  updateProduct(productId, productData, storeId = null) {
    const url = this.buildResourceUrl(this.endpoint, productId, storeId);
    return this.put(url, productData);
  }

  // Get all products with query parameters
  getProducts(params = {}) {
    return this.get(this.endpoint, params);
  }

  // Delete a product by ID
  deleteProduct(productId, storeId = null) {
    const url = this.buildResourceUrl(this.endpoint, productId, storeId);
    return this.delete(url);
  }
}

// Create and export a singleton instance
export const productService = new ProductService();
export default productService;
