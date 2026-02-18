import { API_CONFIG } from "@/config";
import { authAxios } from "@/service/config/axiosConfig";
import { handleApiErrorResponse, handleApiSuccess } from "@/utils/errorHandler";
import { attachQueryParams } from "@/utils/queryParams";

class BillService {
  constructor() {
    this.baseURL = API_CONFIG.BASE.URL;
  }
  // Create a new bill
  async createBill(billData) {
    try {
      const apiPayload = billData;
      // Remove undefined values to keep payload clean
      Object.keys(apiPayload).forEach((key) => {
        if (apiPayload[key] === undefined) {
          delete apiPayload[key];
        }
      });

      const response = await authAxios.post(
        API_CONFIG?.RETAILER?.BILL,
        apiPayload
      );
      return handleApiSuccess(response?.data, "Bill created successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "bill-creation");
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

      const response = await authAxios.put(url, billData);
      return handleApiSuccess(response?.data, "Bill updated successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "bill-updation");
    }
  }

  // Get all bills with query parameters
  async getBills(params = {}) {
    try {
      // Build URL with query parameters
      const url = attachQueryParams(API_CONFIG?.RETAILER?.BILL, params);
      const response = await authAxios.get(url);
      return handleApiSuccess(response?.data, "Bills fetched successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "bills-list");
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

      const response = await authAxios.delete(url);
      return handleApiSuccess(response?.data, "Bill deleted successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "bill-deletion");
    }
  }

  // Get bill analytics
  async getBillAnalytics(storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.ANALYTICS}/supplier-accounts/bills`;

      if (storeId) {
        const params = { store: storeId };
        url = attachQueryParams(url, params);
      }

      const response = await authAxios.get(url);
      return handleApiSuccess(
        response?.data,
        "Bill analytics fetched successfully"
      );
    } catch (error) {
      return handleApiErrorResponse(error, "bill-analytics");
    }
  }
}

// Create and export a singleton instance
const billService = new BillService();
export default billService;
