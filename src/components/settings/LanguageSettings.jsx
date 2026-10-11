"use client";
import { LanguageSettingsView } from "@dragorbit/features/settings";

import { useTranslation } from "@/hooks/ui/useTranslation";
import { locales, localeNames } from "@/i18n/config";

const LanguageSettings = () => {
  const { t, locale, changeLanguage } = useTranslation();

  return (
    <LanguageSettingsView
      model={{ t, locales, changeLanguage, locale, localeNames }}
    />
  );
};

export default LanguageSettings;
