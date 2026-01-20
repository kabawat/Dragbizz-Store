"use client";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";

export const useAccountData = () => {
  const { locale, changeLanguage } = useTranslation();

  const [settings, setSettings] = useState({
    language: locale || "en",
    timezone: "Asia/Kolkata",
    dateFormat: "DD/MM/YYYY",
    currency: "INR",
    autoSave: true,
  });

  // Sync language with current locale
  useEffect(() => {
    setSettings((prev) => ({
      ...prev,
      language: locale || "en",
    }));
  }, [locale]);

  const handleChange = useCallback(
    (name, value) => {
      setSettings((prev) => ({
        ...prev,
        [name]: value,
      }));

      // If language is changed, update the actual language
      if (name === "language" && value !== locale) {
        changeLanguage(value);
      }
    },
    [locale, changeLanguage]
  );

  const handleToggle = useCallback((name) => {
    setSettings((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  }, []);

  return {
    settings,
    setSettings,
    handleChange,
    handleToggle,
  };
};
