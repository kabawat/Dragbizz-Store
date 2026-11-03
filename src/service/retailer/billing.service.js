import { API_CONFIG } from "@/config";
import { BaseService } from "@/service/base/BaseService";
import { handleSuccess, handleError } from "@dragorbit/core/api";

class BillingService extends BaseService {
  async getInvoices(params = {}) {
    try {
      const response = await this.get(API_CONFIG?.FINANCE?.INVOICES, params);
      return handleSuccess(response);
    } catch (error) {
      return handleError(error);
    }
  }

  async getInvoiceDownloadUrl(invoiceId) {
    try {
      const url = API_CONFIG?.FINANCE?.INVOICE_DOWNLOAD?.replace(
        ":invoiceId",
        invoiceId
      );
      const response = await this.get(url);
      return handleSuccess(response);
    } catch (error) {
      return handleError(error);
    }
  }
}

export const billingService = new BillingService();
export default billingService;

