"use client";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getNotificationSettings,
  updateNotificationSettings,
  resetNotificationSettings
} from "@/store/slices/notificationSettingsSlice";
import authService from "@/service/auth/auth.service";
import useErrorHandling from "@/hooks/useErrorHandling";
import { Bell, Mail, MessageSquare, Smartphone, Shield, ShoppingCart, Percent, CreditCard, User, RotateCcw, Loader2 } from "lucide-react";

const WhatsAppIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const NotificationsSettings = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { showSuccess, showError } = useErrorHandling();

  const settings = useAppSelector((state) => state.notificationSettings?.settings);
  const loading = useAppSelector((state) => state.notificationSettings?.loading);

  const [isUpdating, setIsUpdating] = useState(false);
  const hasFetchedRef = useRef(false);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    if (!settings && !loading) {
      fetchSettings();
    }
  }, [settings, loading]);

  const fetchSettings = async () => {
    if (hasFetchedRef.current || isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      await dispatch(getNotificationSettings()).unwrap();
      hasFetchedRef.current = true;
    } catch (error) {
      showError(error || "Failed to fetch notification settings");
    } finally {
      isFetchingRef.current = false;
    }
  };

  const handleUpdate = async (updatedData) => {
    try {
      setIsUpdating(true);
      await dispatch(updateNotificationSettings(updatedData)).unwrap();
    } catch (error) {
      showError(error || "Failed to update settings");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReset = async () => {
    try {
      setIsUpdating(true);
      await dispatch(resetNotificationSettings()).unwrap();
    } catch (error) {
      showError(error || "Failed to reset settings");
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleChannel = (channel) => {
    if (!settings) return;
    const updated = {
      ...settings,
      channels: {
        ...settings.channels,
        [channel]: !settings.channels[channel]
      }
    };
    handleUpdate(updated);
  };

  const toggleCategoryChannel = (category, channel) => {
    if (!settings) return;
    const updated = {
      ...settings,
      categories: {
        ...settings.categories,
        [category]: {
          ...settings.categories[category],
          [channel]: !settings.categories[category][channel]
        }
      }
    };
    handleUpdate(updated);
  };

  if (loading && !settings) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[rgb(var(--color-primary))]" />
        <p className="text-sm text-[rgb(var(--color-text-secondary))]">{t("settings.notifications.loadingPreferences")}</p>
      </div>
    );
  }

  if (!settings) return null;

  const channelIcons = {
    email: <Mail className="w-4 h-4" />,
    sms: <MessageSquare className="w-4 h-4" />,
    push: <Smartphone className="w-4 h-4" />,
    whatsapp: <WhatsAppIcon className="w-4 h-4" />
  };

  const categoryIcons = {
    account: <User className="w-5 h-5" />,
    orders: <ShoppingCart className="w-5 h-5" />,
    promotions: <Percent className="w-5 h-5" />,
    billing: <CreditCard className="w-5 h-5" />,
    security: <Shield className="w-5 h-5" />
  };

  return (
    <div className="space-y-8 pb-10 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[rgb(var(--color-text-primary))]">
            {t("settings.notificationSettings")}
          </h2>
          <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">
            {t("settings.manageNotifications")}
          </p>
        </div>
        <button
          onClick={handleReset}
          disabled={isUpdating}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))]/10 rounded-lg transition-colors border border-[rgb(var(--color-primary))]/20 cursor-pointer disabled:opacity-50"
        >
          <RotateCcw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
          {t("settings.notifications.resetToDefaults")}
        </button>
      </div>

      {/* Global Channel Settings */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--color-text-tertiary))] px-1">
          {t("settings.notifications.masterChannels")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(settings.channels || {}).map(([channel, isEnabled]) => (
            <div
              key={channel}
              className={`group p-4 rounded-lg border transition-all backdrop-blur-sm bg-[rgb(var(--color-bg-primary))]/20 ${isEnabled
                ? "border-[rgb(var(--color-primary))]/30"
                : "border-[rgb(var(--color-border-primary))]/50"
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg transition-colors ${isEnabled ? 'bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))]' : 'bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-text-tertiary))]'}`}>
                    {channelIcons[channel] || <Bell className="w-4 h-4" />}
                  </div>
                  <span className={`text-sm font-semibold capitalize ${isEnabled ? 'text-[rgb(var(--color-text-primary))]' : 'text-[rgb(var(--color-text-secondary))]'}`}>
                    {t(`settings.notifications.${channel}`)}
                  </span>
                </div>
                <Toggle
                  enabled={isEnabled}
                  onChange={() => toggleChannel(channel)}
                  disabled={isUpdating}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Granular Category Settings */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--color-text-tertiary))] px-1">
          {t("settings.notifications.activityCategories")}
        </h3>
        <div className="space-y-4">
          {Object.entries(settings.categories || {}).map(([category, categoryChannels]) => (
            <div
              key={category}
              className="p-5 rounded-2xl border border-[rgb(var(--color-border-primary))]/40 bg-[rgb(var(--color-bg-primary))]/10 backdrop-blur-md"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-[rgb(var(--color-bg-primary))]/40 text-[rgb(var(--color-primary))] border border-[rgb(var(--color-border-primary))]/20">
                    {categoryIcons[category] || <Bell className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-[rgb(var(--color-text-primary))]">
                      {t(`settings.notifications.${category}`)}
                    </h4>
                    <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-0.5">
                      {t("settings.notifications.configureCategory")} {t(`settings.notifications.${category}`)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {Object.entries(categoryChannels || {}).map(([channel, isEnabled]) => {
                    const masterEnabled = settings.channels?.[channel];
                    return (
                      <div
                        key={channel}
                        className={`flex items-center gap-3 px-3 py-1.5 rounded-lg border transition-all ${isEnabled && masterEnabled
                          ? "bg-[rgb(var(--color-primary))]/5 border-[rgb(var(--color-primary))]/20"
                          : "bg-[rgb(var(--color-bg-primary))]/20 border-transparent opacity-60"
                          }`}
                      >
                        <div className={`p-1 rounded-md ${isEnabled && masterEnabled ? 'text-[rgb(var(--color-primary))]' : 'text-[rgb(var(--color-text-tertiary))]'}`}>
                          {channelIcons[channel]}
                        </div>
                        <Toggle
                          size="sm"
                          enabled={isEnabled}
                          onChange={() => toggleCategoryChannel(category, channel)}
                          disabled={isUpdating || !masterEnabled}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const Toggle = ({ enabled, onChange, disabled, size = "md" }) => {
  const isSmall = size === "sm";
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex items-center rounded-full transition-all duration-300 ${isSmall ? 'h-5 w-9' : 'h-6 w-11'} ${enabled ? "bg-[rgb(var(--color-primary))]" : "bg-[rgb(var(--color-border-primary))]/80"
        } ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer hover:scale-105 active:scale-95"}`}
    >
      <span
        className={`inline-block rounded-full bg-white transition-transform ${isSmall ? 'h-3.5 w-3.5' : 'h-4 w-4'
          } ${enabled ? (isSmall ? "translate-x-5" : "translate-x-6") : (isSmall ? "translate-x-0.5" : "translate-x-1")}`}
      />
    </button>
  );
};

export default NotificationsSettings;
