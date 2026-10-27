import { API_CONFIG } from "@/config";
import { BaseService } from "@/service/base/BaseService";

class SettingService extends BaseService {
  constructor() {
    super();
    this.endpoint = API_CONFIG?.RETAILER?.SETTING || "/retailer/setting";
  }

  // Cashbook Settings
  getCashbookSetting(store) {
    return this.get(`${this.endpoint}/cashbook`, { store });
  }

  updateCashbookSetting(store, settings) {
    return this.put(`${this.endpoint}/cashbook`, settings, { store });
  }

  // Notification Settings
  getNotificationSetting(store) {
    return this.get(`${this.endpoint}/notification`, { store });
  }

  updateNotificationSetting(store, settings) {
    return this.put(`${this.endpoint}/notification`, settings, { store });
  }

  // Payment Settings
  getPaymentSetting(store) {
    return this.get(`${this.endpoint}/payment`, { store });
  }

  updatePaymentSetting(store, settings) {
    return this.put(`${this.endpoint}/payment`, settings, { store });
  }

  // Invoice Settings
  getInvoiceSetting(store) {
    return this.get(`${this.endpoint}/invoice`, { store });
  }

  updateInvoiceSetting(store, settings) {
    return this.put(`${this.endpoint}/invoice`, settings, { store });
  }

  // Tally Integration Settings
  getTallySetting(store) {
    return this.get(`${this.endpoint}/tally`, { store });
  }

  updateTallySetting(store, settings) {
    return this.put(`${this.endpoint}/tally`, settings, { store });
  }
}

export const settingService = new SettingService();
export default settingService;

