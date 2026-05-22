import { API_CONFIG } from "@/config";
import { BaseService } from "@/service/base/BaseService";

class AgencyService extends BaseService {
  constructor() {
    super();
    this.endpoint = API_CONFIG.RETAILER.AGENCY;
  }

  getSummary() {
    return this.get(`${this.endpoint}/summary`);
  }
}

const agencyService = new AgencyService();
export default agencyService;
