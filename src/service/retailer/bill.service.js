import { API_CONFIG } from '@/config';
import { handleApiSuccess, handleApiErrorResponse } from '@/utils/errorHandler';
import { retailerAxios } from '@/service/config/axiosConfig';
import { attachQueryParams } from '@/utils/queryParams';

class BillService {
  constructor() {
    this.baseURL = API_CONFIG.BASE.URL;
  }

  // Create a new bill
  async createBill(billData) {
    try {
      const response = await retailerAxios.post(API_CONFIG?.RETAILER?.BILL, billData);
      return handleApiSuccess(response?.data, 'Bill created successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'bill-creation');
    }
  }

  // Update an existing bill
  async updateBill(billId, billData, storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.BILL}/${billId}`;

      // Add storeId as query parameter if provided
      if (storeId) {
        const params = { store: storeId };
        url = attachQueryParams(url, params);
      }

      const response = await retailerAxios.put(url, billData);
      return handleApiSuccess(response?.data, 'Bill updated successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'bill-updation');
    }
  }

  // Get all bills with query parameters
  async getBills(params = {}) {
    try {
      // Build URL with query parameters
      const url = attachQueryParams(API_CONFIG?.RETAILER?.BILL, params);
      const response = await retailerAxios.get(url);
      return handleApiSuccess(response?.data, 'Bills fetched successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'bills-list');
    }
  }


  // Delete a bill by ID
  async deleteBill(billId, storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.BILL}/${billId}`;

      // Add storeId as query parameter if provided
      if (storeId) {
        const params = { store: storeId };
        url = attachQueryParams(url, params);
      }

      const response = await retailerAxios.delete(url);
      return handleApiSuccess(response?.data, 'Bill deleted successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'bill-deletion');
    }
  }

  // Get pending bills
  async getPendingBills(params = {}) {
    try {
      const url = attachQueryParams(`${API_CONFIG?.RETAILER?.BILL}/pending`, params);
      const response = await retailerAxios.get(url);
      return handleApiSuccess(response?.data, 'Pending bills fetched successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'pending-bills');
    }
  }

  // Get overdue bills
  async getOverdueBills(params = {}) {
    try {
      const url = attachQueryParams(`${API_CONFIG?.RETAILER?.BILL}/overdue`, params);
      const response = await retailerAxios.get(url);
      return handleApiSuccess(response?.data, 'Overdue bills fetched successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'overdue-bills');
    }
  }

  // Get bill statistics
  async getBillStats(storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.BILL}/stats`;

      if (storeId) {
        const params = { store: storeId };
        url = attachQueryParams(url, params);
      }

      const response = await retailerAxios.get(url);
      return handleApiSuccess(response?.data, 'Bill statistics fetched successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'bill-stats');
    }
  }
}

// Create and export a singleton instance
const billService = new BillService();
export default billService;
