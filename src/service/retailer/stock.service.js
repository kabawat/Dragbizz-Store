import { API_CONFIG } from "@/config";
import { authAxios } from "@/service/config/axiosConfig";

class StockService {
  constructor() {
    this.baseURL = API_CONFIG.BASE.URL;
  }

  async addStock(stockData) {
    return authAxios.post(API_CONFIG?.RETAILER?.STOCK, stockData);
  }
}

const stockService = new StockService();
export default stockService;
