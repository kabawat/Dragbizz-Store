import { API_CONFIG } from "@/config";
import { authAxios } from "@/service/config/axiosConfig";
import { handleApiErrorResponse, handleApiSuccess } from "@/utils/errorHandler";
import { attachQueryParams } from "@/utils/queryParams";

class AccountService {
  constructor() {
    this.baseURL = API_CONFIG.BASE.URL;
  }

  // Create a new supplier account
  async createAccount(accountData) {
    try {
      const response = await authAxios.post(
        API_CONFIG?.RETAILER?.ACCOUNT,
        accountData
      );
      return handleApiSuccess(response?.data, "Account created successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "account-creation");
    }
  }

  // Update an existing account
  async updateAccount(accountId, accountData, storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.ACCOUNT}/${accountId}`;

      // Add storeId as query parameter if provided
      if (storeId) {
        const params = { store: storeId };
        url = attachQueryParams(url, params);
      }

      const response = await authAxios.put(url, accountData);
      return handleApiSuccess(response?.data, "Account updated successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "account-updation");
    }
  }

  // Get all accounts with query parameters
  async getAccounts(params = {}) {
    try {
      // Build URL with query parameters
      const url = attachQueryParams(API_CONFIG?.RETAILER?.ACCOUNT, params);
      const response = await authAxios.get(url);
      return handleApiSuccess(response?.data, "Accounts fetched successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "accounts-list");
    }
  }

  // Get a specific account by ID
  async getAccount(accountId, storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.ACCOUNT}/${accountId}`;

      // Add storeId as query parameter if provided
      if (storeId) {
        const params = { store: storeId };
        url = attachQueryParams(url, params);
      }

      const response = await authAxios.get(url);
      return handleApiSuccess(response?.data, "Account fetched successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "account-details");
    }
  }

  // Delete an account by ID
  async deleteAccount(accountId, storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.ACCOUNT}/${accountId}`;

      // Add storeId as query parameter if provided
      if (storeId) {
        const params = { store: storeId };
        url = attachQueryParams(url, params);
      }

      const response = await authAxios.delete(url);
      return handleApiSuccess(response?.data, "Account deleted successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "account-deletion");
    }
  }

  // Get account overview/dashboard data
  async getAccountOverview(storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.ACCOUNT}/overview`;

      if (storeId) {
        const params = { store: storeId };
        url = attachQueryParams(url, params);
      }

      const response = await authAxios.get(url);
      return handleApiSuccess(
        response?.data,
        "Account overview fetched successfully"
      );
    } catch (error) {
      return handleApiErrorResponse(error, "account-overview");
    }
  }

  // Get account statistics
  async getAccountStats(storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.ACCOUNT}/stats`;

      if (storeId) {
        const params = { store: storeId };
        url = attachQueryParams(url, params);
      }

      const response = await authAxios.get(url);
      return handleApiSuccess(
        response?.data,
        "Account statistics fetched successfully"
      );
    } catch (error) {
      return handleApiErrorResponse(error, "account-stats");
    }
  }

  // Get account reports
  async getAccountReports(params = {}) {
    try {
      const url = attachQueryParams(
        `${API_CONFIG?.RETAILER?.ACCOUNT}/reports`,
        params
      );
      const response = await authAxios.get(url);
      return handleApiSuccess(
        response?.data,
        "Account reports fetched successfully"
      );
    } catch (error) {
      return handleApiErrorResponse(error, "account-reports");
    }
  }

  // Suspend an account
  async suspendAccount(accountId, suspensionData, storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.ACCOUNT}/${accountId}/suspend`;

      if (storeId) {
        const params = { store: storeId };
        url = attachQueryParams(url, params);
      }

      const response = await authAxios.put(url, suspensionData);
      return handleApiSuccess(response?.data, "Account suspended successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "account-suspension");
    }
  }

  // Activate an account
  async activateAccount(accountId, activationData, storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.ACCOUNT}/${accountId}/activate`;

      if (storeId) {
        const params = { store: storeId };
        url = attachQueryParams(url, params);
      }

      const response = await authAxios.put(url, activationData);
      return handleApiSuccess(response?.data, "Account activated successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "account-activation");
    }
  }

  // Update credit limit
  async updateCreditLimit(accountId, creditLimitData, storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.ACCOUNT}/${accountId}/credit-limit`;

      if (storeId) {
        const params = { store: storeId };
        url = attachQueryParams(url, params);
      }

      const response = await authAxios.put(url, creditLimitData);
      return handleApiSuccess(
        response?.data,
        "Credit limit updated successfully"
      );
    } catch (error) {
      return handleApiErrorResponse(error, "credit-limit-update");
    }
  }

  // Get account activity/history
  async getAccountActivity(accountId, params = {}, storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.ACCOUNT}/${accountId}/activity`;

      if (storeId) {
        params.store = storeId;
      }

      url = attachQueryParams(url, params);
      const response = await authAxios.get(url);
      return handleApiSuccess(
        response?.data,
        "Account activity fetched successfully"
      );
    } catch (error) {
      return handleApiErrorResponse(error, "account-activity");
    }
  }

  // Search accounts
  async searchAccounts(searchTerm, storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.ACCOUNT}/search`;

      const params = { q: searchTerm };
      if (storeId) {
        params.store = storeId;
      }

      url = attachQueryParams(url, params);
      const response = await authAxios.get(url);
      return handleApiSuccess(response?.data, "Accounts searched successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "account-search");
    }
  }
}

// Create and export a singleton instance
const accountService = new AccountService();
export default accountService;
