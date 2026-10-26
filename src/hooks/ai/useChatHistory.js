"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

const PAGE_SIZE = 20;

export function useChatHistory(storeId, { enabled = true } = {}) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);

  // In-memory cache for session details so switching sessions does not re-fetch
  const sessionCacheRef = useRef(new Map());

  // Clear cache whenever storeId changes
  useEffect(() => {
    sessionCacheRef.current.clear();
  }, [storeId]);

  const refresh = useCallback(async () => {
    if (!storeId || !enabled) {
      if (!storeId) {
        setSessions([]);
        setError(null);
        setLoading(false);
        setHasMore(false);
        setTotal(0);
        setPage(1);
      }
      return [];
    }
    setLoading(true);
    setError(null);
    try {
      const result = await aiChatHistoryService.listSessions({
        storeId,
        page: 1,
        limit: PAGE_SIZE,
      });
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
        .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

      const totalCount = typeof payload.total === "number" ? payload.total : next.length;
      const moreAvailable =
        typeof payload.hasMore === "boolean"
          ? payload.hasMore
          : next.length < totalCount || rows.length >= PAGE_SIZE;

      setSessions(next);
      setTotal(totalCount);
      setHasMore(moreAvailable);
      setPage(1);
      return next;
    } catch (err) {
      setSessions([]);
      setError(err?.message || "Failed to load chat history");
      return [];
    } finally {
      setLoading(false);
    }
  }, [storeId, enabled]);

  const loadMore = useCallback(async () => {
    if (!storeId || !enabled || loading || loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await aiChatHistoryService.listSessions({
        storeId,
        page: nextPage,
        limit: PAGE_SIZE,
      });
      if (!result?.success) return;

      const payload = result.data?.data ?? result.data ?? {};
      const rows = Array.isArray(payload.sessions)
        ? payload.sessions
        : Array.isArray(payload)
          ? payload
          : [];
      const newItems = rows
        .map(normalizeSessionSummary)
        .filter(Boolean);

      setSessions((current) => {
        const existingIds = new Set(current.map((item) => item.id));
        const filteredNew = newItems.filter((item) => !existingIds.has(item.id));
        return [...current, ...filteredNew].sort(
          (a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)
        );
      });

      const totalCount = typeof payload.total === "number" ? payload.total : total;
      const moreAvailable =
        typeof payload.hasMore === "boolean"
          ? payload.hasMore
          : rows.length >= PAGE_SIZE;

      setPage(nextPage);
      setTotal(totalCount);
      setHasMore(moreAvailable);
    } catch (err) {
      console.error("Failed to load more chat sessions:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [storeId, enabled, loading, loadingMore, hasMore, page, total]);

  useEffect(() => {
    if (!enabled) return;
    void refresh();
  }, [refresh, enabled]);

  const getSession = useCallback(
    async (sessionId, { bypassCache = false } = {}) => {
      if (!storeId || !sessionId) {
        return { success: false, message: "Missing store or session" };
      }

      // Check in-memory cache first to eliminate duplicate API requests
      if (!bypassCache && sessionCacheRef.current.has(sessionId)) {
        return {
          success: true,
          session: sessionCacheRef.current.get(sessionId),
          cached: true,
        };
      }

      const result = await aiChatHistoryService.getSession({
        sessionId,
        storeId,
      });
      if (!result?.success) return result;
      const payload = result.data?.data ?? result.data ?? {};
      const sessionDetail = {
        id: String(payload.id || sessionId),
        title: String(payload.title || "New chat"),
        createdAt: toMs(payload.createdAt || payload.created_at),
        updatedAt: toMs(payload.updatedAt || payload.updated_at),
        messages: mapHistoryMessages(payload.messages),
      };

      // Store in memory cache
      sessionCacheRef.current.set(sessionId, sessionDetail);

      return {
        ...result,
        session: sessionDetail,
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
        sessionCacheRef.current.delete(sessionId);
        setSessions((current) =>
          current.filter((item) => item.id !== sessionId)
        );
        setTotal((prev) => Math.max(0, prev - 1));
      }
      return result;
    },
    [storeId]
  );

  const optimisticTouch = useCallback(({ id, title, createdAt }) => {
    if (!id) return;
    const now = Date.now();
    setSessions((current) => {
      // If the session is already known in history, don't change its historical timestamp
      const existing = current.find((item) => item.id === id);
      if (existing) {
        return current;
      }
      const entry = {
        id,
        title: title || "New chat",
        createdAt: createdAt || now,
        updatedAt: now,
      };
      const without = current.filter((item) => item.id !== id);
      return [entry, ...without]
        .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
        .slice(0, MAX_CHAT_SESSIONS * 2);
    });
  }, []);

  const grouped = useMemo(() => groupSessionsByDay(sessions), [sessions]);
  const createId = useCallback(() => generateUUID(), []);

  return {
    sessions,
    grouped,
    loading,
    loadingMore,
    hasMore,
    total,
    page,
    error,
    refresh,
    loadMore,
    getSession,
    deleteSession,
    optimisticTouch,
    createId,
  };
}

export default useChatHistory;
