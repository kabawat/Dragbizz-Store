import { API_CONFIG } from "@/config";
import { authAxios } from "@/service/config/axiosConfig";
import { handleApiErrorResponse, handleApiSuccess } from "@/utils/errorHandler";

class VoiceAIService {
  // Chat with Voice AI for customer creation
  async chatCustomer(prompt, sessionId = null, storeId = null) {
    try {
      const payload = {
        prompt,
        ...(sessionId && { sessionId }),
        ...(storeId && { store: storeId }),
      };

      const response = await authAxios.post(
        API_CONFIG.VOICE_AI.CUSTOMER_CHAT,
        payload
      );

      return handleApiSuccess(response?.data, "Chat processed successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "voice-ai-chat");
    }
  }

  // Chat with Voice AI for supplier creation
  async chatSupplier(prompt, sessionId = null, storeId = null) {
    try {
      const payload = {
        prompt,
        ...(sessionId && { sessionId }),
        ...(storeId && { store: storeId }),
      };

      const response = await authAxios.post(
        API_CONFIG.VOICE_AI.SUPPLIER_CHAT,
        payload
      );

      return handleApiSuccess(response?.data, "Chat processed successfully");
    } catch (error) {
      return handleApiErrorResponse(error, "voice-ai-chat");
    }
  }

  // Extract product data from image using AI
  async extractProductFromImage(imageFile) {
    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      const response = await authAxios.post(
        API_CONFIG.VOICE_AI.PRODUCT_EXTRACT,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return handleApiSuccess(
        response?.data,
        "Product data extracted successfully"
      );
    } catch (error) {
      return handleApiErrorResponse(error, "product-extract");
    }
  }
}

// Create and export a singleton instance
const voiceAIService = new VoiceAIService();
export default voiceAIService;
