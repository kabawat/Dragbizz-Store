import { isFirebaseConfigured } from "./config";

/** Dev logs by default; set NEXT_PUBLIC_FCM_DEBUG=true to log in any build. */
export const FCM_DEBUG_ENABLED =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_FCM_DEBUG === "true";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

export function isFcmSecureContext() {
  if (typeof window === "undefined") return false;
  if (window.isSecureContext) return true;
  return LOCAL_HOSTS.has(window.location.hostname);
}

/** One-shot environment snapshot for debugging FCM issues. */
export function logFcmEnvironmentDiagnostics(context = "startup") {
  if (!FCM_DEBUG_ENABLED || typeof window === "undefined") return;

  const permission =
    typeof Notification !== "undefined" ? Notification.permission : "unsupported";

  const diagnostics = {
    context,
    origin: window.location.origin,
    protocol: window.location.protocol,
    hostname: window.location.hostname,
    isSecureContext: window.isSecureContext,
    fcmSecureOk: isFcmSecureContext(),
    serviceWorkerSupported: "serviceWorker" in navigator,
    notificationPermission: permission,
    firebaseConfigured: isFirebaseConfigured(),
  };

  fcmDebug("environment", diagnostics);

  if (!diagnostics.fcmSecureOk) {
    fcmDebugWarn(
      "Service worker / FCM need HTTPS or localhost. http://dragbizz.local blocks SW registration — use https:// or http://localhost."
    );
  }

  if (permission === "denied") {
    fcmDebugWarn(
      "Browser notifications are blocked (permission: denied). save-token cannot run. Fix: address bar lock icon → Site settings → Notifications → Allow, then reload."
    );
  }

  if (permission === "default" && diagnostics.firebaseConfigured) {
    fcmDebug(
      "permission is default — enable push in Settings or allow the browser prompt when sync runs."
    );
  }
}

export function fcmDebug(label, data) {
  if (!FCM_DEBUG_ENABLED) return;
  if (data === undefined) {
    console.log("[FCM]", label);
    return;
  }
  console.log("[FCM]", label, data);
}

export function fcmDebugWarn(label, data) {
  if (!FCM_DEBUG_ENABLED) return;
  if (data === undefined) {
    console.warn("[FCM]", label);
    return;
  }
  console.warn("[FCM]", label, data);
}

/** Log token without exposing full value in console. */
export function fcmDebugToken(label, token) {
  if (!FCM_DEBUG_ENABLED) return;
  if (!token) {
    console.log("[FCM]", label, { token: null });
    return;
  }
  console.log("[FCM]", label, {
    preview: `${token.slice(0, 12)}...${token.slice(-8)}`,
    length: token.length,
  });
}
