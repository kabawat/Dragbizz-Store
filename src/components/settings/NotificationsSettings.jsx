"use client";
import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";

const NotificationsSettings = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    billingAlerts: true,
    paymentReminders: true,
    lowStockAlerts: true,
    orderUpdates: true,
  });

  const handleToggle = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">
          {t("settings.notificationSettings")}
        </h2>
        <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">
          {t("settings.manageNotifications")}
        </p>
      </div>

      <div className="backdrop-blur-md rounded-lg border border-[rgb(var(--color-border-primary))]/40 p-6 space-y-3">
        {Object.entries(notifications).map(([key, value]) => {
          const translationKey = `settings.notifications.${key}`;
          const translatedLabel = t(translationKey);

          return (
            <div
              key={key}
              className="flex items-center justify-between p-4 bg-[rgb(var(--color-bg-primary))]/50 rounded-lg hover:bg-[rgb(var(--color-bg-secondary))] transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                  {translatedLabel}
                </p>
              </div>
              <button
                onClick={() => handleToggle(key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  value
                    ? "bg-[rgb(var(--color-primary))]"
                    : "bg-[rgb(var(--color-border-primary))]"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    value ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NotificationsSettings;
