/**
 * Firebase web config from NEXT_PUBLIC_* env vars (inlined at build time).
 */
export function getFirebaseConfig() {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const missing = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing Firebase env: ${missing.join(", ")}. See env.example / .env.local.`
    );
  }

  return config;
}

export function getFirebaseVapidKey() {
  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    throw new Error("Missing NEXT_PUBLIC_FIREBASE_VAPID_KEY");
  }
  return vapidKey;
}

export function isFirebaseConfigured() {
  try {
    getFirebaseConfig();
    getFirebaseVapidKey();
    return true;
  } catch {
    return false;
  }
}
