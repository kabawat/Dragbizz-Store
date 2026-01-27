import { API_CONFIG } from "@/config";
import { BaseService } from "../base/BaseService";

class PublicSalesOrderService extends BaseService {
    constructor() {
        super();
        this.endpoint = API_CONFIG.RETAILER.PUBLIC_SALES_ORDER;
    }

    async createOrder(orderData) {
        return this.unauthPost(this.endpoint, orderData, {}, "create-order");
    }

    async verifyOtp(verificationData) {
        // verificationData should contain { secret, otp }
        return this.unauthPut(this.endpoint, verificationData, {}, "verify-otp");
    }

    async getOrder(publicId) {
        return this.unauthGet(`${this.endpoint}/track/${publicId}`, {}, "get-order");
    }
}

const publicSalesOrderService = new PublicSalesOrderService();
export default publicSalesOrderService;
