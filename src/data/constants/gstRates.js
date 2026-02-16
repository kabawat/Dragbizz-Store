export const GST_RATE_OPTIONS = [
  { value: 0, label: "0% - Exempt", description: "Essentials & Life Insurance" },
  {
    value: 0.25,
    label: "0.25% - Precious Stones",
    description: "Rough diamonds and precious stones",
  },
  {
    value: 3,
    label: "3% - Precious Metals",
    description: "Gold, silver, and jewellery",
  },
  {
    value: 5,
    label: "5% - Merit Rate",
    description: "Food essentials and household items (previously 12%)",
  },
  {
    value: 18,
    label: "18% - Standard Rate",
    description: "General goods, services, and electronics (previously 28%)"
  },
  {
    value: 40,
    label: "40% - Sin/Luxury Tax",
    description: "Luxury cars, tobacco, and aerated drinks",
  },
];

// Default GST rate
export const DEFAULT_GST_RATE = 18;

export const getGSTRateLabel = (rate) => {
  const gstRate = GST_RATE_OPTIONS.find((r) => r.value === rate);
  return gstRate ? gstRate.label : "18% - Standard Rate";
};

export const getGSTRateDescription = (rate) => {
  const gstRate = GST_RATE_OPTIONS.find((r) => r.value === rate);
  return gstRate ? gstRate.description : "Standard GST rate";
};

export default GST_RATE_OPTIONS;
