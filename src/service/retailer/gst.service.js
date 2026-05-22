import { API_CONFIG } from "@/config";
import { BaseService } from "@/service/base/BaseService";

class GstService extends BaseService {
  constructor() {
    super();
    this.endpoint = API_CONFIG.RETAILER.GST;
  }

  getGstSummary(storeId, params = {}) {
    return this.get(`${this.endpoint}/summary`, { store: storeId, ...params });
  }

  getGstMismatches(storeId, params = {}) {
    return this.get(`${this.endpoint}/mismatches`, { store: storeId, ...params });
  }

  // Returns JSON only. Frontend generates CSV/XLSX using exportUtils.
  getGstExport(storeId, params = {}) {
    return this.get(`${this.endpoint}/export`, { store: storeId, ...params });
  }

  getGstHealthScore(storeId, params = {}) {
    return this.get(`${this.endpoint}/health-score`, { store: storeId, ...params });
  }

  syncGstStats(storeId, params = {}) {
    return this.post(`${this.endpoint}/sync`, params, { store: storeId });
  }
}

export const gstService = new GstService();
export default gstService;
