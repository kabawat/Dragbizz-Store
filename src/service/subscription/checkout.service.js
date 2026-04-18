import { API_CONFIG } from "@/config";
import { BaseService } from "@/service/base/BaseService";

class CheckoutService extends BaseService {
  createCheckoutSession(checkoutData) {
    return this.post(`${API_CONFIG?.SUBSCRIPTION?.CHECKOUT}/session`, checkoutData);
  }

  createPaymentOrder(orderData) {
    return this.post(`${API_CONFIG?.SUBSCRIPTION?.PAYMENT}/create-order`, orderData);
  }

  verifyPayment(paymentData) {
    return this.post(`${API_CONFIG?.SUBSCRIPTION?.PAYMENT}/verify`, paymentData);
  }
}

const checkoutService = new CheckoutService();
export default checkoutService;

