import { API_CONFIG } from "@/config";
import { authAxios } from "@/service/config/axiosConfig";
import { handleApiErrorResponse, handleApiSuccess } from "@/utils/errorHandler";

class StockService {
  constructor() {
    this.baseURL = API_CONFIG.BASE.URL;
  }

  // Add stock to a product
  async addStock(stockData) {
    try {
      const response = await authAxios.post(
        API_CONFIG?.RETAILER?.STOCK,
        stockData
      );
      return handleApiSuccess(response?.data, "Stock added successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "stock-addition");
    }
  }
}

// Create and export a singleton instance
const stockService = new StockService();
export default stockService;
