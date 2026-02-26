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

      const response = await authAxios.get(`${API_CONFIG.SUBSCRIPTION.SUBSCRIPTIONS}/active`, { params });
      return handleApiSuccess(response.data, "Active subscription fetched successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "subscription-active");
    }
  }

  async getUserSubscriptions(userId, params = {}) {
    try {
      const url = attachQueryParams(`${API_CONFIG.SUBSCRIPTION.SUBSCRIPTIONS}/user/${userId}`, params);
      const response = await authAxios.get(url);
      return handleApiSuccess(response.data, "Subscriptions fetched successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "subscriptions-list");
    }
  }

  async getSubscriptionById(subscriptionId) {
    try {
      const response = await authAxios.get(`${API_CONFIG.SUBSCRIPTION.SUBSCRIPTIONS}/${subscriptionId}`);
      return handleApiSuccess(response.data, "Subscription fetched successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "subscription-get");
    }
  }
}

const subscriptionService = new SubscriptionService();
export default subscriptionService;
