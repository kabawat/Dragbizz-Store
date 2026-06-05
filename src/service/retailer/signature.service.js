import { API_CONFIG } from "@/config";
import { BaseService } from "@/service/base/BaseService";

class SignatureService extends BaseService {
    constructor() {
        super();
        this.baseEndpoint = API_CONFIG?.RETAILER?.SIGNATURE;
    }

    // Create a new signature
    createSignature(signatureData) {
        return this.post(this.baseEndpoint, signatureData);
    }

    // Get signatures for an agency or a single signature by ID
    getSignatures(params = {}) {
        return this.get(this.baseEndpoint, params);
    }

    // Delete a signature
    deleteSignature(id) {
        return this.delete(`${this.baseEndpoint}/${id}`);
    }
}

const signatureService = new SignatureService();
export default signatureService;
