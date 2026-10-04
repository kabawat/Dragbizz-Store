"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { isFirebaseConfigured } from "@/firebase/config";
import { fcmDebug, fcmDebugWarn, logFcmEnvironmentDiagnostics } from "@/firebase/fcmDebug";
import { enablePush, saveDevice } from "@/firebase/notification";
import { registerFcmServiceWorker } from "@/firebase/serviceWorker";
import { getNotificationSettings } from "@/store/slices/notificationSettingsSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const FcmContext = createContext({
  registration: null,
  isRegistered: false,
  permission: "default",
  registerFcm: async () => null,
  syncPushToken: async () => ({ success: false }),
});

export function FcmProvider({ children }) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, authProfile } = useAppSelector((state) => state.profile);
  const notificationSettings = useAppSelector(
    (state) => state.notificationSettings?.settings
  );
  const pushEnabled = notificationSettings?.channels?.push;

  const [registration, setRegistration] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [permission, setPermission] = useState("default");
  const hasSyncedTokenRef = useRef(false);
  const hasLoggedEnvRef = useRef(false);
  const swRegisterAttemptedRef = useRef(false);
  const registrationRef = useRef(null);

  const registerFcm = useCallback(async () => {
    if (!isFirebaseConfigured()) {
      fcmDebugWarn("FcmContext: Firebase not configured");
      return null;
    }

    if (swRegisterAttemptedRef.current && registrationRef.current) {
      return registrationRef.current;
    }
    if (swRegisterAttemptedRef.current) {
      return null;
    }
    swRegisterAttemptedRef.current = true;

    try {
      fcmDebug("FcmContext: registering service worker");
      const reg = await registerFcmServiceWorker();
      registrationRef.current = reg;
      setRegistration(reg);
      setIsRegistered(!!reg);
      fcmDebug("FcmContext: service worker", { registered: !!reg, scope: reg?.scope });
      return reg;
    } catch (error) {
      fcmDebugWarn("FcmContext: service worker registration failed", {
        message: error?.message,
        name: error?.name,
      });
      console.error("[FCM] Service worker registration failed", error);
      swRegisterAttemptedRef.current = false;
      registrationRef.current = null;
      setRegistration(null);
      setIsRegistered(false);
      return null;
    }
  }, []);

  const syncPushToken = useCallback(async () => {
    if (typeof Notification !== "undefined") {
      setPermission(Notification.permission);
    }

    if (
      typeof Notification === "undefined" ||
      Notification.permission !== "granted"
    ) {
      return { success: false, permission: Notification?.permission ?? "unsupported" };
    }

    const result = await enablePush();
    if (typeof Notification !== "undefined") {
      setPermission(Notification.permission);
    }
    return result;
  }, []);

  useEffect(() => {
    if (typeof Notification !== "undefined") {
      setPermission(Notification.permission);
    }
    saveDevice()
      .then((result) => {
        if (result?.permission) setPermission(result.permission);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      fcmDebug("FcmContext: logged out — reset SW state");
      setRegistration(null);
      setIsRegistered(false);
      hasSyncedTokenRef.current = false;
      hasLoggedEnvRef.current = false;
      swRegisterAttemptedRef.current = false;
      registrationRef.current = null;
      return;
    }

    if (!hasLoggedEnvRef.current) {
      hasLoggedEnvRef.current = true;
      logFcmEnvironmentDiagnostics("FcmContext authenticated");
    }

    fcmDebug("FcmContext: authenticated", {
      userId: authProfile?.id ?? authProfile?._id,
      pushEnabled,
      permission: typeof Notification !== "undefined" ? Notification.permission : "n/a",
    });

    if (!notificationSettings) {
      dispatch(getNotificationSettings());
    }

    if (typeof Notification !== "undefined" && Notification.permission === "denied") {
      fcmDebugWarn(
        "FcmContext: push ON in app settings but browser permission is denied — unblock notifications for this site"
      );
      return;
    }

    registerFcm();
  }, [isAuthenticated, registerFcm, notificationSettings, dispatch, authProfile, pushEnabled]);

  // After profile load: silently sync token if already granted + push enabled
  useEffect(() => {
    if (!isAuthenticated || !authProfile || hasSyncedTokenRef.current) {
      return;
    }

    if (pushEnabled === false) {
      fcmDebug("FcmContext: silent sync skipped (push disabled in settings)");
      return;
    }

    if (typeof Notification === "undefined" || Notification.permission !== "granted") {
      fcmDebug("FcmContext: silent sync skipped (permission not granted)", {
        permission: Notification?.permission,
      });
      return;
    }

    fcmDebug("FcmContext: silent syncPushToken after profile");
    hasSyncedTokenRef.current = true;
    syncPushToken()
      .then((result) => fcmDebug("FcmContext: silent sync result", result))
      .catch((err) => {
        fcmDebugWarn("FcmContext: silent sync failed", err?.message ?? err);
        hasSyncedTokenRef.current = false;
      });
  }, [isAuthenticated, authProfile, pushEnabled, syncPushToken]);

  return (
    <FcmContext.Provider
      value={{
        registration,
        isRegistered,
        permission,
        registerFcm,
        syncPushToken,
      }}
    >
      {children}
    </FcmContext.Provider>
  );
}

export function useFcmContext() {
  const context = useContext(FcmContext);
  if (!context) {
    throw new Error("useFcmContext must be used within FcmProvider");
  }
  return context;
}
