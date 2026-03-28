import { API_CONFIG } from "@/config";
import { BaseService } from "@/service/base/BaseService";

class InventoryService extends BaseService {
  constructor() {
    super();
    this.endpoint = API_CONFIG.RETAILER.STOCK;
  }

  // Get all inventories with query parameters
  getInventories(params = {}) {
    return this.get(this.endpoint, params);
  }

  // Get single inventory by ID
  getInventoryById(inventoryId, storeId = null) {
    const params = { inventoryId };
    if (storeId) params.store = storeId;
    return this.get(this.endpoint, params);
  }

  // Delete an inventory by ID
  deleteInventory(inventoryId, storeId = null) {
    const url = this.buildResourceUrl(this.endpoint, inventoryId, storeId);
    return this.delete(url);
  }

  // Add new inventory
  addInventory(data) {
    return this.post(this.endpoint, data);
  }
}

export const inventoryService = new InventoryService();
export default inventoryService;