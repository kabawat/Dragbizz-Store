import { API_CONFIG } from "@/config";
import { BaseService } from "@/service/base/BaseService";

class PurchaseOrderService extends BaseService {
  constructor() {
    super();
    this.endpoint = API_CONFIG?.RETAILER?.PURCHASE_ORDER;
  }

  // Create a new purchase order
  createPurchaseOrder(poData) {
    const payload = { ...poData };
    // Strip undefined properties
    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined) {
        delete payload[key];
      }
    });

    return this.post(this.endpoint, payload);
  }

  // Get purchase orders (list)
  getPurchaseOrders(params = {}) {
    return this.get(this.endpoint, params);
  }

  // Update a purchase order
  updatePurchaseOrder(poId, updateData, storeId = null) {
    const url = this.buildResourceUrl(this.endpoint, poId, storeId);
    return this.put(url, updateData);
  }

  // Get single purchase order details
  getPurchaseOrder(poId, storeId = null) {
    const url = this.buildResourceUrl(this.endpoint, poId, storeId);
    return this.get(url);
  }

  // Delete a purchase order
  deletePurchaseOrder(poId, storeId = null) {
    const url = this.buildResourceUrl(this.endpoint, poId, storeId);
    return this.delete(url);
  }
}

// Create and export a singleton instance
export const purchaseOrderService = new PurchaseOrderService();
export default purchaseOrderService;
