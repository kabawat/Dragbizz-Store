import API_CONFIG from '@/config/api.config';
import { handleApiSuccess, handleApiErrorResponse } from '@/utils/errorHandler';
import { retailerAxios, unauthAxios } from '@/service/config/axiosConfig';
import { attachQueryParams } from '@/utils/queryParams';

class PurchaseOrderService {

  async createPurchaseOrder(poData) {
    try {
      let payload = poData;
      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });

      const response = await retailerAxios.post(API_CONFIG?.RETAILER?.PURCHASE_ORDER, payload);
      return handleApiSuccess(response?.data, 'Purchase order created successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'po-creation');
    }
  }

  async getPurchaseOrders(params = {}) {
    try {
      const url = attachQueryParams(API_CONFIG?.RETAILER?.PURCHASE_ORDER, params);
      const response = await retailerAxios.get(url);
      return handleApiSuccess(response?.data, 'Purchase orders fetched successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'po-list');
    }
  }

  async updatePurchaseOrder(poId, updateData, storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.PURCHASE_ORDER}/${poId}`;
      if (storeId) {
        url = attachQueryParams(url, { store: storeId });
      }
      const response = await retailerAxios.put(url, updateData);
      return handleApiSuccess(response?.data, 'Purchase order updated successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'po-update');
    }
  }

  async getPurchaseOrder(poId, storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.PURCHASE_ORDER}/${poId}`;
      if (storeId) {
        url = attachQueryParams(url, { store: storeId });
      }
      const response = await retailerAxios.get(url);
      return handleApiSuccess(response?.data, 'Purchase order fetched successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'po-details');
    }
  }

  async getPublicPurchaseOrder(poId) {
    try {
      const response = await unauthAxios.post('/retailer/public/purchase-orders', {
        id: poId
      });
      return handleApiSuccess(response?.data, 'Public purchase order fetched successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'public-po-details');
    }
  }

  async deletePurchaseOrder(poId, storeId = null) {
    try {
      let url = `${API_CONFIG?.RETAILER?.PURCHASE_ORDER}/${poId}`;
      if (storeId) {
        url = attachQueryParams(url, { store: storeId });
      }
      const response = await retailerAxios.delete(url);
      return handleApiSuccess(response?.data, 'Purchase order deleted successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'po-deletion');
    }
  }
}

const purchaseOrderService = new PurchaseOrderService();
export default purchaseOrderService;


