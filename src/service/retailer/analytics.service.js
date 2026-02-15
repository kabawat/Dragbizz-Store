import { API_CONFIG } from "@/config";
import { authAxios } from "@/service/config/axiosConfig";
import { handleApiErrorResponse, handleApiSuccess } from "@/utils/errorHandler";
import { attachQueryParams } from "@/utils/queryParams";

class AnalyticsService {
  constructor() {
    this.baseURL = API_CONFIG.BASE.URL;
  }

  // Get Customer Analytics (Summary)
  async getCustomerAnalytics(params = {}) {
    try {
      const url = attachQueryParams(
        `${API_CONFIG.RETAILER.ANALYTICS}/customers`,
        params
      );
      const response = await authAxios.get(url);
      return handleApiSuccess(
        response.data,
        "Customer analytics fetched successfully"
      );
    } catch (error) {
      return handleApiErrorResponse(error, "customer-analytics-fetch");
    }
  }

  // Get Customer Analytics (Detailed)
  async getCustomerDetailedAnalytics(params = {}) {
    try {
      const url = attachQueryParams(
        `${API_CONFIG.RETAILER.ANALYTICS}/customers/detailed`,
        params
      );
      const response = await authAxios.get(url);
      return handleApiSuccess(
        response.data,
        "Detailed customer analytics fetched successfully"
      );
    } catch (error) {
      return handleApiErrorResponse(error, "customer-detailed-analytics-fetch");
    }
  }

  // Get Product Analytics (Summary)
  async getProductAnalytics(params = {}) {
    try {
      const url = attachQueryParams(
        `${API_CONFIG.RETAILER.ANALYTICS}/products`,
        params
      );
      const response = await authAxios.get(url);
      return handleApiSuccess(
        response.data,
        "Product analytics fetched successfully"
      );
    } catch (error) {
      return handleApiErrorResponse(error, "product-analytics-fetch");
    }
  }

  // Get Product Analytics (Detailed)
  async getProductDetailedAnalytics(params = {}) {
    try {
      const url = attachQueryParams(
        `${API_CONFIG.RETAILER.ANALYTICS}/products/detailed`,
        params
      );
      const response = await authAxios.get(url);
      return handleApiSuccess(
        response.data,
        "Detailed product analytics fetched successfully"
      );
    } catch (error) {
      return handleApiErrorResponse(error, "product-detailed-analytics-fetch");
    }
  }

  // Get Supplier Analytics (Summary)
  async getSupplierAnalytics(params = {}) {
    try {
      const url = attachQueryParams(
        `${API_CONFIG.RETAILER.ANALYTICS}/suppliers`,
        params
      );
      const response = await authAxios.get(url);
      return handleApiSuccess(
        response.data,
        "Supplier analytics fetched successfully"
      );
    } catch (error) {
      return handleApiErrorResponse(error, "supplier-analytics-fetch");
    }
  }

  // Get Supplier Analytics (Detailed)
  async getSupplierDetailedAnalytics(params = {}) {
    try {
      const url = attachQueryParams(
        `${API_CONFIG.RETAILER.ANALYTICS}/suppliers/detailed`,
        params
      );
      const response = await authAxios.get(url);
      return handleApiSuccess(
        response.data,
        "Detailed supplier analytics fetched successfully"
      );
    } catch (error) {
      return handleApiErrorResponse(error, "supplier-detailed-analytics-fetch");
    }
  }

  // Get Invoice Analytics (Summary)
  async getInvoiceAnalytics(params = {}) {
    try {
      const url = attachQueryParams(
        `${API_CONFIG.RETAILER.ANALYTICS}/invoices`,
        params
      );
      const response = await authAxios.get(url);
      return handleApiSuccess(
        response.data,
        "Invoice analytics fetched successfully"
      );
    } catch (error) {
      return handleApiErrorResponse(error, "invoice-analytics-fetch");
    }
  }

  // Get Invoice Analytics (Detailed)
  async getInvoiceDetailedAnalytics(params = {}) {
    try {
      const url = attachQueryParams(
        `${API_CONFIG.RETAILER.ANALYTICS}/invoices/detailed`,
        params
      );
      const response = await authAxios.get(url);
      return handleApiSuccess(
        response.data,
        "Detailed invoice analytics fetched successfully"
      );
    } catch (error) {
      return handleApiErrorResponse(error, "invoice-detailed-analytics-fetch");
    }
  }

  // Get Stock Analytics
  async getStockAnalytics(params = {}) {
    try {
      const url = attachQueryParams(
        `${API_CONFIG.RETAILER.ANALYTICS}/stock`,
        params
      );
      const response = await authAxios.get(url);
      return handleApiSuccess(
        response.data,
        "Stock analytics fetched successfully"
      );
    } catch (error) {
      return handleApiErrorResponse(error, "stock-analytics-fetch");
    }
  }

  // Get Revenue Analytics
  async getRevenueAnalytics(params = {}) {
    try {
      const url = attachQueryParams(
        `${API_CONFIG.RETAILER.ANALYTICS}/revenue`,
        params
      );
      const response = await authAxios.get(url);
      return handleApiSuccess(
        response.data,
        "Revenue analytics fetched successfully"
      );
    } catch (error) {
      return handleApiErrorResponse(error, "revenue-analytics-fetch");
    }
  }

  // Get Bill Analytics
  async getBillAnalytics(params = {}) {
    
    try {
      const url = attachQueryParams(
        `${API_CONFIG.RETAILER.ANALYTICS}/bills`,
        params
      );
      const response = await authAxios.get(url);
      return handleApiSuccess(
        response.data,
        "Bill analytics fetched successfully"
      );
    } catch (error) {
      return handleApiErrorResponse(error, "bill-analytics-fetch");
    }
  }

  // Get Expense Analytics
  async getExpenseAnalytics(params = {}) {
    try {
      const url = attachQueryParams(
        `${API_CONFIG.RETAILER.ANALYTICS}/expenses`,
        params
      );
      const response = await authAxios.get(url);
      return handleApiSuccess(
        response.data,
        "Expense analytics fetched successfully"
      );
    } catch (error) {
      return handleApiErrorResponse(error, "expense-analytics-fetch");
    }
  }

  // Get Supplier Account Analytics
  async getSupplierAccountAnalytics(params = {}) {
    try {
      const url = attachQueryParams(
        `${API_CONFIG.RETAILER.ANALYTICS}/supplier-accounts`,
        params
      );
      const response = await authAxios.get(url);
      return handleApiSuccess(
        response.data,
        "Supplier account analytics fetched successfully"
      );
    } catch (error) {
      return handleApiErrorResponse(error, "supplier-account-analytics-fetch");
    }
  }

  // Get Supplier Account Metrics
  async getSupplierAccountMetrics(params = {}) {
    try {
      const url = attachQueryParams(
        `${API_CONFIG.RETAILER.ANALYTICS}/supplier-accounts/metrics`,
        params
      );
      const response = await authAxios.get(url);
      return handleApiSuccess(
        response.data,
        "Supplier account metrics fetched successfully"
      );
    } catch (error) {
      return handleApiErrorResponse(error, "supplier-account-metrics-fetch");
    }
  }

  // Get Supplier Account Dashboard
  async getSupplierAccountDashboard(params = {}) {
    try {
      const url = attachQueryParams(
        `${API_CONFIG.RETAILER.ANALYTICS}/supplier-accounts/dashboard`,
        params
      );
      const response = await authAxios.get(url);
      return handleApiSuccess(
        response.data,
        "Supplier account dashboard fetched successfully"
      );
    } catch (error) {
      return handleApiErrorResponse(error, "supplier-account-dashboard-fetch");
    }
  }

  // Get Supplier Bill Analytics
  async getSupplierBillAnalytics(params = {}) {
    try {
      const url = attachQueryParams(
        `${API_CONFIG.RETAILER.ANALYTICS}/supplier-accounts/bills`,
        params
      );
      const response = await authAxios.get(url);
      return handleApiSuccess(
        response.data,
        "Supplier bill analytics fetched successfully"
      );
    } catch (error) {
      return handleApiErrorResponse(error, "supplier-bill-analytics-fetch");
    }
  }

  // Get Supplier Payment Analytics
  async getSupplierPaymentAnalytics(params = {}) {
    try {
      const url = attachQueryParams(
        `${API_CONFIG.RETAILER.ANALYTICS}/supplier-accounts/payments`,
        params
      );
      const response = await authAxios.get(url);
      return handleApiSuccess(
        response.data,
        "Supplier payment analytics fetched successfully"
      );
    } catch (error) {
      return handleApiErrorResponse(error, "supplier-payment-analytics-fetch");
    }
  }
}

// Create and export a singleton instance
const analyticsService = new AnalyticsService();
export default analyticsService;
