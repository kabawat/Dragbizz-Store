import { getToken, onMessage } from "firebase/messaging";

import { getFirebaseVapidKey, isFirebaseConfigured } from "./config";
import {
  fcmDebug,
  fcmDebugToken,
  fcmDebugWarn,
} from "./fcmDebug";
import { getFirebaseMessaging } from "./firebase";
import fcmService, { getStoredFcmDeviceId } from "@/service/utility/fcm.service";
import { getFcmServiceWorkerRegistration } from "./serviceWorker";
import logger from "@/utils/logger";

export function getPushPermission() {
  if (typeof window === "undefined" || typeof Notification === "undefined") {
    return "unsupported";
  }
  return Notification.permission;
}

async function askPushPermission() {
  if (typeof window === "undefined" || typeof Notification === "undefined") {
    return "unsupported";
  }
  return Notification.requestPermission();
}

async function getPushToken() {
  fcmDebug("getPushToken: start");
  const messaging = await getFirebaseMessaging();
  if (!messaging) {
    fcmDebugWarn("getPushToken: messaging unavailable");
    return null;
  }

  const serviceWorkerRegistration = await getFcmServiceWorkerRegistration();
  if (!serviceWorkerRegistration) {
    fcmDebugWarn("getPushToken: service worker not registered");
    return null;
  }

  const token = await getToken(messaging, {
    vapidKey: getFirebaseVapidKey(),
    serviceWorkerRegistration,
  });
  fcmDebugToken("getPushToken: result", token);
  return token;
}

const FCM_PROMPTED_KEY = "dragbizz.fcm.prompted";
let saveDevicePromise = null;

export async function saveDevice() {
  const existingDeviceId = getStoredFcmDeviceId();
  if (existingDeviceId) {
    return { success: true, reused: true, deviceId: existingDeviceId };
  }

  if (
    typeof window !== "undefined" &&
    typeof Notification !== "undefined" &&
    Notification.permission === "default" &&
    window.localStorage.getItem(FCM_PROMPTED_KEY) === "1"
  ) {
    return { success: false, permission: "default" };
  }

  if (!saveDevicePromise) {
    if (typeof window !== "undefined" && typeof Notification !== "undefined" && Notification.permission === "default") {
      window.localStorage.setItem(FCM_PROMPTED_KEY, "1");
    }
    saveDevicePromise = enablePush().finally(() => {
      saveDevicePromise = null;
    });
  }
  return saveDevicePromise;
}

export async function enablePush() {
  fcmDebug("enablePush: start");
  if (!isFirebaseConfigured()) {
    fcmDebugWarn("enablePush: Firebase not configured");
    return {
      success: false,
      permission: "unsupported",
      message: "Firebase is not configured",
    };
  }

  const permission = await askPushPermission();
  fcmDebug("enablePush: permission", { permission });

  if (permission !== "granted") {
    return { success: false, permission, message: pushMessageKey(permission) };
  }

  try {
    const token = await getPushToken();
    if (!token) {
      fcmDebugWarn("enablePush: no FCM token");
      return {
        success: false,
        permission,
        message: "fcmTokenUnavailable",
      };
    }

    const registered = await fcmService.registerDevice(token);
    fcmDebug("enablePush: device response", {
      success: registered?.success,
      deviceId: registered?.data?.deviceId,
    });
    if (!registered?.success || !registered?.data?.deviceId) {
      return {
        success: false,
        permission,
        message: registered?.message || "fcmSaveFailed",
      };
    }

    fcmDebug("enablePush: done", { success: true, deviceId: registered.data.deviceId });
    return { success: true, permission, token, deviceId: registered.data.deviceId };
  } catch (error) {
    logger.error("[FCM] enablePush failed", error);
    return {
      success: false,
      permission,
      message: "fcmRegisterFailed",
    };
  }
}

export async function disablePush() {
  const deviceId = getStoredFcmDeviceId() || "default";
  const result = await fcmService.deleteToken(deviceId);
  return { success: result?.success !== false, message: result?.message };
}

export function pushMessageKey(permission) {
  if (permission === "denied") return "pushPermissionDenied";
  if (permission === "default") return "pushPermissionDefault";
  if (permission === "unsupported") return "pushNotSupported";
  return "pushEnableFailed";
}

let foregroundListenerAttached = false;

export async function onForegroundPush(onPayload) {
  if (!onPayload) {
    console.warn("[FCM] onForegroundPush requires onPayload handler");
    return;
  }

  if (!isFirebaseConfigured()) {
    fcmDebugWarn("onForegroundPush: Firebase not configured");
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
