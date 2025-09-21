/**
 * Currency Options for Product Pricing
 * Supported currencies with symbols and labels
 */

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

/**
 * Get currency symbol by currency code
 * @param {string} currencyCode - Currency code (e.g., 'USD', 'INR')
 * @returns {string} Currency symbol
 */
export const getCurrencySymbol = (currencyCode) => {
  const currency = CURRENCY_OPTIONS.find(c => c.value === currencyCode);
  return currency ? currency.symbol : '₹';
};

/**
 * Get currency label by currency code
 * @param {string} currencyCode - Currency code (e.g., 'USD', 'INR')
 * @returns {string} Currency label
 */
export const getCurrencyLabel = (currencyCode) => {
  const currency = CURRENCY_OPTIONS.find(c => c.value === currencyCode);
  return currency ? currency.label : 'Indian Rupee (₹)';
};

export default CURRENCY_OPTIONS;
