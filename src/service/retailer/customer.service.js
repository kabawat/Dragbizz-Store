import { API_CONFIG } from '@/config';
import { handleApiSuccess, handleApiErrorResponse } from '@/utils/errorHandler';
import { retailerAxios } from '@/service/config/axiosConfig';
import { attachQueryParams } from '@/utils/queryParams';

class CustomerService {
  constructor() {
    this.baseURL = API_CONFIG.BASE.URL;
  }

  // Create a new customer
  async createCustomer(customerData) {
    try {
      const response = await retailerAxios.post(API_CONFIG?.RETAILER?.CUSTOMER, customerData);
      return handleApiSuccess(response?.data, 'Customer created successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'customer-creation');
    }
  }

  // Update an existing customer
  async updateCustomer(customerId, customerData, storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.CUSTOMER}/${customerId}`;

      // Add storeId as query parameter if provided
      if (storeId) {
        const params = { store: storeId };
        url = attachQueryParams(url, params);
      }

      const response = await retailerAxios.put(url, customerData);
      return handleApiSuccess(response?.data, 'Customer updated successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'customer-updation');
    }
  }

  // Get all customers with query parameters
  async getCustomers(params = {}) {
    try {
      // Build URL with query parameters
      const url = attachQueryParams(API_CONFIG?.RETAILER?.CUSTOMER, params);
      console.log('Customer API URL:', url);
      console.log('Customer API params:', params);
      const response = await retailerAxios.get(url);
      console.log('Customer API response:', response?.data);
      return handleApiSuccess(response?.data, 'Customers fetched successfully');
    } catch (error) {
      console.error('Customer API error:', error);
      return handleApiErrorResponse(error, 'customers-list');
    }
  }

  // Delete a customer by ID
  async deleteCustomer(customerId, storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.CUSTOMER}/${customerId}`;

      // Add storeId as query parameter if provided
      if (storeId) {
        const params = { store: storeId };
        url = attachQueryParams(url, params);
      }

      const response = await retailerAxios.delete(url);
      return handleApiSuccess(response?.data, 'Customer deleted successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'customer-deletion');
    }
  }

  // Search customers by name, phone, or email
  async searchCustomers(searchTerm, storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.CUSTOMER}/search`;

      const params = { q: searchTerm };
      if (storeId) {
        params.store = storeId;
      }

      url = attachQueryParams(url, params);
      const response = await retailerAxios.get(url);
      return handleApiSuccess(response?.data, 'Customers searched successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'customer-search');
    }
  }

  // Get customer statistics
  async getCustomerStats(storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.CUSTOMER}/stats`;

      if (storeId) {
        const params = { store: storeId };
        url = attachQueryParams(url, params);
      }

      const response = await retailerAxios.get(url);
      return handleApiSuccess(response?.data, 'Customer statistics fetched successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'customer-stats');
    }
  }
}

// Create and export a singleton instance
const customerService = new CustomerService();
export default customerService;
