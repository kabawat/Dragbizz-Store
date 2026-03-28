import { API_CONFIG } from "@/config";
import { BaseService } from "@/service/base/BaseService";

class BillService extends BaseService {
  constructor() {
    super();
    this.endpoint = API_CONFIG?.RETAILER?.BILL;
  }

  // Create a new bill
  createBill(billData) {
    // Strip undefined values without mutating the original object
    const payload = Object.fromEntries(
      Object.entries(billData).filter(([, v]) => v !== undefined)
    );
    return this.post(this.endpoint, payload);
  }

  // Update an existing bill
  updateBill(billId, billData, storeId = null) {
    const url = this.buildResourceUrl(this.endpoint, billId, storeId);
    return this.put(url, billData);
  }

  // Get all bills with query parameters
  getBills(params = {}) {
    return this.get(this.endpoint, params);
  }

  // Delete a bill by ID
  deleteBill(billId, storeId = null) {
    const url = this.buildResourceUrl(this.endpoint, billId, storeId);
    return this.delete(url);
  }
}

const billService = new BillService();
export default billService;
