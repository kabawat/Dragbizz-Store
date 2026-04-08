import { API_CONFIG } from "@/config";
import { BaseService } from "@/service/base/BaseService";

class InvoiceService extends BaseService {
  constructor() {
    super();
    this.endpoint = API_CONFIG?.RETAILER?.INVOICE;
  }

  // Create Draft Invoice
  createDraftInvoice(invoiceData) {
    return this.post(this.endpoint, invoiceData);
  }

  // Get Invoices (List/Single)
  getInvoices(params = {}) {
    return this.get(this.endpoint, params);
  }

  // Update Draft Invoice (Only for DRAFT invoices)
  updateDraftInvoice(invoiceId, updateData) {
    // Remove paymentStatus from updateData as it's now UNPAID by default for drafts
    const { paymentStatus, ...dataToUpdate } = updateData;
    const url = `${this.endpoint}/${invoiceId}`;
    return this.put(url, dataToUpdate);
  }

  // Update Payment Status (Only for RELEASED invoices)
  updatePaymentStatus(
    invoiceId,
    paymentStatus,
    paymentMode = null,
    storeId = null,
    paidAmount = null
  ) {
    let url = `${this.endpoint}/${invoiceId}/payment-status`;
    const payload = { paymentStatus };

    if (paymentMode) {
      payload.paymentMode = paymentMode;
    }
    if (paidAmount !== null && paidAmount !== undefined) {
      payload.paidAmount = paidAmount;
    }

    const params = storeId ? { store: storeId } : {};
    return this.patch(url, payload, params);
  }

  // Release Invoice
  releaseInvoice(
    invoiceId,
    paymentStatus = "PAID",
    storeId = null,
    paidAmount = null,
    paymentMode = null
  ) {
    const payload = {
      id: invoiceId,
      paymentStatus,
    };

    if (paymentMode) {
      payload.paymentMode = paymentMode;
    }

    if (paidAmount !== null && paidAmount !== undefined) {
      payload.paidAmount = paidAmount;
    }

    if (storeId) {
      payload.store = storeId;
    }

    return this.post(`${this.endpoint}/release`, payload);
  }

  // Cancel Invoice
  cancelInvoice(invoiceId, reason = "") {
    return this.post(`${this.endpoint}/cancel`, {
      id: invoiceId,
      reason,
    });
  }

  // Delete Invoice
  deleteInvoice(invoiceId, storeId = null) {
    const url = this.buildResourceUrl(this.endpoint, invoiceId, storeId);
    return this.delete(url);
  }

}

// Create and export a singleton instance
export const invoiceService = new InvoiceService();
export default invoiceService;
