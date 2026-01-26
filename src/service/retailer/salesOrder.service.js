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

    // Get single sales order by ID
    async getSalesOrder(id) {
        try {
            const response = await authAxios.get(`${API_CONFIG.RETAILER.SALES_ORDER}/${id}`);
            return handleApiSuccess(response.data, "Sales order fetched successfully");
        } catch (error) {
            return handleApiErrorResponse(error, "sales-order-details");
        }
    }

    // Update Status
    async updateStatus(id, status) {
        try {
            const response = await authAxios.patch(`${API_CONFIG.RETAILER.SALES_ORDER}/${id}/status`, { status });
            return handleApiSuccess(response.data, "Status updated successfully");
        } catch (error) {
            return handleApiErrorResponse(error, "sales-order-status-update");
        }
    }
}

const salesOrderService = new SalesOrderService();
export default salesOrderService;
