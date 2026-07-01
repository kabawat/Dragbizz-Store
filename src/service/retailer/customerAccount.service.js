import { API_CONFIG } from "@/config";
import { BaseService } from "@/service/base/BaseService";

class CustomerAccountService extends BaseService {
  constructor() {
    super();
    this.accountEndpoint = API_CONFIG.RETAILER.CUSTOMER_ACCOUNT;
    this.paymentsEndpoint = API_CONFIG.RETAILER.CUSTOMER_ACCOUNT_PAYMENTS;
    this.transactionsEndpoint = API_CONFIG.RETAILER.CUSTOMER_ACCOUNT_TRANSACTIONS;
  }

  getAccounts(params = {}) {
    return this.get(this.accountEndpoint, params);
  }

  createAccount(accountData) {
    return this.post(this.accountEndpoint, accountData);
  }

  getTransactions(params = {}) {
    return this.get(this.transactionsEndpoint, params);
  }

  createTransaction(transactionData) {
    return this.post(this.transactionsEndpoint, transactionData);
  }

  getPayments(params = {}) {
    return this.get(this.paymentsEndpoint, params);
  }

  createPayment(paymentData) {
    return this.post(this.paymentsEndpoint, paymentData);
  }

  updatePayment(paymentId, paymentData, storeId = null) {
    const url = this.buildResourceUrl(this.paymentsEndpoint, paymentId, storeId);
    return this.put(url, paymentData);
  }

  deletePayment(paymentId, storeId = null) {
    const url = this.buildResourceUrl(this.paymentsEndpoint, paymentId, storeId);
    return this.delete(url);
  }
}

export const customerAccountService = new CustomerAccountService();
export default customerAccountService;
