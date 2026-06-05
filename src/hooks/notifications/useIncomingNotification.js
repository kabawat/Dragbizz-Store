"use client";

import { useCallback } from "react";
import { useSocketNotification } from "@/contexts/SocketNotificationContext";
import { useAppDispatch } from "@/store/hooks";
import { addNotification } from "@/store/slices/notificationsSlice";

/**
 * Shared handler for socket + FCM realtime notifications (Redux bell + toast UI).
 */
export function useIncomingNotification() {
  const dispatch = useAppDispatch();
  const { showNotification } = useSocketNotification();

  const handleIncomingNotification = useCallback(
    (incoming) => {
      if (!incoming?.message) {
        return;
      }

      const payload = {
        message: incoming.message,
        type: incoming.type || "SYSTEM",
        data: incoming.data || incoming,
      };

      const id = incoming.id || incoming.messageId || incoming.data?.messageId || Date.now();

      dispatch(
        addNotification({
          id,
          message: payload.message,
          type: payload.type,
          data: payload.data,
        })
      );

      // Only show toast if the tab is visible to prevent duplicate sounds/toasts in multi-tab
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        showNotification({
          id,
          message: payload.message,
          type: payload.type,
          ...(payload.data && typeof payload.data === "object" ? payload.data : {}),
        });
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("app:notification"));
      }

      return payload;
    },
    [dispatch, showNotification]
  );

  return { handleIncomingNotification };
}
