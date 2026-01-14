"use client"
import { useLanguage } from '@/contexts/LanguageContext';

export const useTranslation = () => {
  const { t, locale, changeLanguage } = useLanguage();
  return { t, locale, changeLanguage };
};

