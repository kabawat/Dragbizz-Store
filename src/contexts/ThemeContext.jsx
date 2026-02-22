"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setTheme as setReduxTheme, setVariant as setReduxVariant } from "@/store/slices/themeSlice";
import { themes } from "@/constants/themes";
import { getStoredTheme, getStoredVariant, saveTheme, saveVariant, applyThemeToDOM } from "@/utils/themeUtils";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const dispatch = useAppDispatch();
  const reduxTheme = useAppSelector((state) => state.theme.theme);
  const reduxVariant = useAppSelector((state) => state.theme.variant);

  const [currentTheme, setCurrentTheme] = useState(
    () => getStoredTheme() || reduxTheme || "default"
  );
  const [currentVariant, setCurrentVariant] = useState(
    () => getStoredVariant() || reduxVariant || "light"
  );

  // Sync with Redux on mount
  useEffect(() => {
    dispatch(setReduxTheme(currentTheme));
    dispatch(setReduxVariant(currentVariant));
  }, []);

  // Apply theme to document
  useEffect(() => {
    applyThemeToDOM(currentTheme, currentVariant);
    saveTheme(currentTheme);
    saveVariant(currentVariant);

    // Sync to Redux
    dispatch(setReduxTheme(currentTheme));
    dispatch(setReduxVariant(currentVariant));
  }, [currentTheme, currentVariant, dispatch]);

  const changeTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
    }
  };

  const changeVariant = (variant) => {
    if (["light", "dark"].includes(variant)) {
      setCurrentVariant(variant);
    }
  };

  const toggleVariant = () => {
    setCurrentVariant(currentVariant === "light" ? "dark" : "light");
  };

  const getCurrentThemeConfig = () => {
    return (
      themes[currentTheme]?.colors[currentVariant] ||
      themes.default.colors.light
    );
  };

  const value = {
    currentTheme,
    currentVariant,
    themes,
    changeTheme,
    changeVariant,
    toggleVariant,
    getCurrentThemeConfig,
    themeConfig: getCurrentThemeConfig(),
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
