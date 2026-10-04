import { API_CONFIG } from "@/config";
import { BaseService } from "@/service/base/BaseService";
import { handleApiErrorResponse, handleApiSuccess } from "@/utils/errorHandler";

class AiChatService extends BaseService {
  constructor() {
    super();
    this.endpoint = API_CONFIG?.AI?.CHAT;
    this.streamEndpoint = API_CONFIG?.AI?.CHAT_STREAM;
    this.confirmEndpoint = API_CONFIG?.AI?.CONFIRM;
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

  /**
   * POST /brain/api/v1/chat/stream — SSE with AbortController.
   * Falls back to non-stream chat() when stream endpoint is unavailable.
   * @param {{
   *   text: string,
   *   sessionId: string,
   *   storeId: string,
   *   language?: string,
   *   signal?: AbortSignal,
   *   onEvent?: (event: string, data: object) => void
   * }} payload
   */
  async chatStream({
    text,
    sessionId,
    storeId,
    language = "hi-IN",
    signal,
    onEvent,
  }) {
    if (!this.streamEndpoint) {
      return this.chat({ text, sessionId, storeId, language });
    }

    const controller = new AbortController();
    const external = signal;
    const onAbort = () => controller.abort();
    if (external) {
      if (external.aborted) {
        controller.abort();
      } else {
        external.addEventListener("abort", onAbort, { once: true });
      }
    }

    try {
      const response = await fetch(this.streamEndpoint, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({ text, sessionId, storeId, language }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        return this.chat({ text, sessionId, storeId, language });
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantText = "";
      let completed = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";
        for (const part of parts) {
          const lines = part.split("\n");
          let eventName = "message";
          let dataLine = "";
          for (const line of lines) {
            if (line.startsWith("event:")) {
              eventName = line.slice(6).trim();
            } else if (line.startsWith("data:")) {
              dataLine = line.slice(5).trim();
            }
          }
          if (!dataLine) continue;
          let data = {};
          try {
            data = JSON.parse(dataLine);
          } catch {
            continue;
          }
          if (typeof onEvent === "function") {
            onEvent(eventName, data);
          }
          if (eventName === "assistant.delta" && typeof data.text === "string") {
            assistantText += data.text;
          }
          if (eventName === "request.completed") {
            completed = data;
          }
          if (eventName === "request.aborted") {
            return {
              success: false,
              message: "Request aborted",
              code: "AI_REQUEST_ABORTED",
            };
          }
        }
      }

      return {
        success: true,
        message: assistantText,
        data: {
          message: assistantText,
          sessionId: completed?.sessionId || sessionId,
          requestId: completed?.requestId,
          provider: completed?.provider,
          model: completed?.model,
          pendingConfirmation: completed?.pendingConfirmation || null,
        },
      };
    } catch (error) {
      if (error?.name === "AbortError") {
        return {
          success: false,
          message: "Request aborted",
          code: "AI_REQUEST_ABORTED",
        };
      }
      return this.chat({ text, sessionId, storeId, language });
    } finally {
      if (external) {
        external.removeEventListener("abort", onAbort);
      }
    }
  }

  /**
   * POST /brain/api/v1/chat/confirm — approve or reject a pending sensitive action.
   * @param {{
   *   sessionId: string,
   *   storeId: string,
   *   confirmationId: string,
   *   draftId: string,
   *   action: "approve" | "reject"
   * }} payload
   */
  async confirm({
    sessionId,
    storeId,
    confirmationId,
    draftId,
    action,
  }) {
    try {
      const response = await this.authAxios.post(
        this.confirmEndpoint,
        {
          sessionId,
          storeId,
          confirmationId,
          draftId,
          action,
        },
        { timeout: this.timeout }
      );
      return handleApiSuccess(response, "Confirmation completed");
    } catch (error) {
      const nested =
        error?.response?.data?.error?.message ||
        error?.response?.data?.error?.code;
      const fallback = handleApiErrorResponse(error, "ai-confirm");
      if (nested && typeof nested === "string") {
        return { ...fallback, message: nested };
      }
      return fallback;
    }
  }
}

const aiChatService = new AiChatService();
export default aiChatService;
