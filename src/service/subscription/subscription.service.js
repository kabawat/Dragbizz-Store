import { API_CONFIG } from "@/config";
import { authAxios } from "@/service/config/axiosConfig";
import { handleApiErrorResponse, handleApiSuccess } from "@/utils/errorHandler";
import { attachQueryParams } from "@/utils/queryParams";

class SubscriptionService {
  constructor() {
    this.baseURL = API_CONFIG.BASE.URL;
  }

  async getActiveSubscription(userId = null) {
    try {
      const params = {
        ...(userId && { userId }),
        populatePackage: false,
        fields: "_id,status,startDate,endDate,features,packageId",
      };

      const response = await authAxios.get(
        `${API_CONFIG.SUBSCRIPTION.SUBSCRIPTIONS}/active`,
        { params }
      );

      return handleApiSuccess(
        response.data,
        "Active subscription fetched successfully"
      );
    } catch (error) {
      return handleApiErrorResponse(error, "subscription-active");
    }
  }


  async checkUsage(featureKey, quantity = 1) {
    try {
      const response = await authAxios.post(
        `${API_CONFIG.SUBSCRIPTION.USAGE}/check`,
        {
          featureKey,
          quantity,
        }
      );
      return handleApiSuccess(response.data, "Usage check completed");
    } catch (error) {
      return handleApiErrorResponse(error, "usage-check");
    }
  }
}

const subscriptionService = new SubscriptionService();
export default subscriptionService;
