import { API_CONFIG } from "@/config";
import { authAxios } from "@/service/config/axiosConfig";
import { handleApiErrorResponse, handleApiSuccess } from "@/utils/errorHandler";
import { attachQueryParams } from "@/utils/queryParams";

class InventoryService {
  constructor() {
    this.baseURL = API_CONFIG.BASE.URL;
  }

  // Update an existing inventory
  async updateInventory(inventoryId, inventoryData, storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.STOCK}/${inventoryId}`;

      // Add storeId as query parameter if provided
      if (storeId) {
        const params = { store: storeId };
        url = attachQueryParams(url, params);
      }

      const response = await authAxios.put(url, inventoryData);
      return handleApiSuccess(response?.data, "Inventory updated successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "inventory-updation");
    }
  }

  // Get all inventories with query parameters
  async getInventories(params = {}) {
    try {
      // Build URL with query parameters
      const url = attachQueryParams(API_CONFIG?.RETAILER?.STOCK, params);
      const response = await authAxios.get(url);
      return handleApiSuccess(
        response?.data,
        "Inventories fetched successfully"
      );
    } catch (error) {
      return handleApiErrorResponse(error, "inventories-list");
    }
  }

  // Get single inventory by ID
  async getInventoryById(inventoryId, storeId = null) {
    try {
      const params = { inventoryId };
      if (storeId) {
        params.store = storeId;
      }

      const url = attachQueryParams(API_CONFIG?.RETAILER?.STOCK, params);
      const response = await authAxios.get(url);
      return handleApiSuccess(response?.data, "Inventory fetched successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "inventory-details");
    }
  }

  // Delete an inventory by ID
  async deleteInventory(inventoryId, storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.STOCK}/${inventoryId}`;

      // Add storeId as query parameter if provided
      if (storeId) {
        const params = { store: storeId };
        url = attachQueryParams(url, params);
      }

      const response = await authAxios.delete(url);
      return handleApiSuccess(response?.data, "Inventory deleted successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "inventory-deletion");
    }
  }

}

// Create and export a singleton instance
const inventoryService = new InventoryService();
export default inventoryService;
