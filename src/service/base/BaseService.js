import { API_CONFIG } from "@/config";
import { handleApiSuccess, handleApiErrorResponse } from "@/utils/errorHandler";
import { authAxios, unauthAxios } from "@/service/config/axiosConfig";
import { attachQueryParams } from "@/utils/queryParams";

export class BaseService {
  constructor(baseURL = null) {
    this.baseURL = baseURL || API_CONFIG.BASE.URL;
    this.authAxios = authAxios;
    this.unauthAxios = unauthAxios;
  }

  buildUrl(endpoint, params = {}) {
    if (!endpoint) return null;
    return attachQueryParams(endpoint, params);
  }

  async handleRequest(requestFn, context = "general", successMessage = null) {
    try {
      const response = await requestFn();
      return handleApiSuccess(
        response?.data || response,
        successMessage || "Operation successful"
      );
    } catch (error) {
      return handleApiErrorResponse(error, context);
    }
  }

  async get(url, params = {}, context = "general", successMessage = null) {
    return this.handleRequest(
      () => this.authAxios.get(this.buildUrl(url, params)),
      context,
      successMessage
    );
  }

  async post(url, data = {}, params = {}, context = "general", successMessage = null) {
    return this.handleRequest(
      () => this.authAxios.post(this.buildUrl(url, params), data),
      context,
      successMessage
    );
  }

  async put(url, data = {}, params = {}, context = "general", successMessage = null) {
    return this.handleRequest(
      () => this.authAxios.put(this.buildUrl(url, params), data),
      context,
      successMessage
    );
  }

  async patch(url, data = {}, params = {}, context = "general", successMessage = null) {
    return this.handleRequest(
      () => this.authAxios.patch(this.buildUrl(url, params), data),
      context,
      successMessage
    );
  }

  async delete(url, params = {}, context = "general", successMessage = null) {
    return this.handleRequest(
      () => this.authAxios.delete(this.buildUrl(url, params)),
      context,
      successMessage
    );
  }

  async unauthGet(url, params = {}, context = "general", successMessage = null) {
    return this.handleRequest(
      () => this.unauthAxios.get(this.buildUrl(url, params)),
      context,
      successMessage
    );
  }

  async unauthPost(url, data = {}, params = {}, context = "general", successMessage = null) {
    return this.handleRequest(
      () => this.unauthAxios.post(this.buildUrl(url, params), data),
      context,
      successMessage
    );
  }

  async unauthPut(url, data = {}, params = {}, context = "general", successMessage = null) {
    return this.handleRequest(
      () => this.unauthAxios.put(this.buildUrl(url, params), data),
      context,
      successMessage
    );
  }

  buildResourceUrl(resourceEndpoint, resourceId, storeId = null) {
    let url = resourceId
      ? `${resourceEndpoint}/${resourceId}`
      : resourceEndpoint;

    if (storeId) {
      const params = { store: storeId };
      url = this.buildUrl(url, params);
    }

    return url;
  }

  cleanPayload(payload) {
    const cleaned = { ...payload };
    Object.keys(cleaned).forEach((key) => {
      if (cleaned[key] === undefined) {
        delete cleaned[key];
      }
    });
    return cleaned;
  }
}

