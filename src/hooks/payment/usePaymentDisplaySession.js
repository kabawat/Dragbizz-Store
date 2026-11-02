"use client";

import { useCallback, useEffect, useState } from "react";
import {
  isSessionTrusted,
  readPaymentDisplaySession,
} from "@/utils/payment/paymentDisplaySession";
import usePaymentDisplayScope from "@/hooks/payment/usePaymentDisplayScope";

export function usePaymentDisplaySession() {
  const { scope, ready } = usePaymentDisplayScope();
  const [session, setSession] = useState(null);

  const syncFromStorage = useCallback(() => {
    if (!scope) {
      setSession(null);
      return;
    }
    const next = readPaymentDisplaySession(scope);
    setSession(next);
  }, [scope]);

  useEffect(() => {
    syncFromStorage();
  }, [syncFromStorage]);

  useEffect(() => {
    if (!scope?.storageKey || !scope?.channelName) return undefined;

    const onStorage = (event) => {
      if (event.key !== scope.storageKey) return;
      syncFromStorage();
    };

    let channel;
    try {
      channel = new BroadcastChannel(scope.channelName);
      channel.onmessage = (event) => {
        const payload = event.data?.session;
        if (payload && !isSessionTrusted(payload, scope)) return;
        setSession(payload ?? null);
      };
    } catch {
      channel = null;
    }

    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      channel?.close();
    };
  }, [scope, syncFromStorage]);

  return { session, scope, ready };
}

export default usePaymentDisplaySession;
