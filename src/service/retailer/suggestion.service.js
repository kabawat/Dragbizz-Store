import { API_CONFIG } from "@/config";
import { BaseService } from "@/service/base/BaseService";

class SuggestionService extends BaseService {
    constructor() {
        super();
        this.baseEndpoint = API_CONFIG?.RETAILER?.SUGGESTION;
    }

    // Submit a new suggestion
    createSuggestion(data) {
        return this.post(this.baseEndpoint, data);
    }

    // Get suggestions with filters/pagination/single-fetch
    getSuggestions(params = {}) {
        return this.get(this.baseEndpoint, params);
    }

    // Upvote a suggestion
    upvoteSuggestion(id) {
        return this.post(`${this.baseEndpoint}/${id}/upvote`);
    }

    // Delete a suggestion
    deleteSuggestion(id, storeId) {
        return this.delete(`${this.baseEndpoint}/${id}`, { store: storeId });
    }
}

const suggestionService = new SuggestionService();
export default suggestionService;
