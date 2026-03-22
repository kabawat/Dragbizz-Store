import { API_CONFIG } from "@/config";
import { BaseService } from "@/service/base/BaseService";

class SupplierService extends BaseService {
  constructor() {
    super();
    this.endpoint = API_CONFIG?.RETAILER?.SUPPLIER;
  }

  // Create a new supplier
  createSupplier(supplierData) {
    return this.post(this.endpoint, supplierData);
  }

  // Update an existing supplier
  updateSupplier(supplierId, supplierData, storeId = null) {
    const url = this.buildResourceUrl(this.endpoint, supplierId, storeId);
    return this.put(url, supplierData);
  }

  // Get all suppliers with query parameters
  getSuppliers(params = {}) {
    return this.get(this.endpoint, params);
  }

  // Delete a supplier by ID
  deleteSupplier(supplierId, storeId = null) {
    const url = this.buildResourceUrl(this.endpoint, supplierId, storeId);
    return this.delete(url);
  }

  // Search suppliers by name, phone, or email
  searchSuppliers(searchTerm, storeId = null) {
    let url = `${this.endpoint}/search`;
    const params = { q: searchTerm };

    if (storeId) {
      params.store = storeId;
    }

    return this.get(url, params);
  }

  // Get supplier statistics
  getSupplierStats(storeId = null) {
    let url = `${this.endpoint}/stats`;
    const params = storeId ? { store: storeId } : {};

    return this.get(url, params);
  }
}

// Create and export a singleton instance
export const supplierService = new SupplierService();
export default supplierService;
