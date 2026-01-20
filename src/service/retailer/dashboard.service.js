import { API_CONFIG } from "@/config";
import { authAxios } from "@/service/config/axiosConfig";
import { handleApiErrorResponse, handleApiSuccess } from "@/utils/errorHandler";
import { attachQueryParams } from "@/utils/queryParams";

class DashboardService {
  constructor() {
    this.baseURL = API_CONFIG.BASE.URL;
  }

  // Get Dashboard Data
  async getDashboard(params = {}) {
    try {
      // Ensure store ID is passed as query parameter
      const queryParams = { ...params };
      if (params.storeId) {
        queryParams.store = params.storeId;
        delete queryParams.storeId;
      }
      const url = attachQueryParams(API_CONFIG.RETAILER.DASHBOARD, queryParams);
      const response = await authAxios.get(url);
      return handleApiSuccess(
        response.data,
        "Dashboard data fetched successfully"
      );
    } catch (error) {
      return handleApiErrorResponse(error, "dashboard-fetch");
    }
  }
}

// Create and export a singleton instance
const dashboardService = new DashboardService();
export default dashboardService;
