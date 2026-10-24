export const PAYMENT_GATEWAY_V1_TYPES = [
  "RAZORPAY",
  "CASHFREE",
  "PHONEPE",
  "PAYTM",
  "PAYU",
  "EASEBUZZ",
  "STRIPE",
];

export const GATEWAY_MODES = ["TEST", "LIVE"];

export const GATEWAY_WEBHOOK_SUPPORTED = new Set([
  "RAZORPAY",
  "CASHFREE",
  "PHONEPE",
  "PAYTM",
  "PAYU",
  "EASEBUZZ",
  "STRIPE",
]);

export const GATEWAY_WEBHOOK_META = {
  RAZORPAY: {
    path: "razorpay",
    hasSecret: true,
    secretManagedByDragbizz: true,
    events: ["payment.captured", "payment.failed", "order.paid"],
  },
  CASHFREE: {
    path: "cashfree",
    hasSecret: true,
    secretManagedByDragbizz: true,
    events: ["PAYMENT_SUCCESS_WEBHOOK", "PAYMENT_FAILED_WEBHOOK", "ORDER_PAID"],
  },
  PHONEPE: {
    path: "phonepe",
    hasSecret: false,
    secretManagedByDragbizz: false,
    events: ["PAYMENT_SUCCESS", "PAYMENT_ERROR"],
  },
  PAYTM: {
    path: "paytm",
    hasSecret: false,
    secretManagedByDragbizz: false,
    events: ["PAYMENT", "REFUND"],
  },
  PAYU: {
    path: "payu",
    hasSecret: false,
    secretManagedByDragbizz: false,
    events: ["Transaction Status", "Payment Updates"],
  },
  EASEBUZZ: {
    path: "easebuzz",
    hasSecret: false,
    secretManagedByDragbizz: false,
    events: ["Payment Successful", "Payment Failed"],
  },
  STRIPE: {
    path: "stripe",
    hasSecret: true,
    secretManagedByDragbizz: true,
    events: ["payment_intent.succeeded", "checkout.session.completed"],
  },
};

export const GATEWAY_CREDENTIAL_UI = {
  RAZORPAY: {
    profile: "razorpay",
    fields: [
      { key: "keyId", secret: false, masked: true },
      { key: "keySecret", secret: true },
    ],
  },
  CASHFREE: {
    profile: "cashfree",
    fields: [
      { key: "appId", secret: false },
      { key: "secretKey", secret: true },
    ],
  },
  PHONEPE: {
    profile: "phonepe",
    fields: [
      { key: "merchantId", secret: false },
      { key: "saltKey", secret: true },
      { key: "saltIndex", secret: false },
      { key: "clientId", secret: false, optional: true },
      { key: "clientSecret", secret: true, optional: true },
    ],
  },
  PAYTM: {
    profile: "paytm",
    fields: [
      { key: "merchantId", secret: false },
      { key: "merchantKey", secret: true },
      { key: "appId", secret: false, optional: true },
    ],
  },
  PAYU: {
    profile: "payu",
    fields: [
      { key: "merchantKey", secret: false },
      { key: "merchantSalt", secret: true },
      { key: "merchantId", secret: false },
    ],
  },
  EASEBUZZ: {
    profile: "easebuzz",
    fields: [
      { key: "merchantKey", secret: false },
      { key: "salt", secret: true },
      { key: "merchantEmail", secret: false },
    ],
  },
  STRIPE: {
    profile: "stripe",
    fields: [
      { key: "publishableKey", secret: false, masked: true },
      { key: "secretKey", secret: true },
    ],
  },
};

export function gatewaySupportsWebhookSetup(gatewayType) {
  return GATEWAY_WEBHOOK_SUPPORTED.has(gatewayType);
}

export function gatewaySupportsDragbizzWebhookSecret(gatewayType) {
  const meta = GATEWAY_WEBHOOK_META[gatewayType];
  return Boolean(meta?.secretManagedByDragbizz);
}

export function getGatewayWebhookMeta(gatewayType) {
  return GATEWAY_WEBHOOK_META[gatewayType] ?? null;
}

export function getGatewayWebhookUrl(gatewayType, customBaseUrl) {
  const meta = GATEWAY_WEBHOOK_META[gatewayType];
  const path =
    meta?.path ||
    String(gatewayType || "")
      .toLowerCase()
      .replace(/_/g, "-");
  const base = (
    customBaseUrl ||
    process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== "undefined" ? window.location.origin : "")
  ).replace(/\/$/, "");
  return `${base}/v1/payments/webhooks/${path}`;
}

export function getGatewayCredentialConfig(gatewayType) {
  return GATEWAY_CREDENTIAL_UI[gatewayType] ?? null;
}

export function buildCredentialsPayload(
  gatewayType,
  formValues,
  { isEdit = false } = {}
) {
  const config = getGatewayCredentialConfig(gatewayType);
  if (!config) return {};

  const profileData = {};
  for (const field of config.fields) {
    const raw = formValues?.[field.key];
    if (raw === undefined || raw === null) continue;
    const trimmed = String(raw).trim();
    if (!trimmed && isEdit && (field.secret || field.masked)) continue;
    if (!trimmed && field.optional) continue;
    if (trimmed) profileData[field.key] = trimmed;
  }

  if (Object.keys(profileData).length === 0) return {};
  return { [config.profile]: profileData };
}

export function getRequiredCredentialFields(gatewayType, isEdit = false) {
  const config = getGatewayCredentialConfig(gatewayType);
  if (!config) return [];
  return config.fields
    .filter((f) => !f.optional && !f.secret && !(isEdit && f.masked))
    .map((f) => f.key);
}

export function maskCredentialDisplay(value) {
  if (value === undefined || value === null || String(value).trim() === "")
    return "";
  const str = String(value);
  if (str.length <= 4) return "••••";
  return `${"•".repeat(Math.min(str.length, 8))}${str.slice(-4)}`;
}

export function isMaskedCredentialField(field = {}) {
  return Boolean(field.secret || field.masked);
}

export function getRequiredSecretFields(gatewayType, isEdit = false) {
  if (isEdit) return [];
  const config = getGatewayCredentialConfig(gatewayType);
  if (!config) return [];
  return config.fields.filter((f) => f.secret && !f.optional).map((f) => f.key);
}
