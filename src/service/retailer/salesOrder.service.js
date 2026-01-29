import { API_CONFIG } from "@/config";
import { authAxios } from "@/service/config/axiosConfig";
import { handleApiErrorResponse, handleApiSuccess } from "@/utils/errorHandler";
import { attachQueryParams } from "@/utils/queryParams";

class SalesOrderService {
    // Get Sales Orders (List/Single)
    async getSalesOrders(params = {}) {
        try {
            const url = attachQueryParams(API_CONFIG.RETAILER.SALES_ORDER, params);
            const response = await authAxios.get(url);
            return handleApiSuccess(response.data, "Sales orders fetched successfully");
        } catch (error) {
            return handleApiErrorResponse(error, "sales-orders-list");
        }
    }

    // Update Status
    async updateStatus(id, payload, params = {}) {
        try {
            const url = attachQueryParams(`${API_CONFIG.RETAILER.SALES_ORDER}/status/${id}`, params);
            const response = await authAxios.put(url, payload);
            return handleApiSuccess(response.data, "Order updated successfully");
        } catch (error) {
            return handleApiErrorResponse(error, "sales-order-status-update");
        }
    }
}

const salesOrderService = new SalesOrderService();
export default salesOrderService;
