import { API_CONFIG } from '@/config';
import { handleApiSuccess, handleApiErrorResponse } from '@/utils/errorHandler';
import { authAxios } from '@/service/config/axiosConfig';
import { attachQueryParams } from '@/utils/queryParams';

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
      return handleApiSuccess(response.data, 'Dashboard data fetched successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'dashboard-fetch');
    }
  }

  // Get Invoice Analytics
  async getInvoiceAnalytics(params = {}) {
    try {
      const url = attachQueryParams(`${API_CONFIG.RETAILER.ANALYTICS}/invoices`, params);
      const response = await authAxios.get(url);
      return handleApiSuccess(response.data, 'Invoice analytics fetched successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'invoice-analytics-fetch');
    }
  }
}

// Create and export a singleton instance
const dashboardService = new DashboardService();
export default dashboardService;

