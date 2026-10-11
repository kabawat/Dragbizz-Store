"use client";
import { AppearanceSettingsView } from "@dragorbit/features/settings";

import { useState } from "react";

import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/hooks/ui/useTranslation";

const themeCategories = {
  warm: ["default", "ocean", "forest", "sunset", "rose"],
  cool: ["violet", "indigo", "purple", "blue", "sapphire", "midnight"],
  green: ["emerald", "green", "teal", "lime"],
  vibrant: ["amber", "coral", "pink"],
  neutral: ["sky", "cyan", "slate", "zinc"],
};

const AppearanceSettings = ({ animationKey, handleToggleVariant }) => {
  const { t } = useTranslation();
  const { currentTheme, currentVariant, themes, changeTheme } = useTheme();

  const [activeCategory, setActiveCategory] = useState("warm");

  const resetAppearance = () => {
    changeTheme("default");
    if (currentVariant !== "light") handleToggleVariant();
  };

  return (
    <AppearanceSettingsView
      model={{
        t,
        resetAppearance,
        currentVariant,
        handleToggleVariant,
        themeCategories,
        setActiveCategory,
        activeCategory,
        themes,
        currentTheme,
        changeTheme,
        TrendingUp,
      }}
    />
  );
};

// Help icons or animation triggers if needed
const TrendingUp = ({ className }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
      <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
  );
};

export default AppearanceSettings;
