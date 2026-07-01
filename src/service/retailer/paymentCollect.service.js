import { API_CONFIG } from "@/config";
import { BaseService } from "@/service/base/BaseService";

class PaymentCollectService extends BaseService {
  constructor() {
    super();
    this.collectEndpoint = API_CONFIG.RETAILER.CUSTOMER_ACCOUNT_COLLECT_LINK;
    this.invoiceEndpoint = API_CONFIG.RETAILER.INVOICE;
  }

  createCollectLink(storeId, payload) {
    return this.post(
      this.collectEndpoint,
      { ...payload, store: storeId },
      { store: storeId },
    );
  }

  createInvoicePaymentLink(storeId, invoiceId, gatewayType = "RAZORPAY") {
    return this.post(
      `${this.invoiceEndpoint}/${invoiceId}/payment-link`,
      { gatewayType, store: storeId },
      { store: storeId },
    );
  }
}

export const paymentCollectService = new PaymentCollectService();
export default paymentCollectService;
