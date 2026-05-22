import { API_CONFIG } from "@/config";
import { BaseService } from "@/service/base/BaseService";

class AccountService extends BaseService {
  constructor() {
    super();
    this.endpoint = API_CONFIG?.RETAILER?.ACCOUNT;
  }

  createAccount(accountData) {
    return this.post(this.endpoint, accountData);
  }

  getAccounts(params = {}) {
    return this.get(this.endpoint, params);
  }

  getAccountStats(storeId = null) {
    return this.get(`${this.endpoint}/stats`, storeId ? { store: storeId } : {});
  }
}

export const accountService = new AccountService();
export default accountService;
