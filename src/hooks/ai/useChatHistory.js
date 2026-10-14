"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { aiChatHistoryService } from "@/service/ai";
import {
  MAX_CHAT_SESSIONS,
  groupSessionsByDay,
  mapHistoryMessages,
  normalizeSessionSummary,
  toMs,
} from "@/utils/ai/chatHistory";
import { generateUUID } from "@/utils/uuid.util";

export { mapHistoryMessages } from "@/utils/ai/chatHistory";

export function useChatHistory(storeId) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!storeId) {
      setSessions([]);
      setError(null);
      setLoading(false);
      return [];
    }
    setLoading(true);
    setError(null);
    try {
      const result = await aiChatHistoryService.listSessions({ storeId });
      if (!result?.success) {
        setSessions([]);
        setError(result?.message || "Failed to load chat history");
        return [];
      }
      const payload = result.data?.data ?? result.data ?? {};
      const rows = Array.isArray(payload.sessions)
        ? payload.sessions
        : Array.isArray(payload)
          ? payload
          : [];
      const next = rows
        .map(normalizeSessionSummary)
        .filter(Boolean)
        .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
        .slice(0, MAX_CHAT_SESSIONS);
      setSessions(next);
      return next;
    } catch (err) {
      setSessions([]);
      setError(err?.message || "Failed to load chat history");
      return [];
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const getSession = useCallback(
    async (sessionId) => {
      if (!storeId || !sessionId) {
        return { success: false, message: "Missing store or session" };
      }
      const result = await aiChatHistoryService.getSession({
        sessionId,
        storeId,
      });
      if (!result?.success) return result;
      const payload = result.data?.data ?? result.data ?? {};
      return {
        ...result,
        session: {
          id: String(payload.id || sessionId),
          title: String(payload.title || "New chat"),
          createdAt: toMs(payload.createdAt || payload.created_at),
          updatedAt: toMs(payload.updatedAt || payload.updated_at),
          messages: mapHistoryMessages(payload.messages),
        },
      };
    },
    [storeId]
  );

  const deleteSession = useCallback(
    async (sessionId) => {
      if (!storeId || !sessionId) {
        return { success: false, message: "Missing store or session" };
      }
      const result = await aiChatHistoryService.deleteSession({
        sessionId,
        storeId,
      });
      if (result?.success) {
        setSessions((current) =>
          current.filter((item) => item.id !== sessionId)
        );
      }
      return result;
    },
    [storeId]
  );

  const optimisticTouch = useCallback(({ id, title, createdAt }) => {
    if (!id) return;
    const now = Date.now();
    const entry = {
      id,
      title: title || "New chat",
      createdAt: createdAt || now,
      updatedAt: now,
    };
    setSessions((current) => {
      const without = current.filter((item) => item.id !== id);
      return [entry, ...without]
        .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
        .slice(0, MAX_CHAT_SESSIONS);
    });
  }, []);

  const grouped = useMemo(() => groupSessionsByDay(sessions), [sessions]);
  const createId = useCallback(() => generateUUID(), []);

  return {
    sessions,
    grouped,
    loading,
    error,
    refresh,
    getSession,
    deleteSession,
    optimisticTouch,
    createId,
  };
}

export default useChatHistory;
