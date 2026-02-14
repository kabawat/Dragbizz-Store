import { API_CONFIG } from "@/config";
import { authAxios } from "@/service/config/axiosConfig";
import { handleApiErrorResponse, handleApiSuccess } from "@/utils/errorHandler";
import { attachQueryParams } from "@/utils/queryParams";

class GstService {
  constructor() {
    this.baseURL = API_CONFIG.BASE.URL;
  }

  async getGstSummary(storeId, params = {}) {
    try {
      const url = attachQueryParams(
        `${API_CONFIG.RETAILER.GST}/summary`,
        { store: storeId, ...params }
      );
      const response = await authAxios.get(url);
      return handleApiSuccess(
        response.data,
        "GST summary fetched successfully"
      );
    } catch (error) {
      return handleApiErrorResponse(error, "gst-summary-fetch");
    }
  }

  async getGstMismatches(storeId, params = {}) {
    try {
      const url = attachQueryParams(
        `${API_CONFIG.RETAILER.GST}/mismatches`,
        { store: storeId, ...params }
      );
      const response = await authAxios.get(url);
      return handleApiSuccess(
        response.data,
        "GST mismatches fetched successfully"
      );
    } catch (error) {
      return handleApiErrorResponse(error, "gst-mismatches-fetch");
    }
  }

  /**
   * Returns JSON only. Frontend generates CSV/XLSX using exportUtils.
   */
  async getGstExport(storeId, params = {}) {
    try {
      const url = attachQueryParams(
        `${API_CONFIG.RETAILER.GST}/export`,
        { store: storeId, ...params }
      );
      const response = await authAxios.get(url);
      return handleApiSuccess(
        response.data,
        "GST export data fetched successfully"
      );
    } catch (error) {
      return handleApiErrorResponse(error, "gst-export-fetch");
    }
  }

  async getGstHealthScore(storeId, params = {}) {
    try {
      const url = attachQueryParams(
        `${API_CONFIG.RETAILER.GST}/health-score`,
        { store: storeId, ...params }
      );
      const response = await authAxios.get(url);
      return handleApiSuccess(
        response.data,
        "GST health score fetched successfully"
      );
    } catch (error) {
      return handleApiErrorResponse(error, "gst-health-score-fetch");
    }
  }

  async syncGstStats(storeId, params = {}) {
    try {
      const url = attachQueryParams(
        `${API_CONFIG.RETAILER.GST}/sync`,
        { store: storeId }
      );
      const response = await authAxios.post(url, params);
      return handleApiSuccess(
        response.data,
        "GST statistics synced successfully"
      );
    } catch (error) {
      return handleApiErrorResponse(error, "gst-sync-stats");
    }
  }
}

const gstService = new GstService();
export default gstService;
