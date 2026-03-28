import { themes } from "@/constants/themes";

const THEME_STORAGE_KEY = "dragbizz-theme";
const VARIANT_STORAGE_KEY = "dragbizz-variant";

// Helper to convert hex to RGB space string "255 255 255"
const hexToRgbSpace = (hex) => {
    hex = hex.replace("#", "");
    if (hex.length === 3) {
        hex = hex.split("").map((char) => char + char).join("");
    }
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `${r} ${g} ${b}`;
};

export const getStoredTheme = () => {
    if (typeof window === "undefined") {
        return null;
    }
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return storedTheme && themes[storedTheme] ? storedTheme : null;
};

export const getStoredVariant = () => {
    if (typeof window === "undefined") {
        return null;
    }
    const storedVariant = window.localStorage.getItem(VARIANT_STORAGE_KEY);
    return storedVariant && ["light", "dark"].includes(storedVariant)
        ? storedVariant
        : null;
};

export const saveTheme = (theme) => {
    if (typeof window !== "undefined") {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
};

export const saveVariant = (variant) => {
    if (typeof window !== "undefined") {
        localStorage.setItem(VARIANT_STORAGE_KEY, variant);
    }
};

export const applyThemeToDOM = (themeName, variant) => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    const theme = themes[themeName];

    if (!theme) return;

    const colors = theme.colors[variant] || theme.colors.light;

    // Apply attributes for CSS selectors
    root.setAttribute("data-theme", themeName);
    root.setAttribute("data-variant", variant);

    // Key mapping from JS theme to CSS variables
    const mapping = {
        primary: "--color-primary",
        secondary: "--color-secondary",
        background: "--color-bg-primary",
        surface: "--color-bg-secondary",
        text: "--color-text-primary",
        textSecondary: "--color-text-secondary",
        border: "--color-border-primary",
    };

    // Apply basic mapping
    Object.entries(mapping).forEach(([jsKey, cssVar]) => {
        const value = colors[jsKey];
        if (value) {
            if (value.startsWith("#")) {
                root.style.setProperty(cssVar, hexToRgbSpace(value));
            } else {
                root.style.setProperty(cssVar, value);
            }
        }
    });

    // Derived/Fallback vars for consistency
    if (colors.surface) {
        // Set tertiary background similar to surface but slightly different if needed
        // For now, let's keep it same as secondary/surface or derived
        root.style.setProperty("--color-bg-tertiary", hexToRgbSpace(colors.surface));
    }

    if (colors.border) {
        // Set border secondary based on primary border
        root.style.setProperty("--color-border-secondary", hexToRgbSpace(colors.border));
    }

    // Apply 'dark' class for Tailwind dark mode support
    if (variant === "dark") {
        root.classList.add("dark");
    } else {
        root.classList.remove("dark");
    }
};

