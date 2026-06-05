"use client";

import { useEffect, useRef } from "react";
import { mapFcmPayloadToNotification } from "@/firebase/fcmPayload";
import { setupForegroundFcmListener } from "@/firebase/notification";
import { useIncomingNotification } from "@/hooks/notifications/useIncomingNotification";
import { useAppSelector } from "@/store/hooks";

/**
 * Wires FCM onMessage → Redux notifications + SocketNotification UI (tab focused).
 * Rendered inside SocketNotificationProvider (see layout.jsx).
 */
export default function FcmForegroundBridge() {
  const { isAuthenticated } = useAppSelector((state) => state.profile);
  const pushEnabled = useAppSelector(
    (state) => state.notificationSettings?.settings?.channels?.push
  );
  const { handleIncomingNotification } = useIncomingNotification();
  const listenerReadyRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || pushEnabled === false) {
      return;
    }

    if (listenerReadyRef.current) {
      return;
    }

    listenerReadyRef.current = true;

    setupForegroundFcmListener((payload) => {
      const incoming = mapFcmPayloadToNotification(payload);
      handleIncomingNotification(incoming);
    }).catch((error) => {
      console.error("[FCM] Foreground listener setup failed", error);
      listenerReadyRef.current = false;
    });
  }, [isAuthenticated, pushEnabled, handleIncomingNotification]);

  return null;
}
