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
  const turnRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [activeTool, setActiveTool] = useState(null);
  const [progress, setProgress] = useState(null);
  const [chatError, setChatError] = useState(null);

  const resetChat = useCallback(() => {
    const activeController = abortRef.current;
    inflightRef.current = false;
    turnRef.current = null;
    abortRef.current = null;
    activeController?.abort();
    const nextId = generateUUID();
    sessionIdRef.current = nextId;
    setSessionId(nextId);
    setMessages([]);
    setIsSending(false);
    setIsConfirming(false);
    setActiveTool(null);
    setProgress(null);
    setChatError(null);
  }, []);

  const loadChat = useCallback(
    ({ sessionId: nextSessionId, messages: nextMessages }) => {
      const activeController = abortRef.current;
      inflightRef.current = false;
      turnRef.current = null;
      abortRef.current = null;
      if (activeController) {
        activeController.abort();
      }
      setIsSending(false);
      setIsConfirming(false);
      setActiveTool(null);
      const nextId =
        typeof nextSessionId === "string" && nextSessionId.trim()
          ? nextSessionId.trim()
          : generateUUID();
      sessionIdRef.current = nextId;
      setSessionId(nextId);
      setMessages(Array.isArray(nextMessages) ? nextMessages : []);
      setChatError(null);
    },
    []
  );

  const appendAssistantFromPayload = useCallback((payload) => {
    const message = typeof payload.message === "string" ? payload.message : "";
    const tools = Array.isArray(payload.toolResults)
      ? payload.toolResults
      : Array.isArray(payload.tool_results)
        ? payload.tool_results
        : [];
    const pendingConfirmation = pickPendingConfirmation(payload);
    const assistantMessage = createMessage("assistant", message, {
      toolResults: tools,
      pendingConfirmation,
      executionStatus:
        payload.executionStatus || payload.execution_status || "completed",
      errorCode: payload.errorCode || payload.error_code || null,
      toolOutcomes: Array.isArray(payload.toolOutcomes)
        ? payload.toolOutcomes
        : Array.isArray(payload.tool_outcomes)
          ? payload.tool_outcomes
          : [],
    });
    setMessages((current) => [...current, assistantMessage]);
    return { message, toolResults: tools, pendingConfirmation };
  }, []);

  const sendChat = useCallback(
    async (text, { isRetry = false } = {}) => {
      const trimmed = typeof text === "string" ? text.trim() : "";
      if (!trimmed || inflightRef.current) return null;

      if (!storeId) {
        setChatError({ code: "STORE_REQUIRED" });
        return null;
      }

      inflightRef.current = true;
      setIsSending(true);
      setActiveTool(null);
      setProgress({ stage: "thinking", label: "Thinking…" });
      setChatError(null);

      let turn = turnRef.current;
      if (!isRetry || !turn || turn.text !== trimmed) {
        const userMessage = createMessage("user", trimmed);
        turn = { text: trimmed, userMessageId: userMessage.id };
        turnRef.current = turn;
        setMessages((current) => [
          ...current.map((item) =>
            item.pendingConfirmation && !item.pendingConfirmation.status
              ? {
                  ...item,
                  pendingConfirmation: {
                    ...item.pendingConfirmation,
                    status: "CANCELLED",
                  },
                }
              : item
          ),
          userMessage,
        ]);
      }

      const controller = new AbortController();
      abortRef.current = controller;
      const requestSessionId = sessionIdRef.current;
      const isCurrentRequest = () =>
        abortRef.current === controller &&
        sessionIdRef.current === requestSessionId;

      try {
        const result = await aiChatService.chatStream({
          text: trimmed,
          sessionId: requestSessionId,
          storeId,
          language,
          signal: controller.signal,
          onEvent: (event, data) => {
            if (!isCurrentRequest()) return;
            if (event === "agent.progress") {
              setProgress({
                stage: data?.stage || "progress",
                label: data?.label || "Working on your request…",
                tool: data?.tools?.[0] || data?.tool || null,
              });
              if (data?.stage === "synthesizing") {
                setActiveTool(null);
              }
              return;
            }
            if (event === "tool.started") {
              const toolName = data?.tool || null;
              const toolLabel = data?.label || null;
              setActiveTool(toolName);
              setProgress({
                stage: "tool_executing",
                label: toolLabel || "Querying store database…",
                tool: toolName,
              });
              return;
            }
            if (event === "tool.completed") {
              setActiveTool(null);
              return;
            }
            if (event !== "assistant.delta" || typeof data?.text !== "string") {
              return;
            }
            setActiveTool(null);
            setProgress(null);
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

        if (!isCurrentRequest()) return null;

        if (!result.success) {
          const code =
            result?.error?.error?.code ||
            result?.error?.code ||
            result?.code ||
            "AI_CHAT_FAILED";
          setChatError({
            code: typeof code === "string" ? code : "AI_CHAT_FAILED",
            requestId: result.requestId || null,
            retryable: Boolean(result.retryable),
            partialMessage:
              typeof result.partialMessage === "string"
                ? result.partialMessage
                : "",
          });
          if (result.partialMessage) {
            setMessages((current) => [
              ...current.filter((item) => !item.streaming),
              createMessage("assistant", result.partialMessage, {
                partial: true,
              }),
            ]);
          } else {
            setMessages((current) => current.filter((item) => !item.streaming));
          }
          return null;
        }

        if (result.data?.executionStatus === "error") {
          setChatError({
            code: result.data.errorCode || "AI_CHAT_FAILED",
            requestId: result.data.requestId || null,
            retryable: false,
            partialMessage: result.data.message || "",
          });
          setMessages((current) => [
            ...current.filter((item) => !item.streaming),
            ...(result.data.message
              ? [
                  createMessage("assistant", result.data.message, {
                    partial: true,
                    executionStatus: "error",
                  }),
                ]
              : []),
          ]);
          return null;
        }

        setMessages((current) => {
          if (current[current.length - 1]?.streaming) {
            return current.slice(0, -1);
          }
          return current;
        });
        return appendAssistantFromPayload(result.data || {});
      } catch {
        if (!isCurrentRequest()) return null;
        setChatError({
          code: "AI_STREAM_INTERRUPTED",
          requestId: null,
          retryable: false,
          partialMessage: "",
        });
        return null;
      } finally {
        if (isCurrentRequest()) {
          abortRef.current = null;
          inflightRef.current = false;
          setActiveTool(null);
          setProgress(null);
          setIsSending(false);
        }
      }
    },
    [storeId, language, appendAssistantFromPayload]
  );

  const resolvePending = useCallback(
    async (pending, action, updates = null) => {
      if (
        !pending?.confirmationId ||
        !pending?.draftId ||
        inflightRef.current
      ) {
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
          updates,
        });

        // If rejected, mark as CANCELLED so card displays Canceled; if approved, clear.
        setMessages((current) =>
          current.map((item) =>
            item.pendingConfirmation?.confirmationId === pending.confirmationId
              ? {
                  ...item,
                  pendingConfirmation:
                    action === "reject"
                      ? { ...item.pendingConfirmation, status: "CANCELLED" }
                      : null,
                }
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
    (pending, updates = null) => resolvePending(pending, "approve", updates),
    [resolvePending]
  );

  const rejectPending = useCallback(
    (pending) => resolvePending(pending, "reject"),
    [resolvePending]
  );

  const retryLastTurn = useCallback(() => {
    if (!chatError?.retryable || !turnRef.current || inflightRef.current) {
      return null;
    }
    const { text, userMessageId } = turnRef.current;
    setChatError(null);
    setMessages((current) => {
      const userIndex = current.findIndex((item) => item.id === userMessageId);
      return current.filter(
        (item, index) =>
          item.id !== userMessageId &&
          !(
            index > userIndex &&
            item.role === "assistant" &&
            (item.partial || item.streaming)
          )
      );
    });
    return sendChat(text, { isRetry: true });
  }, [chatError, sendChat]);

  const cancelChat = useCallback(() => {
    const controller = abortRef.current;
    if (!controller || !inflightRef.current) return;
    controller.abort();
    abortRef.current = null;
    inflightRef.current = false;
    setIsSending(false);
    setActiveTool(null);
    setProgress(null);
    setChatError({
      code: "AI_REQUEST_ABORTED",
      requestId: null,
      retryable: false,
      partialMessage: "",
    });
    setMessages((current) => current.filter((item) => !item.streaming));
  }, []);

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
    activeTool,
    progress,
    chatError,
    retryLastTurn,
    cancelChat,
    sendChat,
    confirmPending,
    rejectPending,
    resetChat,
    loadChat,
  };
}

export default useAiVoiceChat;
