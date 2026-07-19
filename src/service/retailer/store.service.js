"use client";
import { BaseService } from "@/service/base/BaseService";
import { API_CONFIG } from "@/config";

class StoreService extends BaseService {
  constructor() {
    super();
    this.endpoint = API_CONFIG.RETAILER.STORE;
  }

  // Uses Auth service token
  async getRetailerProfile() {
    return this.post(API_CONFIG?.RETAILER?.PROFILE);
  }

  // Create agency using auth service token
  async createAgency(agencyData) {
    const payload = {
      name: agencyData.name,
      subdomain: agencyData.subdomain,
    };
    return this.post(API_CONFIG?.RETAILER?.AGENCY, payload);
  }

  // Create store using auth service token
  async createStore(storeData) {
    return this.post(this.endpoint, storeData);
  }

  // Get store details
  async getStore(storeId) {
    return this.get(this.endpoint, { id: String(storeId) });
  }

  // Update store
  async updateStore(storeId, storeData) {
    return this.put(`${this.endpoint}/${storeId}`, storeData);
  }

  // Get all stores for retailer
  async getStores(params = {}) {
    return this.get(this.endpoint, params);
  }

  // Request OTP for store delete
  async requestDeleteStoreOtp(storeId, channel = "sms") {
    return this.post(`${this.endpoint}/${storeId}/delete/request`, { channel });
  }

  // Verify OTP and delete store
  async verifyDeleteStoreOtp(storeId, signature, otp) {
    return this.post(`${this.endpoint}/${storeId}/delete/verify`, { signature, otp });
  }

  // Generate Catalog ID
  async generateCatalogId(storeId) {
    return this.post(`${this.endpoint}/${storeId}/generate-catalog-id`);
  }

  // Store UPI - Get
  // scope: 'store' (default) = UPIs for this store | 'agency' = all agency UPIs for management
  async getStoreUpi(storeId, options = {}) {
    const params = { store: storeId, ...(options.scope && { scope: options.scope }) };
    return this.get(`${this.endpoint}/upi`, params);
  }

  // Store UPI - Create (one doc per UPI)
  async createStoreUpi(storeId, payload) {
    return this.post(`${this.endpoint}/${storeId}/upi`, payload);
  }

  // Store UPI - Update (by UPI document id)
  async updateStoreUpi(storeId, upiId, payload) {
    return this.put(`${this.endpoint}/${storeId}/upi/${upiId}`, payload);
  }

  // Store UPI - Delete (by UPI document id)
  async deleteStoreUpi(storeId, upiId) {
    return this.delete(`${this.endpoint}/${storeId}/upi/${upiId}`);
  }

  // Store Payment Gateway - Get
  async getStorePaymentGateways(storeId, options = {}) {
    const params = { store: storeId, ...(options.scope && { scope: options.scope }) };
    return this.get(`${this.endpoint}/payment-gateway`, params);
  }

  // Store Payment Gateway - Create
  async createStorePaymentGateway(storeId, payload) {
    return this.post(`${this.endpoint}/payment-gateway`, payload, { store: storeId });
  }

  // Store Payment Gateway - Update
  async updateStorePaymentGateway(storeId, gatewayId, payload) {
    return this.put(`${this.endpoint}/payment-gateway/${gatewayId}`, payload, {
      store: storeId,
    });
  }

  // Store Payment Gateway - Delete
  async deleteStorePaymentGateway(storeId, gatewayId) {
    return this.delete(`${this.endpoint}/payment-gateway/${gatewayId}`, { store: storeId });
  }

  // Store Payment Gateway - Rotate webhook secret (returns new secret for Razorpay setup)
  async rotateStorePaymentGatewayWebhookSecret(storeId, gatewayId) {
    return this.post(
      `${this.endpoint}/payment-gateway/${gatewayId}/rotate-webhook-secret`,
      {},
      { store: storeId },
    );
  }

  // Verify GST number
  async verifyGst(gstNo) {
    return this.post(API_CONFIG?.RETAILER?.GST_VERIFY, { gstNo });
  }

  async getInvoiceNumberTemplates() {
    return this.get(`${this.endpoint}/invoice-number-templates`);
  }

  async getInvoiceNumberPreview(storeId, params = {}) {
    return this.get(`${this.endpoint}/${storeId}/invoice-number-preview`, params);
  }
}

// Create and export a singleton instance
const storeService = new StoreService();
export default storeService;
