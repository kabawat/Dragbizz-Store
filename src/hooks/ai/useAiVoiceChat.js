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

function pickPendingConfirmation(payload) {
  const pending =
    payload?.pendingConfirmation || payload?.pending_confirmation || null;
  if (!pending || typeof pending !== "object") return null;
  const confirmationId =
    pending.confirmationId || pending.confirmation_id || null;
  const draftId = pending.draftId || pending.draft_id || null;
  const type = pending.type || null;
  const expiresAt = pending.expiresAt || pending.expires_at || null;
  if (!confirmationId || !draftId) return null;
  return {
    confirmationId,
    draftId,
    type,
    summary:
      pending.summary && typeof pending.summary === "object"
        ? pending.summary
        : {},
    expiresAt,
  };
}

/**
 * Owns AI chat session + send for the store assistant.
 * Does not own mic/STT — call sendChat with final text.
 */
export function useAiVoiceChat({ language = "hi-IN" } = {}) {
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = pickStoreId(selectedStore);

  const [sessionId, setSessionId] = useState(() => generateUUID());
  const sessionIdRef = useRef(sessionId);
  const inflightRef = useRef(false);
  const abortRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [chatError, setChatError] = useState(null);

  const resetChat = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    const nextId = generateUUID();
    sessionIdRef.current = nextId;
    setSessionId(nextId);
    setMessages([]);
    setChatError(null);
  }, []);

  const loadChat = useCallback(({ sessionId: nextSessionId, messages: nextMessages }) => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    inflightRef.current = false;
    setIsSending(false);
    setIsConfirming(false);
    const nextId =
      typeof nextSessionId === "string" && nextSessionId.trim()
        ? nextSessionId.trim()
        : generateUUID();
    sessionIdRef.current = nextId;
    setSessionId(nextId);
    setMessages(Array.isArray(nextMessages) ? nextMessages : []);
    setChatError(null);
  }, []);

  const appendAssistantFromPayload = useCallback((payload) => {
    const message =
      typeof payload.message === "string" ? payload.message : "";
    const tools = Array.isArray(payload.toolResults)
      ? payload.toolResults
      : Array.isArray(payload.tool_results)
        ? payload.tool_results
        : [];
    const pendingConfirmation = pickPendingConfirmation(payload);
    const assistantMessage = createMessage("assistant", message, {
      toolResults: tools,
      pendingConfirmation,
    });
    setMessages((current) => [...current, assistantMessage]);
    return { message, toolResults: tools, pendingConfirmation };
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

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const result = await aiChatService.chatStream({
          text: trimmed,
          sessionId: sessionIdRef.current,
          storeId,
          language,
          signal: controller.signal,
          onEvent: (event, data) => {
            if (event !== "assistant.delta" || typeof data?.text !== "string") {
              return;
            }
            setMessages((current) => {
              const last = current[current.length - 1];
              if (last?.role === "assistant" && last?.streaming) {
                const next = current.slice(0, -1);
                next.push({
                  ...last,
                  content: `${last.content || ""}${data.text}`,
                });
                return next;
              }
              return [
                ...current,
                createMessage("assistant", data.text, { streaming: true }),
              ];
            });
          },
        });

        if (!result.success) {
          const code =
            result?.error?.error?.code ||
            result?.error?.code ||
            result?.code ||
            "AI_CHAT_FAILED";
          setChatError({
            code: typeof code === "string" ? code : "AI_CHAT_FAILED",
            message: result.message,
          });
          return null;
        }

        setMessages((current) => {
          if (current[current.length - 1]?.streaming) {
            return current.slice(0, -1);
          }
          return current;
        });
        return appendAssistantFromPayload(result.data || {});
      } catch (err) {
        setChatError({
          code: "AI_CHAT_FAILED",
          message: err?.message || null,
        });
        return null;
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
        }
        inflightRef.current = false;
        setIsSending(false);
      }
    },
    [storeId, language, appendAssistantFromPayload]
  );

  const resolvePending = useCallback(
    async (pending, action) => {
      if (!pending?.confirmationId || !pending?.draftId || inflightRef.current) {
        return null;
      }
      if (!storeId) {
        setChatError({ code: "STORE_REQUIRED" });
        return null;
      }

      inflightRef.current = true;
      setIsConfirming(true);
      setChatError(null);

      try {
        const result = await aiChatService.confirm({
          sessionId: sessionIdRef.current,
          storeId,
          confirmationId: pending.confirmationId,
          draftId: pending.draftId,
          action,
        });

        // Clear pending UI on the source message either way.
        setMessages((current) =>
          current.map((item) =>
            item.pendingConfirmation?.confirmationId === pending.confirmationId
              ? { ...item, pendingConfirmation: null }
              : item
          )
        );

        if (!result.success) {
          const code =
            result?.error?.error?.code ||
            result?.error?.code ||
            "AI_CONFIRM_FAILED";
          setChatError({
            code: typeof code === "string" ? code : "AI_CONFIRM_FAILED",
            message: result.message,
          });
          return null;
        }

        return appendAssistantFromPayload(result.data || {});
      } catch (err) {
        setChatError({
          code: "AI_CONFIRM_FAILED",
          message: err?.message || null,
        });
        return null;
      } finally {
        inflightRef.current = false;
        setIsConfirming(false);
      }
    },
    [storeId, appendAssistantFromPayload]
  );

  const confirmPending = useCallback(
    (pending) => resolvePending(pending, "approve"),
    [resolvePending]
  );

  const rejectPending = useCallback(
    (pending) => resolvePending(pending, "reject"),
    [resolvePending]
  );

  const reply =
    [...messages].reverse().find((item) => item.role === "assistant")
      ?.content ?? null;
  const toolResults =
    [...messages].reverse().find((item) => item.role === "assistant")
      ?.toolResults ?? [];

  return {
    storeId,
    sessionId,
    messages,
    reply,
    toolResults,
    isSending,
    isConfirming,
    chatError,
    sendChat,
    confirmPending,
    rejectPending,
    resetChat,
    loadChat,
  };
}

export default useAiVoiceChat;
