"use client";
import Cookies from "js-cookie";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { defaultLocale, locales } from "@/i18n/config";
import logger from "@/utils/logger";

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [locale, setLocale] = useState(defaultLocale);
  const [messages, setMessages] = useState(null);

  const loadMessages = useCallback(async (lang) => {
    try {
      let module;
      // Using specific paths for better tree-shaking and chunking
      if (lang === "en") {
        module = await import("@/i18n/messages/en");
      } else if (lang === "hi") {
        module = await import("@/i18n/messages/hi");
      } else if (lang === "gu") {
        module = await import("@/i18n/messages/gu");
      } else if (lang === "hi-en") {
        module = await import("@/i18n/messages/hi-en");
      } else {
        module = await import("@/i18n/messages/en");
      }

      const messages = module.default;
      setMessages(messages);
    } catch (error) {
      logger.error(`Failed to load messages for locale: ${lang}`, error);
      // Fallback
      const module = await import("@/i18n/messages/en");
      setMessages(module.default);
    }
  }, []);

  useEffect(() => {
    const savedLocale = Cookies.get("locale") || defaultLocale;
    const finalLocale = locales.includes(savedLocale)
      ? savedLocale
      : defaultLocale;
    setLocale(finalLocale);
    loadMessages(finalLocale);

    if (typeof document !== "undefined") {
      document.documentElement.lang = finalLocale;
    }
  }, [loadMessages]);

  const changeLanguage = async (newLocale) => {
    if (!locales.includes(newLocale)) {
      logger.warn(`Locale ${newLocale} is not supported`);
      return;
    }

    setLocale(newLocale);
    Cookies.set("locale", newLocale, { expires: 365, path: "/" });
    await loadMessages(newLocale);

    if (typeof document !== "undefined") {
      document.documentElement.lang = newLocale;
    }
  };

  const t = useCallback((key, params = {}) => {
    if (!messages) return key;

    const keys = key.split(".");
    let value = messages;

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }

    if (typeof value !== "string") {
      return key;
    }

    if (Object.keys(params).length === 0) {
      return value;
    }

    return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
      return params[paramKey] !== undefined ? params[paramKey] : match;
    });
  }, [messages]);

  const value = useMemo(() => ({
    locale,
    changeLanguage,
    t,
    messages
  }), [locale, changeLanguage, t, messages]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
