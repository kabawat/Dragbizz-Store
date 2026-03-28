import { API_CONFIG } from "@/config";
import { BaseService } from "@/service/base/BaseService";

class ExpenseService extends BaseService {
  constructor() {
    super();
    this.endpoint = API_CONFIG?.RETAILER?.EXPENSE;
  }

  createExpense(expenseData) {
    return this.post(this.endpoint, expenseData);
  }

  updateExpense(expenseId, expenseData, storeId = null) {
    const url = this.buildResourceUrl(this.endpoint, expenseId, storeId);
    return this.put(url, expenseData);
  }

  // Get expenses — list or single by ID (pass { id, store, ... } as params)
  getExpenses(params = {}) {
    return this.get(this.endpoint, params);
  }

  deleteExpense(expenseId, storeId = null) {
    const url = this.buildResourceUrl(this.endpoint, expenseId, storeId);
    return this.delete(url);
  }

  getExpenseStats(storeId = null) {
    return this.get(`${this.endpoint}/stats`, storeId ? { store: storeId } : {});
  }
}

export const expenseService = new ExpenseService();
export default expenseService;
