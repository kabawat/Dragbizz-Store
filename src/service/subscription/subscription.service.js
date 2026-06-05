import { API_CONFIG } from "@/config";
import { BaseService } from "@/service/base/BaseService";

class SubscriptionService extends BaseService {
  getActiveSubscription(userId = null) {
    const params = {
      ...(userId && { userId }),
      populatePackage: false,
      fields: "_id,status,startDate,endDate,features,packageId",
    };

    return this.get(`${API_CONFIG.SUBSCRIPTION.SUBSCRIPTIONS}/active`, params);
  }

  checkUsage(featureKey, quantity = 1) {
    // Note: USAGE endpoint should be defined in API_CONFIG.SUBSCRIPTION
    const endpoint = API_CONFIG.SUBSCRIPTION.USAGE || "/plans/usage";
    return this.post(`${endpoint}/check`, {
      featureKey,
      quantity,
    });
  }
}

const subscriptionService = new SubscriptionService();
export default subscriptionService;

