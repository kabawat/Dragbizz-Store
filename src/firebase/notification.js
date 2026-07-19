import { getToken, onMessage } from "firebase/messaging";

import { getFirebaseVapidKey, isFirebaseConfigured } from "./config";
import {
  fcmDebug,
  fcmDebugToken,
  fcmDebugWarn,
  logFcmEnvironmentDiagnostics,
} from "./fcmDebug";
import { getFcmDeviceInfo } from "./deviceInfo";
import { getFirebaseMessaging } from "./firebase";
import fcmService from "@/service/utility/fcm.service";
import { getFcmServiceWorkerRegistration } from "./serviceWorker";
import logger from "@/utils/logger";

/** Current browser notification permission. */
export function getNotificationPermissionState() {
  if (typeof window === "undefined" || typeof Notification === "undefined") {
    return "unsupported";
  }
  return Notification.permission;
}

/** Request browser permission only (no token). */
export async function requestBrowserNotificationPermission() {
  if (typeof window === "undefined" || typeof Notification === "undefined") {
    return "unsupported";
  }
  return Notification.requestPermission();
}

/** FCM device token using registered service worker. */
export async function getFcmDeviceToken() {
  fcmDebug("getFcmDeviceToken: start");
  const messaging = await getFirebaseMessaging();
  if (!messaging) {
    fcmDebugWarn("getFcmDeviceToken: messaging unavailable");
    return null;
  }

  const serviceWorkerRegistration = await getFcmServiceWorkerRegistration();
  if (!serviceWorkerRegistration) {
    fcmDebugWarn("getFcmDeviceToken: service worker not registered");
    return null;
  }

  const token = await getToken(messaging, {
    vapidKey: getFirebaseVapidKey(),
    serviceWorkerRegistration,
  });
  fcmDebugToken("getFcmDeviceToken: result", token);
  return token;
}

/** Persist token to utility API (auth cookie via authAxios). */
export async function saveFcmTokenToServer(token, options = {}) {
  return fcmService.saveToken(token, options);
}

/** Remove token from utility when push is disabled. */
export async function deleteFcmTokenFromServer(deviceId = "default") {
  return fcmService.deleteToken(deviceId);
}

/**
 * Full push enable flow: permission → FCM token → save to utility.
 * @returns {{ success: boolean, permission: string, token?: string, message?: string }}
 */
export async function registerPushNotifications() {
  fcmDebug("registerPushNotifications: start");
  if (!isFirebaseConfigured()) {
    fcmDebugWarn("registerPushNotifications: Firebase not configured");
    return {
      success: false,
      permission: "unsupported",
      message: "Firebase is not configured",
    };
  }

  const permission = await requestBrowserNotificationPermission();
  fcmDebug("registerPushNotifications: permission", { permission });

  if (permission !== "granted") {
    return { success: false, permission, message: getPermissionMessageKey(permission) };
  }

  try {
    const token = await getFcmDeviceToken();
    if (!token) {
      fcmDebugWarn("registerPushNotifications: no FCM token");
      return {
        success: false,
        permission,
        message: "fcmTokenUnavailable",
      };
    }

    const saveResult = await saveFcmTokenToServer(token);
    fcmDebug("registerPushNotifications: save-token response", {
      success: saveResult?.success,
      message: saveResult?.message,
    });
    if (!saveResult?.success) {
      return {
        success: false,
        permission,
        message: saveResult?.message || "fcmSaveFailed",
      };
    }

    fcmDebug("registerPushNotifications: done", { success: true });
    return { success: true, permission, token };
  } catch (error) {
    logger.error("[FCM] registerPushNotifications failed", error);
    return {
      success: false,
      permission,
      message: "fcmRegisterFailed",
    };
  }
}

/** Disable push — remove server token. */
export async function unregisterPushNotifications() {
  const result = await deleteFcmTokenFromServer();
  return { success: result?.success !== false, message: result?.message };
}

let refreshFcmSyncPromise = null;

/**
 * After /auth/refresh: register SW, save token if permission granted,
 * or prompt + save when push is enabled in notification settings.
 */
export async function syncFcmTokenAfterAuthRefresh() {
  fcmDebug("syncFcmTokenAfterAuthRefresh: start (after /auth/refresh)");
  logFcmEnvironmentDiagnostics("after /auth/refresh");
  if (!isFirebaseConfigured()) {
    fcmDebugWarn("syncFcmTokenAfterAuthRefresh: Firebase not configured");
    return { success: false, permission: "unsupported" };
  }

  if (refreshFcmSyncPromise) {
    fcmDebug("syncFcmTokenAfterAuthRefresh: reusing in-flight sync");
    return refreshFcmSyncPromise;
  }

  refreshFcmSyncPromise = navigator.locks ? navigator.locks.request("fcm-sync", { ifAvailable: true }, async (lock) => {
    if (!lock) {
      fcmDebug("syncFcmTokenAfterAuthRefresh: skipped — another tab is syncing");
      return { success: true, message: "Skipped: another tab is syncing" };
    }
    
    await getFcmServiceWorkerRegistration();

    const permission = getNotificationPermissionState();
    fcmDebug("syncFcmTokenAfterAuthRefresh: permission", { permission });

    if (permission === "granted") {
      try {
        const token = await getFcmDeviceToken();
        if (!token) {
          fcmDebugWarn("syncFcmTokenAfterAuthRefresh: granted but no token");
          return { success: false, permission, message: "fcmTokenUnavailable" };
        }
        const saveResult = await saveFcmTokenToServer(token);
        fcmDebug("syncFcmTokenAfterAuthRefresh: save-token", {
          success: saveResult?.success,
          message: saveResult?.message,
        });
        return {
          success: saveResult?.success === true,
          permission,
          message: saveResult?.message,
        };
      } catch (error) {
        logger.error("[FCM] sync after auth refresh failed", error);
        return { success: false, permission, message: "fcmRegisterFailed" };
      }
    }

    if (permission === "default") {
      const { default: authService } = await import("@/service/auth/auth.service");
      const settingsResult = await authService.getNotificationSettings();
      const pushEnabled =
        settingsResult?.success === true &&
        settingsResult.data?.channels?.push !== false;

      fcmDebug("syncFcmTokenAfterAuthRefresh: notification settings", {
        settingsOk: settingsResult?.success,
        pushEnabled,
      });

      if (pushEnabled) {
        fcmDebug("syncFcmTokenAfterAuthRefresh: prompting registerPushNotifications");
        return registerPushNotifications();
      }
    }

    if (permission === "denied") {
      fcmDebugWarn(
        "syncFcmTokenAfterAuthRefresh: skipped — unblock notifications in browser site settings, then reload"
      );
    } else {
      fcmDebug("syncFcmTokenAfterAuthRefresh: skipped", { permission });
    }
    return { success: false, permission };
  }) : (async () => {
    // Fallback if navigator.locks is not supported
    await getFcmServiceWorkerRegistration();

    const permission = getNotificationPermissionState();
    fcmDebug("syncFcmTokenAfterAuthRefresh: permission", { permission });

    if (permission === "granted") {
      try {
        const token = await getFcmDeviceToken();
        if (!token) {
          fcmDebugWarn("syncFcmTokenAfterAuthRefresh: granted but no token");
          return { success: false, permission, message: "fcmTokenUnavailable" };
        }
        const saveResult = await saveFcmTokenToServer(token);
        fcmDebug("syncFcmTokenAfterAuthRefresh: save-token", {
          success: saveResult?.success,
          message: saveResult?.message,
        });
        return {
          success: saveResult?.success === true,
          permission,
          message: saveResult?.message,
        };
      } catch (error) {
        logger.error("[FCM] sync after auth refresh failed", error);
        return { success: false, permission, message: "fcmRegisterFailed" };
      }
    }

    if (permission === "default") {
      const { default: authService } = await import("@/service/auth/auth.service");
      const settingsResult = await authService.getNotificationSettings();
      const pushEnabled =
        settingsResult?.success === true &&
        settingsResult.data?.channels?.push !== false;

      fcmDebug("syncFcmTokenAfterAuthRefresh: notification settings", {
        settingsOk: settingsResult?.success,
        pushEnabled,
      });

      if (pushEnabled) {
        fcmDebug("syncFcmTokenAfterAuthRefresh: prompting registerPushNotifications");
        return registerPushNotifications();
      }
    }

    if (permission === "denied") {
      fcmDebugWarn(
        "syncFcmTokenAfterAuthRefresh: skipped — unblock notifications in browser site settings, then reload"
      );
    } else {
      fcmDebug("syncFcmTokenAfterAuthRefresh: skipped", { permission });
    }
    return { success: false, permission };
  })();

  try {
    const result = await refreshFcmSyncPromise;
    fcmDebug("syncFcmTokenAfterAuthRefresh: done", result);
    return result;
  } finally {
    refreshFcmSyncPromise = null;
  }
}

/** i18n key for permission UI (4.7). */
export function getPermissionMessageKey(permission) {
  if (permission === "denied") return "pushPermissionDenied";
  if (permission === "default") return "pushPermissionDefault";
  if (permission === "unsupported") return "pushNotSupported";
  return "pushEnableFailed";
}

let foregroundListenerAttached = false;

/**
 * Foreground FCM handler — attach once. Requires onPayload (in-app UI);
 * does not use native Notification when the tab is focused.
 */
export async function setupForegroundFcmListener(onPayload) {
  if (!onPayload) {
    console.warn("[FCM] setupForegroundFcmListener requires onPayload handler");
    return;
  }

  if (!isFirebaseConfigured()) {
    fcmDebugWarn("setupForegroundFcmListener: Firebase not configured");
    return;
  }

  const messaging = await getFirebaseMessaging();
  if (!messaging || foregroundListenerAttached) {
    return;
  }

  foregroundListenerAttached = true;

  onMessage(messaging, (payload) => {
    onPayload(payload);
  });
}

/** @deprecated Use registerPushNotifications */
export const requestNotificationPermission = registerPushNotifications;
