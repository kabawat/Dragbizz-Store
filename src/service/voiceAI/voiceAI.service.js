import { API_CONFIG } from '@/config';
import { handleApiSuccess, handleApiErrorResponse } from '@/utils/errorHandler';
import { authAxios } from '@/service/config/axiosConfig';

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
      
      return handleApiSuccess(response?.data, 'Chat processed successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'voice-ai-chat');
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
      
      return handleApiSuccess(response?.data, 'Chat processed successfully');
    } catch (error) {
      return handleApiErrorResponse(error, 'voice-ai-chat');
    }
  }
}

// Create and export a singleton instance
const voiceAIService = new VoiceAIService();
export default voiceAIService;

