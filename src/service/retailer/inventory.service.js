import { API_CONFIG } from "@/config";
import { handleApiSuccess, handleApiErrorResponse } from "@/utils/errorHandler";
import { authAxios } from "@/service/config/axiosConfig";
import { attachQueryParams } from "@/utils/queryParams";

class InventoryService {
  constructor() {
    this.baseURL = API_CONFIG.BASE.URL;
  }

  // Create a new inventory entry (add stock)
  async createInventory(inventoryData) {
    try {
      const response = await authAxios.post(
        API_CONFIG?.RETAILER?.STOCK,
        inventoryData,
      );
      return handleApiSuccess(response?.data, "Inventory created successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "inventory-creation");
    }
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
        "Inventories fetched successfully",
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

  // Add stock to existing inventory
  async addStock(stockData) {
    try {
      const response = await authAxios.post(
        API_CONFIG?.RETAILER?.STOCK,
        stockData,
      );
      return handleApiSuccess(response?.data, "Stock added successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "stock-addition");
    }
  }

  // Get inventory statistics
  async getInventoryStats(storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.STOCK}/stats`;

      if (storeId) {
        const params = { store: storeId };
        url = attachQueryParams(url, params);
      }

      const response = await authAxios.get(url);
      return handleApiSuccess(
        response?.data,
        "Inventory statistics fetched successfully",
      );
    } catch (error) {
      return handleApiErrorResponse(error, "inventory-stats");
    }
  }

  // Get low stock alerts
  async getLowStockAlerts(storeId = null, threshold = 10) {
    try {
      const params = { lowStock: true, threshold };
      if (storeId) {
        params.store = storeId;
      }

      const url = attachQueryParams(API_CONFIG?.RETAILER?.STOCK, params);
      const response = await authAxios.get(url);
      return handleApiSuccess(
        response?.data,
        "Low stock alerts fetched successfully",
      );
    } catch (error) {
      return handleApiErrorResponse(error, "low-stock-alerts");
    }
  }

  // Get out of stock items
  async getOutOfStockItems(storeId = null) {
    try {
      const params = { outOfStock: true };
      if (storeId) {
        params.store = storeId;
      }

      const url = attachQueryParams(API_CONFIG?.RETAILER?.STOCK, params);
      const response = await authAxios.get(url);
      return handleApiSuccess(
        response?.data,
        "Out of stock items fetched successfully",
      );
    } catch (error) {
      return handleApiErrorResponse(error, "out-of-stock-items");
    }
  }

  // Search inventories
  async searchInventories(searchTerm, storeId = null, filters = {}) {
    try {
      let url = `${API_CONFIG?.RETAILER?.STOCK}/search`;

      const params = { q: searchTerm, ...filters };
      if (storeId) {
        params.store = storeId;
      }

      url = attachQueryParams(url, params);
      const response = await authAxios.get(url);
      return handleApiSuccess(
        response?.data,
        "Inventories searched successfully",
      );
    } catch (error) {
      return handleApiErrorResponse(error, "inventory-search");
    }
  }

  // Get inventory by product
  async getInventoryByProduct(productId, storeId = null) {
    try {
      const params = { productId };
      if (storeId) {
        params.store = storeId;
      }

      const url = attachQueryParams(API_CONFIG?.RETAILER?.STOCK, params);
      const response = await authAxios.get(url);
      return handleApiSuccess(
        response?.data,
        "Product inventory fetched successfully",
      );
    } catch (error) {
      return handleApiErrorResponse(error, "product-inventory");
    }
  }

  // Get inventory by supplier
  async getInventoryBySupplier(supplierId, storeId = null) {
    try {
      const params = { supplierId };
      if (storeId) {
        params.store = storeId;
      }

      const url = attachQueryParams(API_CONFIG?.RETAILER?.STOCK, params);
      const response = await authAxios.get(url);
      return handleApiSuccess(
        response?.data,
        "Supplier inventory fetched successfully",
      );
    } catch (error) {
      return handleApiErrorResponse(error, "supplier-inventory");
    }
  }

  // Bulk update inventory
  async bulkUpdateInventory(updates, storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.STOCK}/bulk`;

      if (storeId) {
        const params = { store: storeId };
        url = attachQueryParams(url, params);
      }

      const response = await authAxios.put(url, { updates });
      return handleApiSuccess(
        response?.data,
        "Inventory bulk updated successfully",
      );
    } catch (error) {
      return handleApiErrorResponse(error, "inventory-bulk-update");
    }
  }

  // Export inventory data
  async exportInventory(storeId = null, format = "csv", filters = {}) {
    try {
      let url = `${API_CONFIG?.RETAILER?.STOCK}/export`;

      const params = { format, ...filters };
      if (storeId) {
        params.store = storeId;
      }

      url = attachQueryParams(url, params);
      const response = await authAxios.get(url, {
        responseType: "blob",
      });
      return handleApiSuccess(
        response?.data,
        "Inventory exported successfully",
      );
    } catch (error) {
      return handleApiErrorResponse(error, "inventory-export");
    }
  }

  // Get inventory alerts and notifications
  async getInventoryAlerts(storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.STOCK}/alerts`;

      if (storeId) {
        const params = { store: storeId };
        url = attachQueryParams(url, params);
      }

      const response = await authAxios.get(url);
      return handleApiSuccess(
        response?.data,
        "Inventory alerts fetched successfully",
      );
    } catch (error) {
      return handleApiErrorResponse(error, "inventory-alerts");
    }
  }

  // Get inventory movement history
  async getInventoryHistory(inventoryId, storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.STOCK}/${inventoryId}/history`;

      if (storeId) {
        const params = { store: storeId };
        url = attachQueryParams(url, params);
      }

      const response = await authAxios.get(url);
      return handleApiSuccess(
        response?.data,
        "Inventory history fetched successfully",
      );
    } catch (error) {
      return handleApiErrorResponse(error, "inventory-history");
    }
  }
}

// Create and export a singleton instance
const inventoryService = new InventoryService();
export default inventoryService;
