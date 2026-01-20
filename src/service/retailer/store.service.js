// src/service/retailer/store.service.js

import { API_CONFIG } from "@/config";
import { authAxios } from "@/service/config/axiosConfig";
import { handleApiErrorResponse, handleApiSuccess } from "@/utils/errorHandler";
import { attachQueryParams } from "@/utils/queryParams";

class StoreService {
  constructor() {
    this.baseURL = API_CONFIG.BASE.URL;
  }

  // Uses Auth service token
  async getRetailerProfile() {
    try {
      const response = await authAxios.post(API_CONFIG?.RETAILER?.PROFILE);
      return handleApiSuccess(
        response?.data,
        "Retailer profile fetched successfully"
      );
    } catch (error) {
      return handleApiErrorResponse(error, "retailer-profile");
    }
  }

  // Create agency using auth service token
  async createAgency(agencyData) {
    try {
      const payload = {
        name: agencyData.name,
      };

      const response = await authAxios.post(
        API_CONFIG?.RETAILER?.AGENCY,
        payload
      );
      return handleApiSuccess(response, "Agency created successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "agency-creation");
    }
  }

  // Create store using auth service token
  async createStore(storeData) {
    try {
      // Format payload according to API structure
      const payload = {
        name: storeData.name,
        agency: storeData.agency,
        phone: storeData.phone,
        email: storeData.email || "",
        address: {
          line1: storeData.address.street || "",
          line2: "", // Not collected in form
          city: storeData.address.city,
          state: storeData.address.state || "",
          country: "India", // Default to India
          pincode: storeData.address.pincode || "",
          landmark: storeData.address.landmark || "",
          location: {
            type: "Point",
            coordinates: storeData.location
              ? storeData.location.split(",").map(Number)
              : [0, 0],
          },
        },
        category: storeData.category || "",
        subCategories: storeData.subCategories || [],
        tags: storeData.tags || [],
        gst: storeData.gst || "",
        pan: storeData.pan || "",
        status: "active",
        metadata: {
          gst: storeData.gst || "",
          owner: storeData.owner || "",
        },
      };

      const response = await authAxios.post(
        API_CONFIG?.RETAILER?.STORE,
        payload
      );
      return handleApiSuccess(response, "Store created successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "store-creation");
    }
  }

  // Get store details
  async getStore(storeId) {
    try {
      const response = await authAxios.get(
        `${API_CONFIG?.RETAILER?.STORE}?id=${storeId}`
      );
      return handleApiSuccess(response?.data, "Store fetched successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "store-get");
    }
  }

  // Update store
  async updateStore(storeId, storeData) {
    try {
      const response = await authAxios.put(
        `${API_CONFIG?.RETAILER?.STORE}/${storeId}`,
        storeData
      );
      return handleApiSuccess(response?.data, "Store updated successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "store-update");
    }
  }

  // Get all stores for retailer
  async getStores(params = {}) {
    try {
      const url = attachQueryParams(API_CONFIG?.RETAILER?.STORE, params);
      const response = await authAxios.get(url);
      return handleApiSuccess(response?.data, "Stores fetched successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "stores-list");
    }
  }

  // Request OTP for store delete
  async requestDeleteStoreOtp(storeId, channel = "sms") {
    try {
      const response = await authAxios.post(
        `${API_CONFIG?.RETAILER?.STORE}/${storeId}/delete/request`,
        { channel }
      );
      return handleApiSuccess(response?.data, "OTP sent successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "store-delete-request");
    }
  }

  // Verify OTP and delete store
  async verifyDeleteStoreOtp(storeId, signature, otp) {
    try {
      const response = await authAxios.post(
        `${API_CONFIG?.RETAILER?.STORE}/${storeId}/delete/verify`,
        { signature, otp }
      );
      return handleApiSuccess(response?.data, "Store deleted successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "store-delete-verify");
    }
  }
}

// Create and export a singleton instance
const storeService = new StoreService();
export default storeService;
