import { API_CONFIG } from "@/config";
import { BaseService } from "@/service/base/BaseService";

class DashboardService extends BaseService {
  constructor() {
    super();
    this.endpoint = API_CONFIG.RETAILER.DASHBOARD;
  }

  // Get Dashboard Data
  getDashboard(params = {}) {
    const queryParams = { ...params };
    if (queryParams.storeId) {
      queryParams.store = queryParams.storeId;
      delete queryParams.storeId;
    }
    return this.get(this.endpoint, queryParams);
  }
}

// Create and export a singleton instance
const dashboardService = new DashboardService();
export default dashboardService;
