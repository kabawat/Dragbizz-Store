import { API_CONFIG } from '@/config';
import { handleApiSuccess, handleApiErrorResponse } from '@/utils/errorHandler';
import { authAxios } from '@/service/config/axiosConfig';
import { attachQueryParams } from '@/utils/queryParams';

class SubscriptionService {
  constructor() {
    this.baseURL = API_CONFIG.BASE.URL;
  }

  async getActiveSubscription(userId) {
    try {
      const response = await authAxios.get(`${API_CONFIG.SUBSCRIPTION.SUBSCRIPTIONS}/active`, {
        params: { userId }
      });
      return handleApiSuccess(response.data, 'Active subscription fetched successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'subscription-active');
    }
  }

  async getUserSubscriptions(userId, params = {}) {
    try {
      const url = attachQueryParams(`${API_CONFIG.SUBSCRIPTION.SUBSCRIPTIONS}/user/${userId}`, params);
      const response = await authAxios.get(url);
      return handleApiSuccess(response.data, 'Subscriptions fetched successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'subscriptions-list');
    }
  }

  async getSubscriptionById(subscriptionId) {
    try {
      const response = await authAxios.get(`${API_CONFIG.SUBSCRIPTION.SUBSCRIPTIONS}/${subscriptionId}`);
      return handleApiSuccess(response.data, 'Subscription fetched successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'subscription-get');
    }
  }

  /**
   * Get remaining quota for a feature or all features
   * @param {string} featureKey - Optional feature key (e.g., 'invoice_management')
   * @returns {Promise} - Quota information
   */
  async getQuota(featureKey = null) {
    try {
      const url = featureKey 
        ? `${API_CONFIG.SUBSCRIPTION.USAGE}/quota?featureKey=${featureKey}`
        : `${API_CONFIG.SUBSCRIPTION.USAGE}/quota`;
      const response = await authAxios.get(url);
      return handleApiSuccess(response.data, 'Quota fetched successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'quota-get');
    }
  }

  /**
   * Check if user can use a feature
   * @param {string} featureKey - Feature key (e.g., 'invoice_management')
   * @param {number} quantity - Quantity to check (default: 1)
   * @returns {Promise} - Check result
   */
  async checkUsage(featureKey, quantity = 1) {
    try {
      const response = await authAxios.post(`${API_CONFIG.SUBSCRIPTION.USAGE}/check`, {
        featureKey,
        quantity
      });
      return handleApiSuccess(response.data, 'Usage check completed');
    } catch (error) {
      return handleApiErrorResponse(error, 'usage-check');
    }
  }
}

const subscriptionService = new SubscriptionService();
export default subscriptionService;

