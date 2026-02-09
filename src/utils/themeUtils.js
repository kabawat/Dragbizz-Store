import { themes } from "@/constants/themes";

const THEME_STORAGE_KEY = "dragbizz-theme";
const VARIANT_STORAGE_KEY = "dragbizz-variant";

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

export const applyThemeToDOM = (theme, variant) => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.setAttribute("data-variant", variant);

    // Apply 'dark' class for Tailwind dark mode support
    if (variant === "dark") {
        root.classList.add("dark");
    } else {
        root.classList.remove("dark");
    }
};
