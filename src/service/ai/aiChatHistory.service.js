import { API_CONFIG } from "@/config";
import { BaseService } from "@/service/base/BaseService";
import { handleApiErrorResponse, handleApiSuccess } from "@/utils/errorHandler";

class AiChatHistoryService extends BaseService {
  constructor() {
    super();
    this.sessionsEndpoint = API_CONFIG?.AI?.SESSIONS;
    this.sessionByIdEndpoint = API_CONFIG?.AI?.SESSION_BY_ID;
    this.timeout = Number(API_CONFIG?.AI?.CHAT_TIMEOUT_MS) || 45_000;
  }

  _sessionUrl(sessionId) {
    return String(this.sessionByIdEndpoint || "").replace(
      ":sessionId",
      encodeURIComponent(sessionId)
    );
  }

  async listSessions({ storeId }) {
    try {
      const response = await this.authAxios.get(this.sessionsEndpoint, {
        params: { storeId },
        timeout: this.timeout,
      });
      return handleApiSuccess(response, "Sessions loaded");
    } catch (error) {
      return handleApiErrorResponse(error, "ai-sessions");
    }
  }

  async getSession({ sessionId, storeId }) {
    try {
      const response = await this.authAxios.get(this._sessionUrl(sessionId), {
        params: { storeId },
        timeout: this.timeout,
      });
      return handleApiSuccess(response, "Session loaded");
    } catch (error) {
      return handleApiErrorResponse(error, "ai-session");
    }
  }

  async deleteSession({ sessionId, storeId }) {
    try {
      const response = await this.authAxios.delete(this._sessionUrl(sessionId), {
        params: { storeId },
        timeout: this.timeout,
      });
      return handleApiSuccess(response, "Session deleted");
    } catch (error) {
      return handleApiErrorResponse(error, "ai-session-delete");
    }
  }
}

const aiChatHistoryService = new AiChatHistoryService();
export default aiChatHistoryService;
