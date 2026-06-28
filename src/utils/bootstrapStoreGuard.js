import { isValidStoreId } from "@/utils/store.util";

let pendingSuppressStoreIdToast = false;

const STORE_SCOPED_URL =
  /\/(customer|supplier|product|category|stock|invoices|expense|analytics|sales-order|purchase-order|supplier-account|sync|conflict|suggestion)/;

export function urlNeedsStoreParam(url = "") {
  const path = String(url);
  return STORE_SCOPED_URL.test(path) || path.includes("/upi");
}

export function getConfigStoreParam(config) {
  if (!config) return null;

  if (config.params?.store != null) {
    return config.params.store;
  }

  const data = config.data;
  if (!data) return null;
  if (typeof data === "object") return data.store ?? null;
  if (typeof data === "string") {
    try {
      return JSON.parse(data)?.store ?? null;
    } catch {
      return null;
    }
  }
  return null;
}

export function hasValidStoreOnConfig(config) {
  const store = getConfigStoreParam(config);
  return isValidStoreId(String(store ?? ""));
}

export function markPendingStoreIdToastSuppress() {
  pendingSuppressStoreIdToast = true;
}

export function consumePendingStoreIdToastSuppress() {
  if (!pendingSuppressStoreIdToast) return false;
  pendingSuppressStoreIdToast = false;
  return true;
}

export function shouldSuppressStoreIdToast({ storeBootstrapReady = true } = {}) {
  if (!storeBootstrapReady) return true;
  return pendingSuppressStoreIdToast;
}
