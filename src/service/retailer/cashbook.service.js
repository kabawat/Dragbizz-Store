import { API_CONFIG } from "@/config";
import { BaseService } from "@/service/base/BaseService";

class CashbookService extends BaseService {
  constructor() {
    super();
    this.endpoint = API_CONFIG?.RETAILER?.CASHBOOK;
  }

  createEntry(data) {
    return this.post(this.endpoint, data);
  }

  updateEntry(entryId, data, storeId = null) {
    const url = this.buildResourceUrl(this.endpoint, entryId, storeId);
    return this.put(url, data);
  }

  getEntries(params = {}) {
    return this.get(this.endpoint, params);
  }

  deleteEntry(entryId, storeId = null) {
    const url = this.buildResourceUrl(this.endpoint, entryId, storeId);
    return this.delete(url);
  }

  getSummary(params = {}) {
    return this.get(`${this.endpoint}/summary`, params);
  }

  getAnalytics(params = {}) {
    return this.get(`${API_CONFIG.RETAILER.ANALYTICS}/cashbook`, params);
  }
}

export const cashbookService = new CashbookService();
export default cashbookService;
