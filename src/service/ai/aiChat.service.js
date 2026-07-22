import { API_CONFIG } from "@/config";
import { BaseService } from "@/service/base/BaseService";
import { handleApiErrorResponse, handleApiSuccess } from "@/utils/errorHandler";

class AiChatService extends BaseService {
  constructor() {
    super();
    this.endpoint = API_CONFIG?.AI?.CHAT;
    this.timeout = Number(API_CONFIG?.AI?.CHAT_TIMEOUT_MS) || 45_000;
  }

  /**
   * POST /brain/api/v1/chat — cookie session (`at`) via authAxios.
   * @param {{ text: string, sessionId: string, storeId: string, language?: string }} payload
   */
  async chat({ text, sessionId, storeId, language = "hi-IN" }) {
    try {
      const response = await this.authAxios.post(
        this.endpoint,
        {
          text,
          sessionId,
          storeId,
          language,
        },
        { timeout: this.timeout }
      );
      return handleApiSuccess(response, "Chat completed");
    } catch (error) {
      const nested =
        error?.response?.data?.error?.message ||
        error?.response?.data?.error?.code;
      const fallback = handleApiErrorResponse(error, "ai-chat");
      if (nested && typeof nested === "string") {
        return { ...fallback, message: nested };
      }
      return fallback;
    }
  }
}

const aiChatService = new AiChatService();
export default aiChatService;
