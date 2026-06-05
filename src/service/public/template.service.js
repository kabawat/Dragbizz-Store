import { API_CONFIG } from "@/config";
import { BaseService } from "@/service/base/BaseService";

class PublicTemplateService extends BaseService {
  constructor() {
    super();
    this.endpoint = API_CONFIG?.RETAILER?.PUBLIC_TEMPLATES;
  }

  getTemplate(module = null) {
    return this.unauthAxios.get(this.endpoint, { params: module ? { module } : {} });
  }
}

const publicTemplateService = new PublicTemplateService();
export default publicTemplateService;
