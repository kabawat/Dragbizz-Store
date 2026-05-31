export function getCustomerSourceLabel(source, t) {
  const key = source || "MANUAL";
  return t(`customers.sourceValues.${key}`, { defaultValue: key.replace(/_/g, " ") });
}
