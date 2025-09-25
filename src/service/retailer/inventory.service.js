import { API_CONFIG } from '@/config';
import { handleApiSuccess, handleApiErrorResponse } from '@/utils/errorHandler';
import { retailerAxios } from '@/service/config/axiosConfig';
import { attachQueryParams } from '@/utils/queryParams';

class InventoryService {
  constructor() {
    this.baseURL = API_CONFIG.BASE.URL;
  }

  // Create a new inventory item
  async createInventory(inventoryData) {
    try {
      const response = await retailerAxios.post(API_CONFIG?.RETAILER?.INVENTORY, inventoryData);
      return handleApiSuccess(response?.data, 'Inventory item created successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'inventory-creation');
    }
  }

  // Update an existing inventory item
  async updateInventory(inventoryId, inventoryData, storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.INVENTORY}/${inventoryId}`;

      // Add storeId as query parameter if provided
      if (storeId) {
        const params = { store: storeId };
        url = attachQueryParams(url, params);
      }

      const response = await retailerAxios.put(url, inventoryData);
      return handleApiSuccess(response?.data, 'Inventory item updated successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'inventory-updation');
    }
  }

  // Get all inventory items with query parameters
  async getInventory(params = {}) {
    try {
      // Build URL with query parameters
      const url = attachQueryParams(API_CONFIG?.RETAILER?.INVENTORY, params);
      const response = await retailerAxios.get(url);
      return handleApiSuccess(response?.data, 'Inventory items fetched successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'inventory-list');
    }
  }

  // Delete an inventory item by ID
  async deleteInventory(inventoryId, storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.INVENTORY}/${inventoryId}`;

      // Add storeId as query parameter if provided
      if (storeId) {
        const params = { store: storeId };
        url = attachQueryParams(url, params);
      }

      const response = await retailerAxios.delete(url);
      return handleApiSuccess(response?.data, 'Inventory item deleted successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'inventory-deletion');
    }
  }

  // Get inventory statistics
  async getInventoryStats(storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.INVENTORY}/stats`;

      if (storeId) {
        const params = { store: storeId };
        url = attachQueryParams(url, params);
      }

      const response = await retailerAxios.get(url);
      return handleApiSuccess(response?.data, 'Inventory statistics fetched successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'inventory-stats');
    }
  }

  // Search inventory items
  async searchInventory(searchTerm, storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.INVENTORY}/search`;

      const params = { q: searchTerm };
      if (storeId) {
        params.store = storeId;
      }

      url = attachQueryParams(url, params);
      const response = await retailerAxios.get(url);
      return handleApiSuccess(response?.data, 'Inventory items searched successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'inventory-search');
    }
  }

  // Update stock levels
  async updateStock(inventoryId, stockData, storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.INVENTORY}/${inventoryId}/stock`;

      if (storeId) {
        const params = { store: storeId };
        url = attachQueryParams(url, params);
      }

      const response = await retailerAxios.put(url, stockData);
      return handleApiSuccess(response?.data, 'Stock updated successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'stock-update');
    }
  }

  // Get low stock alerts
  async getLowStockAlerts(storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.INVENTORY}/alerts/low-stock`;

      if (storeId) {
        const params = { store: storeId };
        url = attachQueryParams(url, params);
      }

      const response = await retailerAxios.get(url);
      return handleApiSuccess(response?.data, 'Low stock alerts fetched successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'low-stock-alerts');
    }
  }
}

// Create and export a singleton instance
const inventoryService = new InventoryService();
export default inventoryService;
