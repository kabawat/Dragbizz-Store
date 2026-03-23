import { authAxios, unauthAxios, uploadAxios } from "@/service/config/axiosConfig";
import { attachQueryParams } from "@/utils/queryParams";

export class BaseService {
  constructor() {
    this.authAxios = authAxios;
    this.unauthAxios = unauthAxios;
    this.uploadAxios = uploadAxios;
  }

  buildUrl(endpoint, params = {}) {
    return attachQueryParams(endpoint, params);
  }

  // Auth methods
  async get(url, params = {}) {
    return this.authAxios.get(this.buildUrl(url, params));
  }

  async post(url, data = {}, params = {}) {
    return this.authAxios.post(this.buildUrl(url, params), data);
  }

  async put(url, data = {}, params = {}) {
    return this.authAxios.put(this.buildUrl(url, params), data);
  }

  async patch(url, data = {}, params = {}) {
    return this.authAxios.patch(this.buildUrl(url, params), data);
  }

  async delete(url, params = {}) {
    return this.authAxios.delete(this.buildUrl(url, params));
  }

  // Unauth methods
  async unauthGet(url, params = {}) {
    return this.unauthAxios.get(this.buildUrl(url, params));
  }

  async unauthPost(url, data = {}, params = {}) {
    return this.unauthAxios.post(this.buildUrl(url, params), data);
  }

  // Helper
  buildResourceUrl(resourceEndpoint, resourceId, storeId = null) {
    let url = resourceId ? `${resourceEndpoint}/${resourceId}` : resourceEndpoint;
    return storeId ? this.buildUrl(url, { store: storeId }) : url;
  }
}
