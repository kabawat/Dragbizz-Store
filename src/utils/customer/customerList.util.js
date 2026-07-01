export function buildCustomerListParams({
  storeId,
  search = "",
  isActive = "",
  source = "",
  startDate = "",
  endDate = "",
  nextCursor,
  isFreshLoad = true,
  limit = 20,
}) {
  if (!storeId) return null;

  return {
    store: storeId,
    limit,
    includeAccount: true,
    isFreshLoad,
    ...(nextCursor ? { nextCursor } : {}),
    ...(search?.trim() ? { search: search.trim() } : {}),
    ...(isActive !== "" ? { isActive } : {}),
    ...(source ? { source } : {}),
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
  };
}

export function getCustomerListFetchKey(storeId, filters) {
  const { search = "", isActive = "", source = "", startDate = "", endDate = "" } = filters;
  return `${storeId}-${search}-${isActive}-${source}-${startDate}-${endDate}`;
}
