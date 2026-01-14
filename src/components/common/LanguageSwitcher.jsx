"use client"
import React from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { locales, localeNames } from '@/i18n/config';

const LanguageSwitcher = ({ className = '' }) => {
  const { locale, changeLanguage } = useTranslation();

  const handleLanguageChange = (e) => {
    const newLocale = e.target.value;
    if (newLocale !== locale) {
      changeLanguage(newLocale);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center space-x-2">
        <Globe className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
        <select
          value={locale}
          onChange={handleLanguageChange}
          className="bg-transparent border-none outline-none text-sm text-[rgb(var(--color-text-primary))] cursor-pointer appearance-none pr-6 focus:outline-none"
          aria-label="Select language"
        >
          {locales.map((loc) => (
            <option key={loc} value={loc} className="bg-[rgb(var(--color-bg-primary))]">
              {localeNames[loc]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default LanguageSwitcher;

