import { API_CONFIG } from '@/config';
import { handleApiSuccess, handleApiErrorResponse } from '@/utils/errorHandler';
import { authAxios } from '@/service/config/axiosConfig';
import { attachQueryParams } from '@/utils/queryParams';

class InvoiceService {
  constructor() {
    this.baseURL = API_CONFIG.BASE.URL;
  }

  // Create Draft Invoice
  async createDraftInvoice(invoiceData) {
    try {
      const response = await authAxios.post(API_CONFIG.RETAILER.INVOICE, invoiceData);
      return handleApiSuccess(response.data, 'Draft invoice created successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'invoice-creation');
    }
  }

  // Get Invoices (List/Single)
  async getInvoices(params = {}) {
    try {
      // Build URL with query parameters
      const url = attachQueryParams(API_CONFIG.RETAILER.INVOICE, params);
      const response = await authAxios.get(url);
      return handleApiSuccess(response.data, 'Invoices fetched successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'invoices-list');
    }
  }

  // Update Draft Invoice (Only for DRAFT invoices)
  async updateDraftInvoice(invoiceId, updateData) {
    try {
      const url = `${API_CONFIG.RETAILER.INVOICE}/${invoiceId}`;
      // Remove paymentStatus from updateData as it's now UNPAID by default for drafts
      const { paymentStatus, ...dataToUpdate } = updateData;
      const response = await authAxios.put(url, dataToUpdate);
      return handleApiSuccess(response.data, 'Draft invoice updated successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'invoice-update');
    }
  }

  // Update Payment Status (Only for RELEASED invoices)
  async updatePaymentStatus(invoiceId, paymentStatus, paymentMode = null, storeId = null, paidAmount = null) {
    try {
      let url = `${API_CONFIG.RETAILER.INVOICE}/${invoiceId}/payment-status`;
      const payload = { paymentStatus };
      if (paymentMode) {
        payload.paymentMode = paymentMode;
      }
      if (paidAmount !== null && paidAmount !== undefined) {
        payload.paidAmount = paidAmount;
      }
      // Add store ID to query params if provided (required by middleware)
      if (storeId) {
        url = attachQueryParams(url, { store: storeId });
      }
      const response = await authAxios.patch(url, payload);
      return handleApiSuccess(response.data, 'Payment status updated successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'payment-status-update');
    }
  }

  // Release Invoice
  async releaseInvoice(invoiceId, paymentStatus = 'PAID', storeId = null, paidAmount = null) {
    try {
      const payload = {
        id: invoiceId,
        paymentStatus
      };
      
      // Add paidAmount if provided (for PAY_LATTER or PAID with partial payment)
      if (paidAmount !== null && paidAmount !== undefined) {
        payload.paidAmount = paidAmount;
      }
      
      // Add store ID if provided
      if (storeId) {
        payload.store = storeId;
      }
      
      const response = await authAxios.post(`${API_CONFIG.RETAILER.INVOICE}/release`, payload);
      return handleApiSuccess(response.data, 'Invoice released successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'invoice-release');
    }
  }

  // Cancel Invoice
  async cancelInvoice(invoiceId, reason = '') {
    try {
      const response = await authAxios.post(`${API_CONFIG.RETAILER.INVOICE}/cancel`, {
        id: invoiceId,
        reason
      });
      return handleApiSuccess(response.data, 'Invoice cancelled successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'invoice-cancellation');
    }
  }

  // Delete Invoice
  async deleteInvoice(invoiceId, storeId = null) {
    try {
      let url = `${API_CONFIG.RETAILER.INVOICE}/${invoiceId}`;

      // Add storeId as query parameter if provided
      if (storeId) {
        const params = { store: storeId };
        url = attachQueryParams(url, params);
      }

      const response = await authAxios.delete(url);
      return handleApiSuccess(response.data, 'Invoice deleted successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'invoice-deletion');
    }
  }
}

// Create and export a singleton instance
const invoiceService = new InvoiceService();
export default invoiceService;
