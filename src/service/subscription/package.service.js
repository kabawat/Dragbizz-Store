import { API_CONFIG } from "@/config";
import { handleApiSuccess, handleApiErrorResponse } from "@/utils/errorHandler";
import { unauthAxios } from "@/service/config/axiosConfig";
import { attachQueryParams } from "@/utils/queryParams";

class PackageService {
  constructor() {
    this.baseURL = API_CONFIG.BASE.URL;
  }

  async getPackages(params = {}) {
    try {
      const url = attachQueryParams(API_CONFIG?.SUBSCRIPTION?.PACKAGES, params);
      const response = await unauthAxios.get(url);
      return handleApiSuccess(response?.data, "Packages fetched successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "packages-list");
    }
  }
}

const packageService = new PackageService();
export default packageService;
