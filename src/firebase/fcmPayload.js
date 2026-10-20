// Map FCM and socket events to app notification types
const FCM_TYPE_MAP = {
  customer_created: "SALE_ORDER_CUSTOMER",
  sales_order_created: "SALES_ORDER",
  stock_alert: "STOCK_ALERT",
  stock_low: "STOCK_ALERT",
  payment: "PAYMENT_RECEIVED",
  payment_received: "PAYMENT_RECEIVED",
  PAYMENT_RECEIVED: "PAYMENT_RECEIVED",
  system: "SYSTEM",
};

// Normalize FCM MessagePayload
export function mapFcmPayloadToNotification(payload) {
  const data = payload?.data || {};
  const rawType = data.type || data.event || "";
  const type =
    FCM_TYPE_MAP[rawType] ||
    (rawType ? rawType.toUpperCase().replace(/-/g, "_") : "SYSTEM");

  const message =
    payload?.notification?.body ||
    data.body ||
    data.message ||
    payload?.notification?.title ||
    data.title ||
    "New activity detected";

  const custId = data.customer || data.customerId || data.customer_id;
  const khataUrl = custId ? `/dashboard/customers/${custId}?tab=khata` : undefined;

  const normalizedData = {
    ...data,
    type: rawType || type,
    customer: custId,
    order: data.order || data.orderId || data.order_id || data.salesOrderId,
    url: data.url || khataUrl,
    source: "fcm",
  };

  return {
    message,
    type,
    data: normalizedData,
    customer: normalizedData.customer,
    order: normalizedData.order,
  };
}
