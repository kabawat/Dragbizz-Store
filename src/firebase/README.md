# Firebase Cloud Messaging (FCM) Setup & Architecture

This document explains the end-to-end flow of Firebase Cloud Messaging (Push Notifications) in the Dragbizz Store Frontend and Utility backend.

## 1. Prerequisites (Developer Setup)

To test or develop FCM features locally, you need:
1. **HTTPS or Localhost:** Service workers and Push APIs strictly require a secure context. Use `http://localhost:3000` or an HTTPS proxy. Custom local domains like `http://dragbizz.local` will **block** FCM.
2. **Environment Variables:**
   Create `.env.local` in `FE/dragbizz-store-fe` and populate it with your Firebase project config:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY="..."
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
   NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="..."
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
   NEXT_PUBLIC_FIREBASE_APP_ID="..."
   NEXT_PUBLIC_FIREBASE_VAPID_KEY="..."
   ```
3. **Backend `.env`:** The `dragbizz-utility` backend requires `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` for sending messages.

## 2. Architecture & Flow

### A. Initialization & Service Worker
- The service worker (`firebase-messaging-sw.js`) handles background notifications when the app is closed or tab is hidden.
- Since standard SW cannot read Next.js environment variables at runtime, we use a build script (`scripts/generate-firebase-sw.cjs`) that injects `.env.local` keys into `public/firebase-messaging-sw.js`.
- Run `npm run predev` or `npm run dev` to auto-generate the service worker script.

### B. User Authentication & Token Registration
1. User logs in. `syncFcmTokenAfterAuthRefresh` (in `notification.js`) is triggered.
2. We check `Notification.permission`. If granted, we request a device token using `getToken`.
3. If not granted, but the user has enabled Push in their Notification Settings, we prompt them.
4. The token is sent to the backend (`/utility/v1/fcm/save-token`) alongside device metadata.
5. **Deduplication:** A `navigator.locks.request` prevents multiple open tabs from concurrently making the same token save request during auth refresh.

### C. Receiving Notifications
- **Background:** Handled entirely by the Service Worker (`onBackgroundMessage`). It receives the payload and shows a native OS notification. Clicking it focuses an existing tab or opens a new one.
- **Foreground:** If a tab is visible, `setupForegroundFcmListener` intercepts the message via `onMessage`. It is dispatched to `useIncomingNotification` which:
  - Adds the notification to the Redux store (`notificationsSlice`).
  - Displays an in-app Toast (`SocketNotification`) ONLY if the tab is currently visible (preventing multiple toasts if you have many tabs open).

### D. Logout & Cleanup
When the user logs out, the frontend explicitly calls `DELETE /utility/v1/fcm/token` to wipe the FCM token from the server, preventing background pushes to an unauthenticated device.

## 3. Debugging & Logs
- We have extensive client-side logging inside `fcmDebug.js`.
- If an FCM registration fails, or a token cannot be saved, it is logged to `logger.error` which can be sent to a centralized monitoring system.
- Common issues:
  - `messaging/unsupported-browser`: You are using a browser that lacks push support or you are not on a secure context.
  - `messaging/permission-blocked`: The user denied push notifications. They must manually unblock it via browser settings.

## 4. Scripts
- `npm run prebuild` / `npm run predev`: Generates the `public/firebase-messaging-sw.js` file.
