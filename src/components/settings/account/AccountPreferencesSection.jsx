"use client";
import { Edit2 } from "lucide-react";
import { Select, Toggle } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { localeNames } from "@/i18n/config";
import AccountPreferencesCard from "./AccountPreferencesCard";

const AccountPreferencesSection = ({
  settings,
  isEditing,
  onEditClick,
  onChange,
}) => {
  const { t } = useTranslation();
  const languageOptions = [
    { value: "en", label: localeNames.en },
    { value: "hi", label: localeNames.hi },
    { value: "gu", label: localeNames.gu },
    { value: "hi-en", label: localeNames["hi-en"] },
  ];

  const timezoneOptions = [
    { value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" },
    { value: "America/New_York", label: "America/New_York (EST)" },
    { value: "America/Los_Angeles", label: "America/Los_Angeles (PST)" },
    { value: "Europe/London", label: "Europe/London (GMT)" },
  ];

  const dateFormatOptions = [
    { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
    { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
    { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
  ];

  const currencyOptions = [
    { value: "INR", label: "₹ INR" },
    { value: "USD", label: "$ USD" },
    { value: "EUR", label: "€ EUR" },
    { value: "GBP", label: "£ GBP" },
  ];

  const getDisplayValue = (key) => {
    const optionMap = {
      language: languageOptions.find((opt) => opt.value === settings.language)
        ?.label,
      timezone: timezoneOptions.find((opt) => opt.value === settings.timezone)
        ?.label,
      dateFormat: dateFormatOptions.find(
        (opt) => opt.value === settings.dateFormat
      )?.label,
      currency: currencyOptions.find((opt) => opt.value === settings.currency)
        ?.label,
    };
    return optionMap[key] || settings[key] || "-";
  };

  if (isEditing) {
    return (
      <div className="bg-[rgb(var(--color-bg-primary))]/20 backdrop-blur-md rounded-lg border border-[rgb(var(--color-border-primary))]/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
            {t("settings.accountPreferences")}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label={t("settings.language")}
            value={settings.language}
            onChange={(value) => onChange("language", value)}
            options={languageOptions}
            placeholder={t("settings.selectLanguage")}
            size="md"
          />

          <Select
            label={t("settings.timezone")}
            value={settings.timezone}
            onChange={(value) => onChange("timezone", value)}
            options={timezoneOptions}
            placeholder={t("settings.selectTimezone")}
            size="md"
          />

          <Select
            label={t("settings.dateFormat")}
            value={settings.dateFormat}
            onChange={(value) => onChange("dateFormat", value)}
            options={dateFormatOptions}
            placeholder={t("settings.selectDateFormat")}
            size="md"
          />

          <Select
            label={t("settings.currency")}
            value={settings.currency}
            onChange={(value) => onChange("currency", value)}
            options={currencyOptions}
            placeholder={t("settings.selectCurrency")}
            size="md"
          />
        </div>

        <div className="mt-6 pt-6 border-t border-[rgb(var(--color-border-primary))]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                {t("settings.autoSave")}
              </p>
              <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                {t("settings.autoSaveDescription")}
              </p>
            </div>
            <Toggle
              checked={settings.autoSave}
              onChange={() => onChange("autoSave", !settings.autoSave)}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[rgb(var(--color-bg-primary))]/20 backdrop-blur-md rounded-lg border border-[rgb(var(--color-border-primary))]/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
          {t("settings.accountPreferences")}
        </h3>
        <button
          onClick={onEditClick}
          className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--color-primary))] text-white rounded-lg"
        >
          <Edit2 className="w-4 h-4" />
          {t("settings.editPreferences")}
        </button>
      </div>

      {/* Read-only view */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AccountPreferencesCard
          icon="language"
          label={t("settings.language")}
          value={getDisplayValue("language")}
        />

        <AccountPreferencesCard
          icon="timezone"
          label={t("settings.timezone")}
          value={getDisplayValue("timezone")}
        />

        <AccountPreferencesCard
          icon="dateFormat"
          label={t("settings.dateFormat")}
          value={getDisplayValue("dateFormat")}
        />

        <AccountPreferencesCard
          icon="currency"
          label={t("settings.currency")}
          value={getDisplayValue("currency")}
        />
      </div>

      {/* Auto Save Toggle */}
      <div className="mt-6 pt-6 border-t border-[rgb(var(--color-border-primary))]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
              {t("settings.autoSave")}
            </p>
            <p className="text-xs text-[rgb(var(--color-text-secondary))]">
              {t("settings.autoSaveDescription")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-sm ${settings.autoSave ? "text-[rgb(var(--color-primary))]" : "text-[rgb(var(--color-text-tertiary))]"}`}
            >
              {settings.autoSave ? t("common.enabled") : t("common.disabled")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPreferencesSection;
