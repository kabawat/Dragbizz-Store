const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

function normalizeStoreIdValue(raw) {
  if (raw == null) return null;

  if (typeof raw === "string") {
    const trimmed = raw.trim();
    return trimmed || null;
  }

  if (typeof raw === "object") {
    if (typeof raw.$oid === "string") {
      const trimmed = raw.$oid.trim();
      return trimmed || null;
    }
    if (typeof raw.toString === "function") {
      const value = raw.toString();
      if (OBJECT_ID_PATTERN.test(value)) return value;
    }
  }

  return null;
}

/** Resolve store id from profile storeId or GET /store _id. */
export function pickStoreId(storeOrId) {
  if (!storeOrId) return null;
  if (typeof storeOrId === "string" || typeof storeOrId === "number") {
    return normalizeStoreIdValue(String(storeOrId));
  }
  return normalizeStoreIdValue(storeOrId.storeId ?? storeOrId._id ?? null);
}

export function isValidStoreId(storeId) {
  return typeof storeId === "string" && OBJECT_ID_PATTERN.test(storeId);
}

/** Drop store records without a valid id. Profile API shape is kept as-is. */
export function normalizeStoreSummary(store = {}) {
  return isValidStoreId(pickStoreId(store)) ? store : null;
}
