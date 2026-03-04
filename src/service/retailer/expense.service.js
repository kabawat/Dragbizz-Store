import { API_CONFIG } from "@/config";
import { BaseService } from "@/service/base/BaseService";

class ExpenseService extends BaseService {
  constructor() {
    super();
    this.endpoint = API_CONFIG?.RETAILER?.EXPENSE;
  }

  // Create a new expense
  createExpense(expenseData) {
    return this.post(this.endpoint, expenseData);
  }

  // Update an existing expense
  updateExpense(expenseId, expenseData, storeId = null) {
    const url = this.buildResourceUrl(this.endpoint, expenseId, storeId);
    return this.put(url, expenseData);
  }

  // Get expenses — list or single by ID (pass { id, store, ... } as params)
  getExpenses(params = {}) {
    return this.get(this.endpoint, params);
  }

  // Delete an expense by ID
  deleteExpense(expenseId, storeId = null) {
    const url = this.buildResourceUrl(this.endpoint, expenseId, storeId);
    return this.delete(url);
  }

  // Search expenses by title, bill number, or vendor
  searchExpenses(searchTerm, storeId = null) {
    const url = `${this.endpoint}/search`;
    return this.get(url, { q: searchTerm, ...(storeId && { store: storeId }) });
  }

  // Get expense statistics
  getExpenseStats(storeId = null) {
    const url = `${this.endpoint}/stats`;
    return this.get(url, storeId ? { store: storeId } : {});
  }

  // Get expense analytics
  getExpenseAnalytics(storeId = null, period = "30") {
    const url = `${API_CONFIG?.RETAILER?.ANALYTICS}/expenses`;
    return this.get(url, {
      ...(storeId && { store: storeId }),
      ...(period && { period }),
    });
  }
}

// Create and export a singleton instance
export const expenseService = new ExpenseService();
export default expenseService;
