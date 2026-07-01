const STORAGE_PREFIX = "dragbizz:payment-display:";
const CHANNEL_PREFIX = "dragbizz-payment-display:";
const STALE_MS = 60 * 60 * 1000;

export function buildSessionScope({ tenantId, storeId, userId }) {
  if (!tenantId || !storeId || !userId) return null;
  const suffix = `${tenantId}:${storeId}:${userId}`;
  return {
    tenantId,
    storeId,
    userId,
    storageKey: `${STORAGE_PREFIX}${suffix}`,
    channelName: `${CHANNEL_PREFIX}${suffix}`,
  };
}

export function isSessionTrusted(session, scope) {
  if (!session || !scope) return false;
  return (
    session.tenantId === scope.tenantId &&
    session.storeId === scope.storeId &&
    session.userId === scope.userId
  );
}

export function isSessionStale(session) {
  if (!session?.updatedAt) return true;
  return Date.now() - session.updatedAt > STALE_MS;
}

function parseSession(raw) {
  if (!raw) return null;
  try {
    const session = JSON.parse(raw);
    if (isSessionStale(session)) return null;
    return session;
  } catch {
    return null;
  }
}

function postChannelMessage(scope, session) {
  if (typeof window === "undefined" || !scope?.channelName) return;
  try {
    const channel = new BroadcastChannel(scope.channelName);
    channel.postMessage({ scope, session });
    channel.close();
  } catch {
    // BroadcastChannel unavailable
  }
}

export function readPaymentDisplaySession(scope) {
  if (typeof window === "undefined" || !scope?.storageKey) return null;
  const session = parseSession(localStorage.getItem(scope.storageKey));
  if (!session || !isSessionTrusted(session, scope)) return null;
  return session;
}

export function writePaymentDisplaySession(scope, session) {
  if (typeof window === "undefined" || !scope?.storageKey || !session) return;
  const payload = { ...session, updatedAt: Date.now() };
  localStorage.setItem(scope.storageKey, JSON.stringify(payload));
  postChannelMessage(scope, payload);
}

export function clearPaymentDisplaySession(scope) {
  if (typeof window === "undefined" || !scope?.storageKey) return;
  localStorage.removeItem(scope.storageKey);
  postChannelMessage(scope, null);
}

export function clearAllPaymentDisplaySessions() {
  if (typeof window === "undefined") return;
  const keys = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key?.startsWith(STORAGE_PREFIX)) keys.push(key);
  }
  keys.forEach((key) => localStorage.removeItem(key));
}

export function createAwaitingSession({
  scope,
  sessionId,
  invoiceId,
  invoiceNumber,
  amount,
  paidAmount,
  paymentMethod,
  defaultUpi,
  storeName,
  customerName,
  onlineAttemptAt,
}) {
  return {
    tenantId: scope.tenantId,
    storeId: scope.storeId,
    userId: scope.userId,
    sessionId,
    invoiceId,
    invoiceNumber,
    amount,
    paidAmount,
    paymentMethod,
    status: "awaiting",
    defaultUpi,
    storeName,
    customerName,
    ...(onlineAttemptAt ? { onlineAttemptAt } : {}),
    updatedAt: Date.now(),
  };
}
