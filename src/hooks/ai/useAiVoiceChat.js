"use client";

import { useCallback, useRef, useState } from "react";
import { aiChatService } from "@/service/ai";
import { useAppSelector } from "@/store/hooks";
import { pickStoreId } from "@/utils/store.util";
import { generateUUID } from "@/utils/uuid.util";

/**
 * Owns AI chat session + send for the voice launcher.
 * Does not own mic/STT — call sendChat with a final transcript.
 */
export function useAiVoiceChat({ language = "hi-IN" } = {}) {
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = pickStoreId(selectedStore);

  const sessionIdRef = useRef(generateUUID());
  const inflightRef = useRef(false);
  const lastSentRef = useRef("");

  const [reply, setReply] = useState(null);
  const [toolResults, setToolResults] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState(null);

  const resetChat = useCallback(() => {
    sessionIdRef.current = generateUUID();
    lastSentRef.current = "";
    setReply(null);
    setToolResults([]);
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

      if (trimmed === lastSentRef.current) {
        return null;
      }

      inflightRef.current = true;
      setIsSending(true);
      setChatError(null);

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
          setReply(null);
          setToolResults([]);
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

        lastSentRef.current = trimmed;
        setReply(message);
        setToolResults(tools);
        return { message, toolResults: tools };
      } catch (err) {
        setChatError({
          code: "AI_CHAT_FAILED",
          message: err?.message || null,
        });
        setReply(null);
        setToolResults([]);
        return null;
      } finally {
        inflightRef.current = false;
        setIsSending(false);
      }
    },
    [storeId, language]
  );

  return {
    storeId,
    sessionId: sessionIdRef.current,
    reply,
    toolResults,
    isSending,
    chatError,
    sendChat,
    resetChat,
  };
}

export default useAiVoiceChat;
