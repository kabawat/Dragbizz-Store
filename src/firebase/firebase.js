import { getApps, initializeApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

import { getFirebaseConfig } from "./config";

function getOrCreateApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }
  return initializeApp(getFirebaseConfig());
}

/** Firebase app (browser only). */
export function getFirebaseApp() {
  if (typeof window === "undefined") {
    return null;
  }
  return getOrCreateApp();
}

let messagingInstance = null;

/** FCM messaging instance (browser only, after support check). */
export async function getFirebaseMessaging() {
  if (typeof window === "undefined") {
    return null;
  }

  const supported = await isSupported();
  if (!supported) {
    return null;
  }

  if (!messagingInstance) {
    messagingInstance = getMessaging(getOrCreateApp());
  }

  return messagingInstance;
}
