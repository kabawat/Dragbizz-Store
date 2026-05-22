import { fcmDebug, fcmDebugWarn, isFcmSecureContext } from "./fcmDebug";

// FCM service worker path
export const FCM_SERVICE_WORKER_PATH = "/firebase-messaging-sw.js";
export const FCM_SERVICE_WORKER_SCOPE = "/";

let registrationPromise = null;

export function getFcmServiceWorkerScriptUrl() {
  if (typeof window === "undefined") {
    return FCM_SERVICE_WORKER_PATH;
  }
  return `${window.location.origin}${FCM_SERVICE_WORKER_PATH}`;
}

function waitForServiceWorkerActivation(registration) {
  const worker = registration.installing || registration.waiting;
  if (!worker) {
    return Promise.resolve(registration);
  }

  if (registration.active) {
    return Promise.resolve(registration);
  }

  return new Promise((resolve) => {
    worker.addEventListener("statechange", function handleStateChange() {
      if (worker.state === "activated" || worker.state === "redundant") {
        worker.removeEventListener("statechange", handleStateChange);
        resolve(registration);
      }
    });
  });
}

/** Register firebase-messaging-sw.js at root scope. */
export async function registerFcmServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    fcmDebugWarn("serviceWorker: not supported in this browser");
    return null;
  }

  if (!isFcmSecureContext()) {
    fcmDebugWarn("serviceWorker: skipped — not a secure context (need HTTPS or localhost)");
    return null;
  }

  if (!registrationPromise) {
    registrationPromise = (async () => {
      const existing = await navigator.serviceWorker.getRegistration(
        FCM_SERVICE_WORKER_SCOPE
      );

      if (existing?.active?.scriptURL?.includes("firebase-messaging-sw")) {
        fcmDebug("serviceWorker: reusing existing registration", {
          scriptURL: existing.active.scriptURL,
        });
        return existing;
      }

      fcmDebug("serviceWorker: registering", { path: FCM_SERVICE_WORKER_PATH });
      return navigator.serviceWorker.register(FCM_SERVICE_WORKER_PATH, {
        scope: FCM_SERVICE_WORKER_SCOPE,
      });
    })();
  }

  try {
    const registration = await registrationPromise;
    const active = await waitForServiceWorkerActivation(registration);
    fcmDebug("serviceWorker: ready", {
      scope: active?.scope,
      state: active?.active?.state,
    });
    return active;
  } catch (error) {
    registrationPromise = null;
    fcmDebugWarn("serviceWorker: registration failed", error?.message ?? error);
    throw error;
  }
}

/** Active registration for getToken({ serviceWorkerRegistration }). */
export async function getFcmServiceWorkerRegistration() {
  return registerFcmServiceWorker();
}

export function clearFcmServiceWorkerRegistrationCache() {
  registrationPromise = null;
}
