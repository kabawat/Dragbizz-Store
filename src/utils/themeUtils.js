import {
  getThemeTokens,
  isThemeName,
  isThemeVariant,
  THEME_STORAGE_KEYS,
} from "@dragorbit/core/themes";

// Host adapter: persistence and DOM are deliberately outside the shared core.
function readPreference(key) {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function writePreference(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* Theme still applies when preference storage is unavailable. */
  }
}
export function getStoredTheme() {
  const value = readPreference(THEME_STORAGE_KEYS.theme);
  return isThemeName(value) ? value : null;
}
export function getStoredVariant() {
  const value = readPreference(THEME_STORAGE_KEYS.variant);
  return isThemeVariant(value) ? value : null;
}
export function saveTheme(value) {
  if (isThemeName(value)) writePreference(THEME_STORAGE_KEYS.theme, value);
}
export function saveVariant(value) {
  if (isThemeVariant(value)) writePreference(THEME_STORAGE_KEYS.variant, value);
}
export function applyThemeToDOM(themeName, variant) {
  if (typeof document === "undefined") return;
  const resolved = getThemeTokens(themeName, variant),
    root = document.documentElement;
  root.setAttribute("data-theme", resolved.themeName);
  root.setAttribute("data-variant", resolved.variant);
  root.classList.toggle("dark", resolved.variant === "dark");
  for (const [key, value] of Object.entries(resolved.variables))
    root.style.setProperty(key, value);
}
