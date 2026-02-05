// src/service/retailer/signature.service.js

import { API_CONFIG } from "@/config";
import { authAxios } from "@/service/config/axiosConfig";
import { handleApiErrorResponse, handleApiSuccess } from "@/utils/errorHandler";
import { attachQueryParams } from "@/utils/queryParams";

class SignatureService {
    constructor() {
        this.baseURL = API_CONFIG.BASE.URL;
    }

    // Create a new signature
    async createSignature(signatureData) {
        try {
            const response = await authAxios.post(
                API_CONFIG?.RETAILER?.SIGNATURE,
                signatureData
            );
            return handleApiSuccess(response?.data, "Signature saved successfully");
        } catch (error) {
            return handleApiErrorResponse(error, "signature-creation");
        }
    }

    // Get signatures for an agency or a single signature by ID
    async getSignatures(params = {}) {
        try {
            const url = attachQueryParams(API_CONFIG?.RETAILER?.SIGNATURE, params);
            const response = await authAxios.get(url);
            return handleApiSuccess(response?.data, "Signatures fetched successfully");
        } catch (error) {
            return handleApiErrorResponse(error, "signatures-fetch");
        }
    }
}

const signatureService = new SignatureService();
export default signatureService;
