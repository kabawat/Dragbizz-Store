export const CURRENCY_OPTIONS = [
  { value: 'INR', label: 'Indian Rupee (₹)', symbol: '₹' },
  { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
  { value: 'EUR', label: 'Euro (€)', symbol: '€' },
  { value: 'GBP', label: 'British Pound (£)', symbol: '£' },
  { value: 'JPY', label: 'Japanese Yen (¥)', symbol: '¥' },
  { value: 'CAD', label: 'Canadian Dollar (C$)', symbol: 'C$' },
  { value: 'AUD', label: 'Australian Dollar (A$)', symbol: 'A$' }
];

/**
 * Default currency
 */
export const DEFAULT_CURRENCY = 'INR';


export const getCurrencySymbol = (currencyCode) => {
  const currency = CURRENCY_OPTIONS.find(c => c.value === currencyCode);
  return currency ? currency.symbol : '₹';
};


export const getCurrencyLabel = (currencyCode) => {
  const currency = CURRENCY_OPTIONS.find(c => c.value === currencyCode);
  return currency ? currency.label : 'Indian Rupee (₹)';
};

export default CURRENCY_OPTIONS;
