"use client";
import {
  AlertTriangle,
  Bell,
  CreditCard,
  Loader2,
  Mail,
  MessageSquare,
  Percent,
  RotateCcw,
  Settings2,
  Shield,
  ShoppingCart,
  Smartphone,
  User,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Modal } from "@/components/ui";
import { useFcmContext } from "@/contexts/FcmContext";
import { useGlobalToast } from "@/contexts/ToastContext";
import {
  getNotificationPermissionState,
  getPermissionMessageKey,
  registerPushNotifications,
  unregisterPushNotifications,
} from "@/firebase/notification";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getNotificationSettings,
  resetNotificationSettings,
  updateNotificationSettings,
} from "@/store/slices/notificationSettingsSlice";

const WhatsAppIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const MASTER_CHANNEL_ORDER = ["email", "sms", "whatsapp", "push"];

const NotificationsSettings = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { showSuccess, showError } = useGlobalToast();

  const settings = useAppSelector(
    (state) => state.notificationSettings?.settings
  );
  const loading = useAppSelector(
    (state) => state.notificationSettings?.loading
  );
  const { permission: fcmPermission } = useFcmContext();
  const pushPermission = getNotificationPermissionState();
  const effectivePushPermission =
    pushPermission !== "default" ? pushPermission : fcmPermission;

  const [isUpdating, setIsUpdating] = useState(false);
  const [isPushHelpOpen, setIsPushHelpOpen] = useState(false);
  const hasFetchedRef = useRef(false);
  const isFetchingRef = useRef(false);
  const isPushBlocked = effectivePushPermission === "denied";

  const fetchSettings = useCallback(async () => {
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
  }, [dispatch, showError]);

  useEffect(() => {
    if (!settings && !loading) {
      fetchSettings();
    }
  }, [fetchSettings, settings, loading]);

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

  const toggleChannel = async (channel) => {
    if (!settings) return;

    const willEnable = !settings.channels[channel];

    if (channel === "push") {
      if (isPushBlocked) {
        setIsPushHelpOpen(true);
        return;
      }

      if (willEnable) {
        setIsUpdating(true);
        const result = await registerPushNotifications();
        setIsUpdating(false);

        if (!result.success) {
          const messageKey =
            result.message || getPermissionMessageKey(result.permission);
          if (messageKey === "pushPermissionDenied") {
            setIsPushHelpOpen(true);
            return;
          }
          const translated = t(`settings.notifications.${messageKey}`, {
            defaultValue: "",
          });
          showError(translated || t("settings.notifications.pushEnableFailed"));
          return;
        }
        showSuccess(t("settings.notifications.pushEnabledSuccess"));
      } else {
        setIsUpdating(true);
        await unregisterPushNotifications();
        setIsUpdating(false);
        showSuccess(t("settings.notifications.pushDisabledSuccess"));
      }
    }

    const updated = {
      ...settings,
      channels: {
        ...settings.channels,
        [channel]: willEnable,
      },
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
          [channel]: !settings.categories[category][channel],
        },
      },
    };
    handleUpdate(updated);
  };

  if (loading && !settings) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[rgb(var(--color-primary))]" />
        <p className="text-sm text-[rgb(var(--color-text-secondary))]">
          {t("settings.notifications.loadingPreferences")}
        </p>
      </div>
    );
  }

  if (!settings) return null;

  const channelIcons = {
    email: <Mail className="w-4 h-4" />,
    sms: <MessageSquare className="w-4 h-4" />,
    push: <Smartphone className="w-4 h-4" />,
    whatsapp: <WhatsAppIcon className="w-4 h-4" />,
  };

  const categoryIcons = {
    account: <User className="w-5 h-5" />,
    orders: <ShoppingCart className="w-5 h-5" />,
    promotions: <Percent className="w-5 h-5" />,
    billing: <CreditCard className="w-5 h-5" />,
    security: <Shield className="w-5 h-5" />,
  };

  return (
    <div className="animate-fadeIn space-y-6 pb-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold leading-6 text-[rgb(var(--color-text-primary))]">
            {t("settings.notificationSettings")}
          </h2>
          <p className="mt-0.5 text-sm leading-5 text-[rgb(var(--color-text-secondary))]">
            {t("settings.manageNotifications")}
          </p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          disabled={isUpdating}
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-[rgb(var(--color-primary))]/20 px-3 py-2 text-sm font-medium leading-5 text-[rgb(var(--color-primary))] transition-colors hover:bg-[rgb(var(--color-primary))]/10 disabled:opacity-50"
        >
          <RotateCcw
            className={`w-4 h-4 ${isUpdating ? "animate-spin" : ""}`}
          />
          {t("settings.notifications.resetToDefaults")}
        </button>
      </div>

      {/* Global Channel Settings */}
      <section className="space-y-3">
        <h3 className="px-1 text-sm font-semibold leading-5 text-[rgb(var(--color-text-secondary))]">
          {t("settings.notifications.masterChannels")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {MASTER_CHANNEL_ORDER.filter((channel) =>
            Object.hasOwn(settings.channels || {}, channel)
          ).map((channel) => {
            const isEnabled = settings.channels[channel];
            const hasIssue = channel === "push" && isPushBlocked;
            return (
              <div
                key={channel}
                className={`group rounded-lg border p-4 backdrop-blur-sm transition-all ${
                  hasIssue
                    ? "border-amber-500/40 bg-amber-500/5"
                    : "bg-[rgb(var(--color-bg-primary))]/20"
                } ${
                  !hasIssue && isEnabled
                    ? "border-[rgb(var(--color-primary))]/30"
                    : !hasIssue
                      ? "border-[rgb(var(--color-border-primary))]/50"
                      : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-lg p-2 transition-colors ${
                        hasIssue
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : isEnabled
                            ? "bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))]"
                            : "bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-text-tertiary))]"
                      }`}
                    >
                      {channelIcons[channel] || <Bell className="w-4 h-4" />}
                    </div>
                    <span
                      className={`text-sm font-medium capitalize leading-5 ${isEnabled ? "text-[rgb(var(--color-text-primary))]" : "text-[rgb(var(--color-text-secondary))]"}`}
                    >
                      {t(`settings.notifications.${channel}`)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasIssue && (
                      <button
                        type="button"
                        onClick={() => setIsPushHelpOpen(true)}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-amber-600 transition-colors hover:bg-amber-500/10 dark:text-amber-400"
                        aria-label={t("settings.notifications.pushIssueTitle")}
                      >
                        <AlertTriangle className="h-4 w-4" />
                      </button>
                    )}
                    <Toggle
                      enabled={isEnabled}
                      onChange={() => toggleChannel(channel)}
                      disabled={isUpdating}
                    />
                  </div>
                </div>
                {channel === "push" &&
                  effectivePushPermission === "default" && (
                    <p className="mt-3 text-xs leading-relaxed text-[rgb(var(--color-text-secondary))]">
                      {t("settings.notifications.pushPermissionDefault")}
                    </p>
                  )}
                {hasIssue && (
                  <button
                    type="button"
                    onClick={() => setIsPushHelpOpen(true)}
                    className="mt-3 flex cursor-pointer items-center gap-1.5 text-left text-xs font-medium leading-4 text-amber-600 hover:underline dark:text-amber-400"
                  >
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    {t("settings.notifications.pushIssueAction")}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Granular Category Settings */}
      <section className="space-y-3">
        <h3 className="px-1 text-sm font-semibold leading-5 text-[rgb(var(--color-text-secondary))]">
          {t("settings.notifications.activityCategories")}
        </h3>
        <div className="space-y-4">
          {Object.entries(settings.categories || {}).map(
            ([category, categoryChannels]) => (
              <div
                key={category}
                className="rounded-lg border border-[rgb(var(--color-border-primary))]/40 bg-[rgb(var(--color-bg-primary))]/10 p-4 backdrop-blur-md"
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[rgb(var(--color-border-primary))]/20 bg-[rgb(var(--color-bg-primary))]/40 text-[rgb(var(--color-primary))]">
                      {categoryIcons[category] || <Bell className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold leading-5 text-[rgb(var(--color-text-primary))]">
                        {t(`settings.notifications.${category}`)}
                      </h4>
                      <p className="mt-0.5 text-xs leading-4 text-[rgb(var(--color-text-secondary))]">
                        {t("settings.notifications.configureCategory")}{" "}
                        {t(`settings.notifications.${category}`)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    {Object.entries(categoryChannels || {}).map(
                      ([channel, isEnabled]) => {
                        const masterEnabled = settings.channels?.[channel];
                        return (
                          <div
                            key={channel}
                            className={`flex items-center gap-3 px-3 py-1.5 rounded-lg border transition-all ${
                              isEnabled && masterEnabled
                                ? "bg-[rgb(var(--color-primary))]/5 border-[rgb(var(--color-primary))]/20"
                                : "bg-[rgb(var(--color-bg-primary))]/20 border-transparent opacity-60"
                            }`}
                          >
                            <div
                              className={`p-1 rounded-md ${isEnabled && masterEnabled ? "text-[rgb(var(--color-primary))]" : "text-[rgb(var(--color-text-tertiary))]"}`}
                            >
                              {channelIcons[channel]}
                            </div>
                            <Toggle
                              size="sm"
                              enabled={isEnabled}
                              onChange={() =>
                                toggleCategoryChannel(category, channel)
                              }
                              disabled={isUpdating || !masterEnabled}
                            />
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </section>

      <Modal
        isOpen={isPushHelpOpen}
        onClose={() => setIsPushHelpOpen(false)}
        title={t("settings.notifications.pushIssueTitle")}
        size="lg"
        className="!shadow-none"
      >
        <div className="space-y-4">
          <div className="flex gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-sm leading-5 text-[rgb(var(--color-text-primary))]">
              {t("settings.notifications.pushPermissionDenied")}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold leading-5 text-[rgb(var(--color-text-primary))]">
              {t("settings.notifications.pushIssueSolutionTitle")}
            </h4>
            <div className="mt-3 space-y-2">
              {[
                {
                  icon: Settings2,
                  title: t("settings.notifications.pushIssueStep1Title"),
                  description: t("settings.notifications.pushIssueStep1"),
                },
                {
                  icon: Bell,
                  title: t("settings.notifications.pushIssueStep2Title"),
                  description: t("settings.notifications.pushIssueStep2"),
                },
                {
                  icon: RotateCcw,
                  title: t("settings.notifications.pushIssueStep3Title"),
                  description: t("settings.notifications.pushIssueStep3"),
                },
              ].map(({ icon: StepIcon, title, description }, index) => (
                <div
                  key={title}
                  className="flex gap-3 rounded-lg border border-[rgb(var(--color-border-primary))]/60 bg-[rgb(var(--color-bg-secondary))]/30 p-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))]">
                    <StepIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-5 text-[rgb(var(--color-text-primary))]">
                      {index + 1}. {title}
                    </p>
                    <p className="mt-0.5 text-sm leading-5 text-[rgb(var(--color-text-secondary))]">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 rounded-lg bg-[rgb(var(--color-bg-secondary))]/50 px-3 py-2 text-xs leading-5 text-[rgb(var(--color-text-secondary))]">
              {t("settings.notifications.pushIssueNote")}
            </p>
          </div>
          <div className="flex justify-end border-t border-[rgb(var(--color-border-primary))]/60 pt-4">
            <Button variant="primary" onClick={() => setIsPushHelpOpen(false)}>
              {t("common.close")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const Toggle = ({ enabled, onChange, disabled, size = "md" }) => {
  const isSmall = size === "sm";
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex items-center rounded-full transition-all duration-300 ${isSmall ? "h-5 w-9" : "h-6 w-11"} ${
        enabled
          ? "bg-[rgb(var(--color-primary))]"
          : "bg-[rgb(var(--color-border-primary))]/80"
      } ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer hover:scale-105 active:scale-95"}`}
    >
      <span
        className={`inline-block rounded-full bg-white transition-transform ${
          isSmall ? "h-3.5 w-3.5" : "h-4 w-4"
        } ${enabled ? (isSmall ? "translate-x-5" : "translate-x-6") : isSmall ? "translate-x-0.5" : "translate-x-1"}`}
      />
    </button>
  );
};

export default NotificationsSettings;
