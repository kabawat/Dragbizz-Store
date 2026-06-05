import { API_CONFIG } from "@/config";
import { BaseService } from "@/service/base/BaseService";

class PaymentService extends BaseService {
  constructor() {
    super();
    this.endpoint = API_CONFIG.RETAILER.PAYMENT;
  }

  // Transform payment data to match API structure
  transformPaymentData(formData) {
    const paymentMethods = [];

    formData.paymentMethods.forEach((method) => {
      const paymentMethod = {
        amount: parseFloat(method.amount) || 0,
        method: this.mapPaymentMethod(method.method),
        reference: method.reference || "",
      };

      switch (method.method) {
        case "bank_transfer":
          paymentMethod.bankDetails = {
            bankName: method.bankName || "",
            ifscCode: method.ifscCode || "",
            accountNumber: method.accountNumber || "",
            holderName: method.holderName || "",
          };
          break;
        case "upi":
          paymentMethod.upiDetails = {
            upiId: method.upiId || "",
            transactionId: method.transactionId || "",
          };
          break;
        case "cheque":
          paymentMethod.chequeDetails = {
            chequeNumber: method.chequeNumber || "",
            chequeDate: method.chequeDate || "",
            bankName: method.chequeBankName || "",
            branchName: method.chequeBranchName || "",
          };
          break;
        case "cash":
        case "credit":
          break;
      }

      paymentMethods.push(paymentMethod);
    });

    const apiPayload = {
      supplier: formData.supplierId,
      paymentType: formData.paymentType || "BILL_PAYMENT",
      payment: paymentMethods,
      notes: formData.notes || "",
      store: formData.store || "",
    };

    if (formData.paymentType === "BILL_PAYMENT" && formData.billId) {
      apiPayload.bill = formData.billId;
    }

    if (formData.purchaseOrder) {
      apiPayload.purchaseOrder = formData.purchaseOrder;
    }

    return apiPayload;
  }

  // Map frontend payment method to API payment method
  mapPaymentMethod(frontendMethod) {
    const methodMap = {
      cash: "CASH",
      upi: "UPI",
      bank_transfer: "BANK_TRANSFER",
      cheque: "CHEQUE",
      credit: "CREDIT",
    };
    return methodMap[frontendMethod] || "CASH";
  }

  // Create a new payment
  createPayment(paymentData) {
    const apiPayload = this.transformPaymentData(paymentData);
    return this.post(this.endpoint, apiPayload);
  }

  // Update an existing payment
  updatePayment(paymentId, paymentData, storeId = null) {
    const url = this.buildResourceUrl(this.endpoint, paymentId, storeId);
    return this.put(url, paymentData);
  }

  // Get all payments with query parameters
  getPayments(params = {}) {
    return this.get(this.endpoint, params);
  }

  // Delete a payment by ID
  deletePayment(paymentId, storeId = null) {
    const url = this.buildResourceUrl(this.endpoint, paymentId, storeId);
    return this.delete(url);
  }
}

export const paymentService = new PaymentService();
export default paymentService;
