import { API_CONFIG } from "@/config";
import { BaseService } from "@/service/base/BaseService";

class PackageService extends BaseService {
  constructor() {
    super();
    this.endpoint = API_CONFIG.RETAILER.PACKAGES;
  }

  getPackages(params = {}) {
    return this.get(this.endpoint, params);
  }

  createPackage(packageData) {
    return this.post(this.endpoint, packageData);
  }

  updatePackage(packageId, packageData) {
    return this.put(`${this.endpoint}/${packageId}`, packageData);
  }

  deletePackage(packageId) {
    return this.delete(`${this.endpoint}/${packageId}`);
  }
}

const packageService = new PackageService();
export default packageService;
