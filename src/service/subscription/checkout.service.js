import { API_CONFIG } from "@/config";
import { authAxios } from "@/service/config/axiosConfig";
import { handleApiErrorResponse, handleApiSuccess } from "@/utils/errorHandler";

class CheckoutService {
  constructor() {
    this.baseURL = API_CONFIG.BASE.URL;
  }

  async createCheckoutSession(checkoutData) {
    try {
      const response = await authAxios.post(
        `${API_CONFIG?.SUBSCRIPTION?.CHECKOUT}/session`,
        checkoutData
      );
      return handleApiSuccess(
        response?.data,
        "Checkout session created successfully"
      );
    } catch (error) {
      return handleApiErrorResponse(error, "checkout-session");
    }
  }

  async createPaymentOrder(orderData) {
    try {
      const response = await authAxios.post(
        `${API_CONFIG?.SUBSCRIPTION?.PAYMENT}/create-order`,
        orderData
      );
      return handleApiSuccess(
        response?.data,
        "Payment order created successfully"
      );
    } catch (error) {
      return handleApiErrorResponse(error, "payment-order");
    }
  }

  async verifyPayment(paymentData) {
    try {
      const response = await authAxios.post(
        `${API_CONFIG?.SUBSCRIPTION?.PAYMENT}/verify`,
        paymentData
      );
      return handleApiSuccess(response?.data, "Payment verified successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "payment-verification");
    }
  }
}

const checkoutService = new CheckoutService();
export default checkoutService;
