import { API_CONFIG } from "@/config";
import { BaseService } from "@/service/base/BaseService";

class SubscriptionService extends BaseService {
  getSubscription(params = {}) {
    return this.get(API_CONFIG?.RETAILER?.SUBSCRIPTION, params);
  }
}

const subscriptionService = new SubscriptionService();
export default subscriptionService;
