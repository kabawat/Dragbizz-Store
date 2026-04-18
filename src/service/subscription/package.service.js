import { API_CONFIG } from "@/config";
import { BaseService } from "@/service/base/BaseService";

class PackageService extends BaseService {
  getPackages(params = {}) {
    return this.unauthGet(API_CONFIG?.SUBSCRIPTION?.PACKAGES, params);
  }
}

const packageService = new PackageService();
export default packageService;

