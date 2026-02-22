import { API_CONFIG } from "@/config";
import { authAxios } from "@/service/config/axiosConfig";
import { handleApiErrorResponse, handleApiSuccess } from "@/utils/errorHandler";
import { attachQueryParams } from "@/utils/queryParams";

class ExpenseService {
  constructor() {
    this.baseURL = API_CONFIG.BASE.URL;
  }

  // Create a new expense
  async createExpense(expenseData) {
    try {
      const response = await authAxios.post(
        API_CONFIG?.RETAILER?.EXPENSE,
        expenseData
      );
      return handleApiSuccess(response?.data, "Expense created successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "expense-creation");
    }
  }

  // Update an existing expense
  async updateExpense(expenseId, expenseData, storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.EXPENSE}/${expenseId}`;
      if (storeId) {
        const params = { store: storeId };
        url = attachQueryParams(url, params);
      }
      const response = await authAxios.put(url, expenseData);
      return handleApiSuccess(response?.data, "Expense updated successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "expense-updation");
    }
  }

  // Get expenses - supports both list and single item by ID
  async getExpenses(params = {}) {
    try {
      // Build URL with all query parameters including id
      const url = attachQueryParams(API_CONFIG?.RETAILER?.EXPENSE, params);

      // Call the API
      const response = await authAxios.get(url);
      return handleApiSuccess(
        response?.data,
        params.id
          ? "Expense fetched successfully"
          : "Expenses fetched successfully"
      );
    } catch (error) {
      return handleApiErrorResponse(error, "expenses-list");
    }
  }

  // Delete an expense by ID
  async deleteExpense(expenseId, storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.EXPENSE}/${expenseId}`;
      if (storeId) {
        const params = { store: storeId };
        url = attachQueryParams(url, params);
      }
      const response = await authAxios.delete(url);
      return handleApiSuccess(response?.data, "Expense deleted successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "expense-deletion");
    }
  }

  // Search expenses by title, bill number, or vendor
  async searchExpenses(searchTerm, storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.EXPENSE}/search`;
      const params = { q: searchTerm };
      if (storeId) {
        params.store = storeId;
      }
      url = attachQueryParams(url, params);
      const response = await authAxios.get(url);
      return handleApiSuccess(response?.data, "Expenses searched successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "expense-search");
    }
  }

  // Get expense statistics
  async getExpenseStats(storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.EXPENSE}/stats`;
      if (storeId) {
        const params = { store: storeId };
        url = attachQueryParams(url, params);
      }
      const response = await authAxios.get(url);
      return handleApiSuccess(
        response?.data,
        "Expense statistics fetched successfully"
      );
    } catch (error) {
      return handleApiErrorResponse(error, "expense-stats");
    }
  }

  // Get expense analytics
  async getExpenseAnalytics(storeId = null, period = "30") {
    try {
      let url = `${API_CONFIG?.RETAILER?.ANALYTICS}/expenses`;
      const params = {};
      if (storeId) {
        params.store = storeId;
      }
      if (period) {
        params.period = period;
      }
      url = attachQueryParams(url, params);
      const response = await authAxios.get(url);
      return handleApiSuccess(
        response?.data,
        "Expense analytics fetched successfully"
      );
    } catch (error) {
      return handleApiErrorResponse(error, "expense-analytics");
    }
  }
}

// Create and export a singleton instance
const expenseService = new ExpenseService();
export default expenseService;
