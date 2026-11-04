import { API_CONFIG } from "@/config";
import { authAxios } from "@/service/config/axiosConfig";

class StockService {
  constructor() {
    this.baseURL = API_CONFIG.BASE.URL;
  }

  async addStock(stockData) {
    const store = stockData?.store;
    return authAxios.post(API_CONFIG?.CORE?.STOCK, stockData, {
      params: store ? { store } : {},
    });
  }
}

const stockService = new StockService();
export default stockService;
