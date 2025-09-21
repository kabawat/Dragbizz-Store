// src/service/auth/retailerService.js
import { authAxios, retailerAxios } from '../config/axiosConfig';
import { API_CONFIG } from '@/config';
import { handleApiSuccess, handleApiErrorResponse } from '@/utils/errorHandler';

class RetailerService {
  constructor() {
    this.baseURL = API_CONFIG.BASE.URL;
  }

  // Get retailer profile using auth service token
  async getRetailerProfile() {
    try {
      const response = await authAxios.post(API_CONFIG?.RETAILER?.PROFILE);
      return handleApiSuccess(response?.data, 'Retailer profile fetched successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'retailer-profile');
    }
  }
  
  // Create agency using auth service token
  async createAgency(agencyData) {
    try {
      const payload = {
        name: agencyData.name
      };
      
      const response = await authAxios.post(API_CONFIG?.RETAILER?.AGENCY, payload);
      return handleApiSuccess(response, 'Agency created successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'agency-creation');
    }
  }

  // Create store using auth service token
  async createStore(storeData) {
    try {
      console.log('RetailerService - Creating store:', storeData);
      
      // Format payload according to API structure
      const payload = {
        name: storeData.name,
        agency: storeData.agency,
        phone: storeData.phone,
        email: storeData.email || '',
        address: {
          line1: storeData.address.street || '',
          line2: '', // Not collected in form
          city: storeData.address.city,
          state: storeData.address.state || '',
          country: 'India', // Default to India
          pincode: storeData.address.pincode || '',
          landmark: storeData.address.landmark || '',
          location: {
            type: 'Point',
            coordinates: storeData.location ? storeData.location.split(',').map(Number) : [0, 0]
          }
        },
        category: storeData.category || '',
        subCategories: storeData.subCategories || [],
        tags: storeData.tags || [],
        gst: storeData.gst || '',
        pan: storeData.pan || '',
        status: 'active',
        metadata: {
          gst: storeData.gst || '',
          owner: storeData.owner || ''
        }
      };
      
      console.log('RetailerService - Store payload:', payload);
      
      const response = await authAxios.post(API_CONFIG?.RETAILER?.STORE, payload);
      return handleApiSuccess(response, 'Store created successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'store-creation');
    }
  }

}

// Create and export a singleton instance
const retailerService = new RetailerService();
export default retailerService;
