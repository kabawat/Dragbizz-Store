import { API_CONFIG } from "@/config";
import { BaseService } from "@/service/base/BaseService";

class SubscriptionService extends BaseService {
  getActiveSubscription(userId = null) {
    const params = {
      ...(userId && { userId }),
      populatePackage: false,
      fields: "_id,status,startDate,endDate,features,packageId",
    };

    return this.get(`${API_CONFIG.RETAILER.SUBSCRIPTION}/active`, params);
  }

  getSubscriptionHistory(params = {}) {
    return this.get(`${API_CONFIG.RETAILER.SUBSCRIPTION}/history`, params);
  }
}

const subscriptionService = new SubscriptionService();
export default subscriptionService;

