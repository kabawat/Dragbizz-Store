import { API_CONFIG } from '@/config';
import { handleApiSuccess, handleApiErrorResponse } from '@/utils/errorHandler';
import { retailerAxios } from '@/service/config/axiosConfig';

class StockService {
  constructor() {
    this.baseURL = API_CONFIG.BASE.URL;
  }

  // Add stock to a product
  async addStock(stockData) {
    try {
      const response = await retailerAxios.post(API_CONFIG?.RETAILER?.STOCK, stockData);
      return handleApiSuccess(response?.data, 'Stock added successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'stock-addition');
    }
  }
}

// Create and export a singleton instance
const stockService = new StockService();
export default stockService;
