import { API_CONFIG } from "@/config";
import { BaseService } from "@/service/base/BaseService";

class CatalogService extends BaseService {
  constructor() {
    super();
    this.endpoint = API_CONFIG.RETAILER.CATALOG;
  }

  getCatalogs(params = {}) {
    return this.get(this.endpoint, params);
  }

  getCatalog(id) {
    return this.get(this.endpoint, { id });
  }

  createCatalog(payload) {
    return this.post(this.endpoint, payload);
  }

  updateCatalog(id, payload) {
    return this.put(`${this.endpoint}/${id}`, payload);
  }

  deleteCatalog(id) {
    return this.delete(`${this.endpoint}/${id}`);
  }
}

export default new CatalogService();
