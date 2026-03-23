import { API_CONFIG } from "@/config";
import { BaseService } from "@/service/base/BaseService";

class CustomerService extends BaseService {
  constructor() {
    super();
    this.endpoint = API_CONFIG?.RETAILER?.CUSTOMER;
  }

  // Create a new customer
  createCustomer(customerData) {
    return this.post(this.endpoint, customerData);
  }

  // Update an existing customer
  updateCustomer(customerId, customerData, storeId = null) {
    const url = this.buildResourceUrl(this.endpoint, customerId, storeId);
    return this.put(url, customerData);
  }

  // Get all customers with query parameters
  getCustomers(params = {}) {
    return this.get(this.endpoint, params);
  }

  // Delete a customer by ID
  deleteCustomer(customerId, storeId = null) {
    const url = this.buildResourceUrl(this.endpoint, customerId, storeId);
    return this.delete(url);
  }

  // Search customers by name, phone, or email
  searchCustomers(searchTerm, storeId = null) {
    const url = `${this.endpoint}/search`;
    return this.get(url, { q: searchTerm, ...(storeId && { store: storeId }) });
  }

  // Get customer statistics
  getCustomerStats(storeId = null) {
    const url = `${this.endpoint}/stats`;
    return this.get(url, storeId ? { store: storeId } : {});
  }

  // Bulk upload customers
  bulkUploadCustomers(file, storeId) {
    const url = `${this.endpoint}/bulk`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("store", storeId);

    return this.uploadAxios.post(url, formData);
  }
}

// Create and export a singleton instance
export const customerService = new CustomerService();
export default customerService;
