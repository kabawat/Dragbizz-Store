"use client";
import { ThemeProvider as SharedThemeProvider } from "@dragorbit/ui/app";
import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setTheme, setVariant } from "@/store/slices/themeSlice";
import {
  applyThemeToDOM,
  getStoredTheme,
  getStoredVariant,
  saveTheme,
  saveVariant,
} from "@/utils/themeUtils";

export { useTheme } from "@dragorbit/ui/app";
export function ThemeProvider({ children }) {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.theme);
  const variant = useAppSelector((state) => state.theme.variant);
  const onApply = useCallback(
    (name, mode) => {
      applyThemeToDOM(name, mode);
      saveTheme(name);
      saveVariant(mode);
      dispatch(setTheme(name));
      dispatch(setVariant(mode));
    },
    [dispatch]
  );
  return (
    <SharedThemeProvider
      initialTheme={() => getStoredTheme() || theme || "default"}
      initialVariant={() => getStoredVariant() || variant || "light"}
      onApply={onApply}
    >
      {children}
    </SharedThemeProvider>
  );
}
