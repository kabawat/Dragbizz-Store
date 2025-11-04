import { API_CONFIG } from '@/config';
import { handleApiSuccess, handleApiErrorResponse } from '@/utils/errorHandler';
import { authAxios } from '@/service/config/axiosConfig';
import { attachQueryParams } from '@/utils/queryParams';

class SupplierService {
  constructor() {
    this.baseURL = API_CONFIG.BASE.URL;
  }

  // Create a new supplier
  async createSupplier(supplierData) {
    try {
      const response = await authAxios.post(API_CONFIG?.RETAILER?.SUPPLIER, supplierData);
      return handleApiSuccess(response?.data, 'Supplier created successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'supplier-creation');
    }
  }

  // Update an existing supplier
  async updateSupplier(supplierId, supplierData, storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.SUPPLIER}/${supplierId}`;

      // Add storeId as query parameter if provided
      if (storeId) {
        const params = { store: storeId };
        url = attachQueryParams(url, params);
      }

      const response = await authAxios.put(url, supplierData);
      return handleApiSuccess(response?.data, 'Supplier updated successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'supplier-updation');
    }
  }

  // Get all suppliers with query parameters
  async getSuppliers(params = {}) {
    try {
      // Build URL with query parameters
      const url = attachQueryParams(API_CONFIG?.RETAILER?.SUPPLIER, params);
      const response = await authAxios.get(url);
      return handleApiSuccess(response?.data, 'Suppliers fetched successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'suppliers-list');
    }
  }

  // Delete a supplier by ID
  async deleteSupplier(supplierId, storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.SUPPLIER}/${supplierId}`;

      // Add storeId as query parameter if provided
      if (storeId) {
        const params = { store: storeId };
        url = attachQueryParams(url, params);
      }

      const response = await authAxios.delete(url);
      return handleApiSuccess(response?.data, 'Supplier deleted successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'supplier-deletion');
    }
  }

  // Search suppliers by name, phone, or email
  async searchSuppliers(searchTerm, storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.SUPPLIER}/search`;

      const params = { q: searchTerm };
      if (storeId) {
        params.store = storeId;
      }

      url = attachQueryParams(url, params);
      const response = await authAxios.get(url);
      return handleApiSuccess(response?.data, 'Suppliers searched successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'supplier-search');
    }
  }

  // Get supplier statistics
  async getSupplierStats(storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.SUPPLIER}/stats`;

      if (storeId) {
        const params = { store: storeId };
        url = attachQueryParams(url, params);
      }

      const response = await authAxios.get(url);
      return handleApiSuccess(response?.data, 'Supplier statistics fetched successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'supplier-stats');
    }
  }
}

// Create and export a singleton instance
const supplierService = new SupplierService();
export default supplierService;
