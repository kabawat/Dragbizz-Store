export const PAYMENT_GATEWAY_V1_TYPES = ["RAZORPAY", "PAYTM", "CASHFREE"];

export const GATEWAY_MODES = ["TEST", "LIVE"];

export const GATEWAY_WEBHOOK_SUPPORTED = new Set(["RAZORPAY", "CASHFREE"]);

export const GATEWAY_CREDENTIAL_UI = {
  RAZORPAY: {
    profile: "razorpay",
    fields: [
      { key: "keyId", secret: false, masked: true },
      { key: "keySecret", secret: true },
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
  CASHFREE: {
    profile: "cashfree",
    fields: [
      { key: "appId", secret: false },
      { key: "secretKey", secret: true },
    ],
  },
};

export function gatewaySupportsWebhookSetup(gatewayType) {
  return GATEWAY_WEBHOOK_SUPPORTED.has(gatewayType);
}

export function getGatewayCredentialConfig(gatewayType) {
  return GATEWAY_CREDENTIAL_UI[gatewayType] ?? null;
}

export function buildCredentialsPayload(gatewayType, formValues, { isEdit = false } = {}) {
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
  if (value === undefined || value === null || String(value).trim() === "") return "";
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
