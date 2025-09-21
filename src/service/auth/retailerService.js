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
      console.log('RetailerService - Getting retailer profile');
      
      const response = await authAxios.post('/retailer/profile/');

      return handleApiSuccess(response, 'Retailer profile fetched successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'retailer-profile');
    }
  }

}

// Create and export a singleton instance
const retailerService = new RetailerService();
export default retailerService;
