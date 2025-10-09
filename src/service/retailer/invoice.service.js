import { API_CONFIG } from '@/config';
import { handleApiSuccess, handleApiErrorResponse } from '@/utils/errorHandler';
import { retailerAxios } from '@/service/config/axiosConfig';
import { attachQueryParams } from '@/utils/queryParams';

class InvoiceService {
  constructor() {
    this.baseURL = API_CONFIG.BASE.URL;
  }

  // Create Draft Invoice
  async createDraftInvoice(invoiceData) {
    try {
      const response = await retailerAxios.post(API_CONFIG.RETAILER.INVOICE, invoiceData);
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
      const response = await retailerAxios.get(url);
      return handleApiSuccess(response.data, 'Invoices fetched successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'invoices-list');
    }
  }

  // Update Draft Invoice
  async updateDraftInvoice(invoiceId, updateData) {
    try {
      const url = `${API_CONFIG.RETAILER.INVOICE}/${invoiceId}`;
      const response = await retailerAxios.put(url, updateData);
      return handleApiSuccess(response.data, 'Draft invoice updated successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'invoice-update');
    }
  }

  // Release Invoice
  async releaseInvoice(invoiceId, paymentStatus = 'PAID', storeId = null) {
    try {
      const payload = {
        id: invoiceId,
        paymentStatus
      };
      
      // Add store ID if provided
      if (storeId) {
        payload.store = storeId;
      }
      
      const response = await retailerAxios.post(`${API_CONFIG.RETAILER.INVOICE}/release`, payload);
      return handleApiSuccess(response.data, 'Invoice released successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'invoice-release');
    }
  }

  // Cancel Invoice
  async cancelInvoice(invoiceId, reason = '') {
    try {
      const response = await retailerAxios.post(`${API_CONFIG.RETAILER.INVOICE}/cancel`, {
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

      const response = await retailerAxios.delete(url);
      return handleApiSuccess(response.data, 'Invoice deleted successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'invoice-deletion');
    }
  }
}

// Create and export a singleton instance
const invoiceService = new InvoiceService();
export default invoiceService;
