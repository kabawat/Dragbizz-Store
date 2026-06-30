import { API_CONFIG } from "@/config";
import { BaseService } from "@/service/base/BaseService";

class PaymentOrderService extends BaseService {
  constructor() {
    super();
    this.endpoint = API_CONFIG?.RETAILER?.PAYMENTS;
  }

  createCheckout(storeId, invoiceId, gatewayType = "RAZORPAY") {
    return this.post(
      `${this.endpoint}/checkout`,
      { invoiceId, gatewayType, store: storeId },
      { store: storeId },
    );
  }

  getPaymentOrderStatus(storeId, paymentOrderId) {
    return this.get(`${this.endpoint}/orders/${paymentOrderId}`, { store: storeId });
  }

  verifyPayment(storeId, payload) {
    return this.post(`${this.endpoint}/verify`, { ...payload, store: storeId }, { store: storeId });
  }
}

export default new PaymentOrderService();
