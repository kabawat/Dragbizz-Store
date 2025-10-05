import API_CONFIG from '@/config/api.config';
import { handleApiSuccess, handleApiErrorResponse } from '@/utils/errorHandler';
import { retailerAxios } from '@/service/config/axiosConfig';
import { attachQueryParams } from '@/utils/queryParams';

class BillService {

  // Create a new bill
  async createBill(billData) {
    try {
      let apiPayload = billData;
      // Remove undefined values to keep payload clean
      Object.keys(apiPayload).forEach(key => {
        if (apiPayload[key] === undefined) {
          delete apiPayload[key];
        }
      });

      const response = await retailerAxios.post(API_CONFIG?.RETAILER?.BILL, apiPayload);
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
      console.log('BillService.getBills called with params:', params);
      console.log('API_CONFIG.RETAILER.BILL:', API_CONFIG?.RETAILER?.BILL);
      
      // Build URL with query parameters
      const url = attachQueryParams(API_CONFIG?.RETAILER?.BILL, params);
      console.log('Final URL:', url);
      
      const response = await retailerAxios.get(url);
      console.log('BillService.getBills response:', response);
      
      return handleApiSuccess(response?.data, 'Bills fetched successfully');
    } catch (error) {
      console.error('BillService.getBills error:', error);
      return handleApiErrorResponse(error, 'bills-list');
    }
  }

  // Delete a bill by ID
  async deleteBill(billId, storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.BILL}/${billId}`;

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

  // Get bill analytics
  async getBillAnalytics(storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.BILL}/analytics`;

      if (storeId) {
        const params = { store: storeId };
        url = attachQueryParams(url, params);
      }

      const response = await retailerAxios.get(url);
      return handleApiSuccess(response?.data, 'Bill analytics fetched successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'bill-analytics');
    }
  }
}

// Create and export a singleton instance
const billService = new BillService();
export default billService;
