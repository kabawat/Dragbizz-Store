import { API_CONFIG } from '@/config';
import { handleApiSuccess, handleApiErrorResponse } from '@/utils/errorHandler';
import { retailerAxios } from '@/service/config/axiosConfig';
import { attachQueryParams } from '@/utils/queryParams';

class PaymentService {
  constructor() {
    this.baseURL = API_CONFIG.BASE.URL;
  }

  // Create a new payment
  async createPayment(paymentData) {
    try {
      // Transform the data to match the API documentation structure
      const apiPayload = this.transformPaymentData(paymentData);
      
      const response = await retailerAxios.post(API_CONFIG?.RETAILER?.PAYMENT, apiPayload);
      return handleApiSuccess(response?.data, 'Payment created successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'payment-creation');
    }
  }

  // Transform payment data to match API structure
  transformPaymentData(formData) {
    const paymentMethods = [];
    
    // Process each payment method
    formData.paymentMethods.forEach(method => {
      const paymentMethod = {
        amount: parseFloat(method.amount) || 0,
        method: this.mapPaymentMethod(method.method),
        reference: method.reference || ''
      };

      // Add method-specific details
      switch (method.method) {
        case 'bank_transfer':
          paymentMethod.bankDetails = {
            bankName: method.bankName || '',
            ifscCode: method.ifscCode || '',
            accountNumber: method.accountNumber || '',
            holderName: method.holderName || ''
          };
          break;
        
        case 'upi':
          paymentMethod.upiDetails = {
            upiId: method.upiId || '',
            transactionId: method.transactionId || ''
          };
          break;
        
        case 'cheque':
          paymentMethod.chequeDetails = {
            chequeNumber: method.chequeNumber || '',
            chequeDate: method.chequeDate || '',
            bankName: method.chequeBankName || '',
            branchName: method.chequeBranchName || ''
          };
          break;
        
        case 'cash':
        case 'credit':
          break;
      }

      paymentMethods.push(paymentMethod);
    });

    // Build the API payload
    const apiPayload = {
      supplier: formData.supplierId,
      paymentType: formData.paymentType || 'BILL_PAYMENT',
      payment: paymentMethods,
      notes: formData.notes || ''
    };

    // Add bill ID only for BILL_PAYMENT type
    if (formData.paymentType === 'BILL_PAYMENT' && formData.billId) {
      apiPayload.bill = formData.billId;
    }

    return apiPayload;
  }

  // Map frontend payment method to API payment method
  mapPaymentMethod(frontendMethod) {
    const methodMap = {
      'cash': 'CASH',
      'upi': 'UPI',
      'bank_transfer': 'BANK_TRANSFER',
      'cheque': 'CHEQUE',
      'credit': 'CREDIT'
    };
    
    return methodMap[frontendMethod] || 'CASH';
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

      const response = await retailerAxios.put(url, paymentData);
      return handleApiSuccess(response?.data, 'Payment updated successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'payment-updation');
    }
  }

  // Get all payments with query parameters
  async getPayments(params = {}) {
    try {
      // Build URL with query parameters
      const url = attachQueryParams(API_CONFIG?.RETAILER?.PAYMENT, params);
      const response = await retailerAxios.get(url);
      return handleApiSuccess(response?.data, 'Payments fetched successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'payments-list');
    }
  }

  // Get a specific payment by ID
  async getPayment(paymentId, storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.PAYMENT}/${paymentId}`;

      // Add storeId as query parameter if provided
      if (storeId) {
        const params = { store: storeId };
        url = attachQueryParams(url, params);
      }

      const response = await retailerAxios.get(url);
      return handleApiSuccess(response?.data, 'Payment fetched successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'payment-details');
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

      const response = await retailerAxios.delete(url);
      return handleApiSuccess(response?.data, 'Payment deleted successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'payment-deletion');
    }
  }

  // Get pending payments
  async getPendingPayments(params = {}) {
    try {
      const url = attachQueryParams(`${API_CONFIG?.RETAILER?.PAYMENT}/pending`, params);
      const response = await retailerAxios.get(url);
      return handleApiSuccess(response?.data, 'Pending payments fetched successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'pending-payments');
    }
  }

  // Get payment statistics
  async getPaymentStats(storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.PAYMENT}/stats`;

      if (storeId) {
        const params = { store: storeId };
        url = attachQueryParams(url, params);
      }

      const response = await retailerAxios.get(url);
      return handleApiSuccess(response?.data, 'Payment statistics fetched successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'payment-stats');
    }
  }

  // Get payment reports
  async getPaymentReports(params = {}) {
    try {
      const url = attachQueryParams(`${API_CONFIG?.RETAILER?.PAYMENT}/reports`, params);
      const response = await retailerAxios.get(url);
      return handleApiSuccess(response?.data, 'Payment reports fetched successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'payment-reports');
    }
  }

  // Get payment analytics
  async getPaymentAnalytics(params = {}) {
    try {
      const url = attachQueryParams(`${API_CONFIG?.RETAILER?.PAYMENT}/analytics`, params);
      const response = await retailerAxios.get(url);
      return handleApiSuccess(response?.data, 'Payment analytics fetched successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'payment-analytics');
    }
  }

  // Allocate payment to bills
  async allocatePayment(paymentId, allocationData, storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.PAYMENT}/${paymentId}/allocate`;

      if (storeId) {
        const params = { store: storeId };
        url = attachQueryParams(url, params);
      }

      const response = await retailerAxios.post(url, allocationData);
      return handleApiSuccess(response?.data, 'Payment allocated successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'payment-allocation');
    }
  }

  // Approve payment
  async approvePayment(paymentId, approvalData, storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.PAYMENT}/${paymentId}/approve`;

      if (storeId) {
        const params = { store: storeId };
        url = attachQueryParams(url, params);
      }

      const response = await retailerAxios.put(url, approvalData);
      return handleApiSuccess(response?.data, 'Payment approved successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'payment-approval');
    }
  }

  // Reject payment
  async rejectPayment(paymentId, rejectionData, storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.PAYMENT}/${paymentId}/reject`;

      if (storeId) {
        const params = { store: storeId };
        url = attachQueryParams(url, params);
      }

      const response = await retailerAxios.put(url, rejectionData);
      return handleApiSuccess(response?.data, 'Payment rejected successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'payment-rejection');
    }
  }

  // Get bills for payment allocation
  async getBillsForAllocation(supplierId, storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.PAYMENT}/bills-for-allocation`;

      const params = { supplier: supplierId };
      if (storeId) {
        params.store = storeId;
      }

      url = attachQueryParams(url, params);
      const response = await retailerAxios.get(url);
      return handleApiSuccess(response?.data, 'Bills for allocation fetched successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'bills-for-allocation');
    }
  }
}

// Create and export a singleton instance
const paymentService = new PaymentService();
export default paymentService;
