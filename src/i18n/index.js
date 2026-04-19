// Export only config to avoid loading all language files in the main bundle
export { defaultLocale, localeNames, locales } from "./config";

// Messages are loaded dynamically in LanguageContext.jsx
export const messages = {};
