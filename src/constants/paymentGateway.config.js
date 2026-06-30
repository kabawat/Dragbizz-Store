export const PAYMENT_GATEWAY_V1_TYPES = ["RAZORPAY", "PAYTM", "CASHFREE"];

export const GATEWAY_MODES = ["TEST", "LIVE"];

export const GATEWAY_CREDENTIAL_UI = {
  RAZORPAY: {
    profile: "razorpay",
    fields: [
      { key: "keyId", secret: false },
      { key: "keySecret", secret: true },
      { key: "webhookSecret", secret: true, optional: true },
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
      { key: "webhookSecret", secret: true, optional: true },
    ],
  },
};

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
    if (!trimmed && isEdit && field.secret) continue;
    if (!trimmed && field.optional) continue;
    if (trimmed) profileData[field.key] = trimmed;
  }

  if (Object.keys(profileData).length === 0) return {};
  return { [config.profile]: profileData };
}

export function getRequiredCredentialFields(gatewayType) {
  const config = getGatewayCredentialConfig(gatewayType);
  if (!config) return [];
  return config.fields.filter((f) => !f.optional && !f.secret).map((f) => f.key);
}

export function getRequiredSecretFields(gatewayType, isEdit = false) {
  if (isEdit) return [];
  const config = getGatewayCredentialConfig(gatewayType);
  if (!config) return [];
  return config.fields.filter((f) => f.secret && !f.optional).map((f) => f.key);
}
