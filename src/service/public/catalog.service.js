import { API_CONFIG } from "@/config";
import { unauthAxios } from "@/service/config/axiosConfig";
import { handleApiErrorResponse, handleApiSuccess } from "@/utils/errorHandler";

class PublicCatalogService {
    async getCatalog(catalogId) {
        try {
            const response = await unauthAxios.get(
                `${API_CONFIG.RETAILER.PUBLIC_CATALOG}/${catalogId}`
            );
            return handleApiSuccess(response.data, "Catalog fetched successfully");
        } catch (error) {
            return handleApiErrorResponse(error, "public-catalog-fetch");
        }
    }
}

const publicCatalogService = new PublicCatalogService();
export default publicCatalogService;
