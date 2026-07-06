export const DEFAULT_TALLY_LEDGERS = {
  sales: "Sales",
  cash: "Cash",
  bank: "Bank",
  sundryDebtors: "Sundry Debtors",
  sundryCreditors: "Sundry Creditors",
  cgst: "Output CGST",
  sgst: "Output SGST",
  igst: "Output IGST",
  purchase: "Purchase",
  inputCgst: "Input CGST",
  inputSgst: "Input SGST",
  inputIgst: "Input IGST",
};

export const DEFAULT_PAYMENT_METHOD_LEDGERS = {
  CASH: "Cash",
  UPI: "Bank",
  BANK_TRANSFER: "Bank",
  CHEQUE: "Bank",
};

export const LEDGER_FIELD_KEYS = [
  "sales",
  "cash",
  "bank",
  "sundryDebtors",
  "sundryCreditors",
  "cgst",
  "sgst",
  "igst",
  "purchase",
  "inputCgst",
  "inputSgst",
  "inputIgst",
];

export function mapToObject(value) {
  if (!value) return {};
  if (value instanceof Map) return Object.fromEntries(value.entries());
  if (typeof value === "object") return { ...value };
  return {};
}

export function buildTallyFormState(store) {
  const integration = store?.tallyIntegration || {};
  return {
    enabled: integration.enabled === true,
    companyName: integration.companyName || store?.name || "",
    defaultLedgers: {
      ...DEFAULT_TALLY_LEDGERS,
      ...mapToObject(integration.defaultLedgers),
    },
    paymentMethodLedgers: {
      ...DEFAULT_PAYMENT_METHOD_LEDGERS,
      ...mapToObject(integration.paymentMethodLedgers),
    },
    expenseCategoryLedgers: mapToObject(integration.expenseCategoryLedgers),
  };
}

export function buildTallyIntegrationPayload(form) {
  const expenseCategoryLedgers = Object.fromEntries(
    Object.entries(form.expenseCategoryLedgers || {}).filter(
      ([key, value]) => key?.trim() && value?.trim(),
    ),
  );

  return {
    tallyIntegration: {
      enabled: form.enabled === true,
      companyName: String(form.companyName || "").trim(),
      defaultLedgers: form.defaultLedgers,
      paymentMethodLedgers: form.paymentMethodLedgers,
      expenseCategoryLedgers,
    },
  };
}

export function downloadTallyXml(xml, filename) {
  const blob = new Blob([xml], { type: "application/xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function pickStoreId(store) {
  return store?._id || store?.id || store?.storeId || null;
}
