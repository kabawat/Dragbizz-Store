
export const GST_RATE_OPTIONS = [
  { value: 0, label: '0% - Exempt', description: 'Exempt from GST' },
  { value: 0.25, label: '0.25% - Gold', description: 'Gold and precious metals' },
  { value: 3, label: '3% - Gold Jewellery', description: 'Gold jewellery and ornaments' },
  { value: 5, label: '5% - Essential Items', description: 'Essential commodities' },
  { value: 12, label: '12% - Standard Rate', description: 'Standard GST rate' },
  { value: 18, label: '18% - Standard Rate', description: 'Standard GST rate' },
  { value: 28, label: '28% - Luxury Items', description: 'Luxury goods and services' }
];

/**
 * Default GST rate
 */
export const DEFAULT_GST_RATE = 18;


export const getGSTRateLabel = (rate) => {
  const gstRate = GST_RATE_OPTIONS.find(r => r.value === rate);
  return gstRate ? gstRate.label : '18% - Standard Rate';
};


export const getGSTRateDescription = (rate) => {
  const gstRate = GST_RATE_OPTIONS.find(r => r.value === rate);
  return gstRate ? gstRate.description : 'Standard GST rate';
};

export default GST_RATE_OPTIONS;
