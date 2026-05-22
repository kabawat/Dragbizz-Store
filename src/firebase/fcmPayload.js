/** Map FCM / socket event names to app notification types. */
const FCM_TYPE_MAP = {
  customer_created: "SALE_ORDER_CUSTOMER",
  sales_order_created: "SALES_ORDER",
  stock_alert: "STOCK_ALERT",
  stock_low: "STOCK_ALERT",
  payment: "PAYMENT",
  payment_received: "PAYMENT",
  system: "SYSTEM",
};

/**
 * Normalize FCM MessagePayload to the same shape as socket realtime events.
 * @param {import("firebase/messaging").MessagePayload} payload
 */
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

  const normalizedData = {
    ...data,
    type: rawType || type,
    customer: data.customer || data.customerId || data.customer_id,
    order: data.order || data.orderId || data.order_id || data.salesOrderId,
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
