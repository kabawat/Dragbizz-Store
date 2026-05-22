import { API_CONFIG } from "@/config";
import { BaseService } from "@/service/base/BaseService";

class SalesOrderService extends BaseService {
  constructor() {
    super();
    this.endpoint = API_CONFIG.RETAILER.SALES_ORDER;
  }

  // Get Sales Orders (List/Single)
  getSalesOrders(params = {}) {
    return this.get(this.endpoint, params);
  }

  // Update Status
  updateStatus(id, payload, params = {}) {
    return this.put(`${this.endpoint}/status/${id}`, payload, params);
  }
}

export const salesOrderService = new SalesOrderService();
export default salesOrderService;
