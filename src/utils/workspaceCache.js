// This is a presentation cache, never a session/token or authorization source.
const KEY = "dragbizz:workspace-preview:v1";
const MAX_AGE = 24 * 60 * 60 * 1000;
const pick = (value, keys) =>
  Object.fromEntries(
    keys
      .filter((key) => value?.[key] !== undefined)
      .map((key) => [key, value[key]])
  );
export const workspaceScope = (profile) => {
  const auth = profile?.authProfile;
  return auth?.agencyId && auth?._id
    ? `${String(auth._id)}:${String(auth.agencyId)}:${auth.tenant || ""}`
    : null;
};
const fresh = (timestamp) =>
  Number.isFinite(timestamp) &&
  Date.now() >= timestamp &&
  Date.now() - timestamp < MAX_AGE;
function read() {
  try {
    if (typeof window === "undefined") return null;
    const value = JSON.parse(window.localStorage.getItem(KEY));
    return value?.version === 1 && value.origin === window.location.origin
      ? value
      : null;
  } catch {
    return null;
  }
}
function write(value) {
  try {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({ ...value, version: 1, origin: window.location.origin })
    );
  } catch {}
}
export function clearWorkspaceCache() {
  try {
    if (typeof window !== "undefined") window.localStorage.removeItem(KEY);
  } catch {}
}
export function readWorkspacePreview() {
  const value = read();
  const profile = value?.profile;
  if (
    !fresh(value?.profileSavedAt) ||
    !profile?.agency ||
    !profile?.stores?.length ||
    !workspaceScope(profile)
  )
    return null;
  if (!["store_owner", "store_staff"].includes(profile.authProfile.role))
    return null;
  return profile;
}
export function saveWorkspacePreview(profile) {
  const scope = workspaceScope(profile);
  if (
    !scope ||
    !profile.sessionVerified ||
    !profile.agency ||
    !profile.stores?.length
  )
    return;
  const previous = read();
  const authKeys = [
    "_id",
    "id",
    "sub",
    "userId",
    "role",
    "agencyId",
    "tenant",
    "name",
    "firstName",
    "lastName",
    "email",
  ];
  const stores = profile.stores.map((store) =>
    pick(store, ["_id", "id", "storeId", "storeName", "name", "gst", "logo"])
  );
  const snapshot = {
    authProfile: pick(profile.authProfile, authKeys),
    user: pick(profile.user, authKeys),
    agency: pick(profile.agency, ["_id", "id", "agencyName", "name", "logo"]),
    stores,
    selectedStore:
      stores.find(
        (store) =>
          (store.storeId || store._id) ===
          (profile.selectedStore?.storeId || profile.selectedStore?._id)
      ) || stores[0],
    staffProfile: profile.staffProfile
      ? pick(profile.staffProfile, ["_id", "id", "permissions"])
      : null,
  };
  write({
    ...(previous?.scope === scope ? previous : {}),
    scope,
    profile: snapshot,
    profileSavedAt: Date.now(),
  });
}
export function readPlanPreview(scope) {
  const value = read();
  const validSubscription =
    value?.subscription == null ||
    (typeof value.subscription === "object" &&
      Array.isArray(value.subscription.features));
  return scope &&
    value?.scope === scope &&
    fresh(value?.planSavedAt) &&
    value.planResolved === true &&
    validSubscription
    ? { subscription: value.subscription ?? null }
    : null;
}

export function savePlanPreview(scope, subscription) {
  if (!scope) return;
  const previous = read();
  write({
    ...(previous?.scope === scope ? previous : {}),
    scope,
    subscription,
    planResolved: true,
    planSavedAt: Date.now(),
  });
}
