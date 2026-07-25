"use client";

import { useCallback, useRef, useState } from "react";
import { aiChatService } from "@/service/ai";
import { useAppSelector } from "@/store/hooks";
import { pickStoreId } from "@/utils/store.util";
import { generateUUID } from "@/utils/uuid.util";

function createMessage(role, content, extras = {}) {
  return {
    id: generateUUID(),
    role,
    content,
    createdAt: Date.now(),
    ...extras,
  };
}

/**
 * Owns AI chat session + send for the store assistant.
 * Does not own mic/STT — call sendChat with final text.
 */
export function useAiVoiceChat({ language = "hi-IN" } = {}) {
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = pickStoreId(selectedStore);

  const sessionIdRef = useRef(generateUUID());
  const inflightRef = useRef(false);

  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState(null);

  const resetChat = useCallback(() => {
    sessionIdRef.current = generateUUID();
    setMessages([]);
    setChatError(null);
  }, []);

  const sendChat = useCallback(
    async (text) => {
      const trimmed = typeof text === "string" ? text.trim() : "";
      if (!trimmed || inflightRef.current) return null;

      if (!storeId) {
        setChatError({ code: "STORE_REQUIRED" });
        return null;
      }

      inflightRef.current = true;
      setIsSending(true);
      setChatError(null);

      const userMessage = createMessage("user", trimmed);
      setMessages((current) => [...current, userMessage]);

      try {
        const result = await aiChatService.chat({
          text: trimmed,
          sessionId: sessionIdRef.current,
          storeId,
          language,
        });

        if (!result.success) {
          const code =
            result?.error?.error?.code ||
            result?.error?.code ||
            "AI_CHAT_FAILED";
          setChatError({
            code: typeof code === "string" ? code : "AI_CHAT_FAILED",
            message: result.message,
          });
          return null;
        }

        const payload = result.data || {};
        const message =
          typeof payload.message === "string" ? payload.message : "";
        const tools = Array.isArray(payload.toolResults)
          ? payload.toolResults
          : Array.isArray(payload.tool_results)
            ? payload.tool_results
            : [];

        const assistantMessage = createMessage("assistant", message, {
          toolResults: tools,
        });
        setMessages((current) => [...current, assistantMessage]);
        return { message, toolResults: tools };
      } catch (err) {
        setChatError({
          code: "AI_CHAT_FAILED",
          message: err?.message || null,
        });
        return null;
      } finally {
        inflightRef.current = false;
        setIsSending(false);
      }
    },
    [storeId, language]
  );

  const reply =
    [...messages].reverse().find((item) => item.role === "assistant")
      ?.content ?? null;
  const toolResults =
    [...messages].reverse().find((item) => item.role === "assistant")
      ?.toolResults ?? [];

  return {
    storeId,
    sessionId: sessionIdRef.current,
    messages,
    reply,
    toolResults,
    isSending,
    chatError,
    sendChat,
    resetChat,
  };
}

export default useAiVoiceChat;
