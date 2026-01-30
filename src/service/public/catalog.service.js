import { API_CONFIG } from "@/config";
import { unauthAxios } from "@/service/config/axiosConfig";
import { handleApiErrorResponse, handleApiSuccess } from "@/utils/errorHandler";

class PublicCatalogService {
    async getCatalog(catalogId, filters = {}) {
        try {
            const queryParams = new URLSearchParams();
            if (filters.search) queryParams.append("search", filters.search);
            if (filters.category && filters.category !== "all") queryParams.append("category", filters.category);

            const queryString = queryParams.toString();
            const url = `${API_CONFIG.RETAILER.PUBLIC_CATALOG}/${catalogId}${queryString ? `?${queryString}` : ""}`;

            const response = await unauthAxios.get(url);
            return handleApiSuccess(response.data, "Catalog fetched successfully");
        } catch (error) {
            return handleApiErrorResponse(error, "public-catalog-fetch");
        }
    }

    async getCategories(catalogId) {
        try {
            const response = await unauthAxios.get(
                `${API_CONFIG.RETAILER.PUBLIC_CATEGORIES}/${catalogId}`
            );
            return handleApiSuccess(response.data, "Categories fetched successfully");
        } catch (error) {
            return handleApiErrorResponse(error, "public-categories-fetch");
        }
    }
}

const publicCatalogService = new PublicCatalogService();
export default publicCatalogService;
