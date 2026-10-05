"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { generateUUID } from "@/utils/uuid.util";

const STORAGE_PREFIX = "dragbizz_ai_chat_history_v1:";
const MAX_SESSIONS = 40;

function storageKey(storeId) {
  return `${STORAGE_PREFIX}${storeId}`;
}

function readSessions(storeId) {
  if (!storeId || typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey(storeId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSessions(storeId, sessions) {
  if (!storeId || typeof window === "undefined") return;
  try {
    localStorage.setItem(storageKey(storeId), JSON.stringify(sessions));
  } catch {
    // Quota / private mode — ignore.
  }
}

function titleFromMessages(messages) {
  const firstUser = (messages || []).find(
    (item) => item?.role === "user" && typeof item.content === "string"
  );
  const text = (firstUser?.content || "").trim().replace(/\s+/g, " ");
  if (!text) return "New chat";
  return text.length > 42 ? `${text.slice(0, 42)}…` : text;
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * Local multi-thread chat history per store (until server sessions exist).
 */
export function useChatHistory(storeId) {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    setSessions(readSessions(storeId));
  }, [storeId]);

  const upsertSession = useCallback(
    ({ id, messages, createdAt }) => {
      if (!storeId || !id || !Array.isArray(messages) || messages.length === 0) {
        return;
      }
      const now = Date.now();
      const entry = {
        id,
        title: titleFromMessages(messages),
        messages,
        createdAt: createdAt || now,
        updatedAt: now,
      };
      setSessions((current) => {
        const without = current.filter((item) => item.id !== id);
        const next = [entry, ...without]
          .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
          .slice(0, MAX_SESSIONS);
        writeSessions(storeId, next);
        return next;
      });
    },
    [storeId]
  );

  const removeSession = useCallback(
    (id) => {
      setSessions((current) => {
        const next = current.filter((item) => item.id !== id);
        writeSessions(storeId, next);
        return next;
      });
    },
    [storeId]
  );

  const grouped = useMemo(() => {
    const today = startOfDay(Date.now());
    const yesterday = today - 24 * 60 * 60 * 1000;
    const week = today - 6 * 24 * 60 * 60 * 1000;
    const buckets = {
      today: [],
      yesterday: [],
      week: [],
      older: [],
    };
    for (const session of sessions) {
      const ts = startOfDay(session.updatedAt || session.createdAt || 0);
      if (ts >= today) buckets.today.push(session);
      else if (ts >= yesterday) buckets.yesterday.push(session);
      else if (ts >= week) buckets.week.push(session);
      else buckets.older.push(session);
    }
    return buckets;
  }, [sessions]);

  const createId = useCallback(() => generateUUID(), []);

  return {
    sessions,
    grouped,
    upsertSession,
    removeSession,
    createId,
  };
}

export default useChatHistory;
