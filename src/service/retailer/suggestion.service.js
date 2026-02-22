import { API_CONFIG } from "@/config";
import { authAxios } from "@/service/config/axiosConfig";
import { handleApiErrorResponse, handleApiSuccess } from "@/utils/errorHandler";
import { attachQueryParams } from "@/utils/queryParams";

class SuggestionService {
    constructor() {
        this.baseURL = API_CONFIG.BASE.URL;
    }

    // Submit a new suggestion
    async createSuggestion(data) {
        try {
            const response = await authAxios.post(API_CONFIG?.RETAILER?.SUGGESTION, data);
            return handleApiSuccess(response?.data, "Suggestion submitted successfully");
        } catch (error) {
            return handleApiErrorResponse(error, "suggestion-creation");
        }
    }

    // Get suggestions with filters/pagination/single-fetch
    async getSuggestions(params = {}) {
        try {
            const url = attachQueryParams(API_CONFIG?.RETAILER?.SUGGESTION, params);
            const response = await authAxios.get(url);
            return handleApiSuccess(response?.data, "Suggestions fetched successfully");
        } catch (error) {
            return handleApiErrorResponse(error, "suggestions-list");
        }
    }

    // Upvote a suggestion
    async upvoteSuggestion(id) {
        try {
            const url = `${API_CONFIG?.RETAILER?.SUGGESTION}/${id}/upvote`;
            const response = await authAxios.post(url);
            return handleApiSuccess(response?.data, "Upvoted successfully");
        } catch (error) {
            return handleApiErrorResponse(error, "suggestion-upvote");
        }
    }

    // Delete a suggestion
    async deleteSuggestion(id, storeId) {
        try {
            const url = attachQueryParams(`${API_CONFIG?.RETAILER?.SUGGESTION}/${id}`, { store: storeId });
            const response = await authAxios.delete(url);
            return handleApiSuccess(response?.data, "Suggestion deleted successfully");
        } catch (error) {
            return handleApiErrorResponse(error, "suggestion-delete");
        }
    }
}

const suggestionService = new SuggestionService();
export default suggestionService;
