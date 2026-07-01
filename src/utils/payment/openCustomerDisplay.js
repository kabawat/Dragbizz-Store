export function openCustomerDisplay({ tenantId, storeId }) {
  if (typeof window === "undefined" || !tenantId || !storeId) return null;
  const windowName = `dragbizz-customer-display-${tenantId}-${storeId}`;
  return window.open("/dashboard/customer-payment", windowName);
}
