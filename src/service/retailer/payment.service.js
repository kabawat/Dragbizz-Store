import { API_CONFIG } from "@/config";
import { handleApiSuccess, handleApiErrorResponse } from "@/utils/errorHandler";
import { authAxios } from "@/service/config/axiosConfig";
import { attachQueryParams } from "@/utils/queryParams";

class PaymentService {
  constructor() {
    this.baseURL = API_CONFIG.BASE.URL;
  }

  // Transform payment data to match API structure
  transformPaymentData(formData) {
    const paymentMethods = [];

    // Process each payment method
    formData.paymentMethods.forEach((method) => {
      const paymentMethod = {
        amount: parseFloat(method.amount) || 0,
        method: this.mapPaymentMethod(method.method),
        reference: method.reference || "",
      };

      // Add method-specific details
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

    // Build the API payload
    const apiPayload = {
      supplier: formData.supplierId,
      paymentType: formData.paymentType || "BILL_PAYMENT",
      payment: paymentMethods,
      notes: formData.notes || "",
      store: formData.store || "",
    };

    // Add bill ID only for BILL_PAYMENT type
    if (formData.paymentType === "BILL_PAYMENT" && formData.billId) {
      apiPayload.bill = formData.billId;
    }

    // Add purchaseOrder ID if provided (optional for all payment types)
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
  async createPayment(paymentData) {
    try {
      // Transform the data to match the API documentation structure
      const apiPayload = this.transformPaymentData(paymentData);

      const response = await authAxios.post(
        API_CONFIG?.RETAILER?.PAYMENT,
        apiPayload,
      );
      return handleApiSuccess(response?.data, "Payment created successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "payment-creation");
    }
  }

  // Update an existing payment
  async updatePayment(paymentId, paymentData, storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.PAYMENT}/${paymentId}`;

      // Add storeId as query parameter if provided
      if (storeId) {
        const params = { store: storeId };
        url = attachQueryParams(url, params);
      }

      const response = await authAxios.put(url, paymentData);
      return handleApiSuccess(response?.data, "Payment updated successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "payment-updation");
    }
  }

  // Get all payments with query parameters
  async getPayments(params = {}) {
    try {
      // Build URL with query parameters
      const url = attachQueryParams(API_CONFIG?.RETAILER?.PAYMENT, params);
      const response = await authAxios.get(url);
      return handleApiSuccess(response?.data, "Payments fetched successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "payments-list");
    }
  }

  // Delete a payment by ID
  async deletePayment(paymentId, storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.PAYMENT}/${paymentId}`;

      // Add storeId as query parameter if provided
      if (storeId) {
        const params = { store: storeId };
        url = attachQueryParams(url, params);
      }

      const response = await authAxios.delete(url);
      return handleApiSuccess(response?.data, "Payment deleted successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "payment-deletion");
    }
  }
}

// Create and export a singleton instance
const paymentService = new PaymentService();
export default paymentService;
