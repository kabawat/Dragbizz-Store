import { API_CONFIG } from "@/config";
import { BaseService } from "@/service/base/BaseService";

class AnalyticsService extends BaseService {
  constructor() {
    super();
    this.endpoint = API_CONFIG?.RETAILER?.ANALYTICS;
  }

  getCustomerAnalytics(params = {}) {
    return this.get(`${this.endpoint}/customers`, params);
  }

  getProductAnalytics(params = {}) {
    return this.get(`${this.endpoint}/products`, params);
  }

  getSupplierAnalytics(params = {}) {
    return this.get(`${this.endpoint}/suppliers`, params);
  }

  getInvoiceAnalytics(params = {}) {
    return this.get(`${this.endpoint}/invoices`, params);
  }

  getStockAnalytics(params = {}) {
    return this.get(`${this.endpoint}/stock`, params);
  }

  getRevenueAnalytics(params = {}) {
    return this.get(`${this.endpoint}/revenue`, params);
  }

  getBillAnalytics(params = {}) {
    return this.get(`${this.endpoint}/bills`, params);
  }

  getExpenseAnalytics(params = {}) {
    return this.get(`${this.endpoint}/expenses`, params);
  }
}

const analyticsService = new AnalyticsService();
export default analyticsService;
