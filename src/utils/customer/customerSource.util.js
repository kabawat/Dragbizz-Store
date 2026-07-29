export const CUSTOMER_SOURCES = [
  "MANUAL",
  "POS",
  "INVOICE",
  "BULK_IMPORT",
  "ONLINE",
  "IN_STORE",
  "WHATSAPP",
  "PHONE",
  "QR_CATALOG",
  "VOICE_AI",
];

export function getCustomerSourceLabel(source, t) {
  const key = source || "MANUAL";
  return t(`customers.sourceValues.${key}`, { defaultValue: key.replace(/_/g, " ") });
}

export function getCustomerSourceOptions(t) {
  return [
    { value: "", label: t("customers.allSources") },
    ...CUSTOMER_SOURCES.map((source) => ({
      value: source,
      label: getCustomerSourceLabel(source, t),
    })),
  ];
}
