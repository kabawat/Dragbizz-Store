"use client";
import { TableSkeleton } from "@dragorbit/ui";
import { NotificationsSettingsView } from "@dragorbit/features/settings";

import {
  CreditCard,
  Mail,
  MessageSquare,
  Percent,
  Shield,
  ShoppingCart,
  Smartphone,
  User,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { useFcmContext } from "@/contexts/FcmContext";
import { useGlobalToast } from "@/contexts/ToastContext";
import {
  getPushPermission,
  pushMessageKey,
  enablePush,
  disablePush,
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
    (state) => state.notificationSettings?.settings,
  );
  const loading = useAppSelector(
    (state) => state.notificationSettings?.loading,
  );
  const { permission: fcmPermission } = useFcmContext();
  const pushPermission = getPushPermission();
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
        const result = await enablePush();
        setIsUpdating(false);

        if (!result.success) {
          const messageKey =
            result.message || pushMessageKey(result.permission);
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
        await disablePush();
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
      <TableSkeleton />
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
    <NotificationsSettingsView
      model={{
        t,
        handleReset,
        isUpdating,
        MASTER_CHANNEL_ORDER,
        settings,
        isPushBlocked,
        channelIcons,
        setIsPushHelpOpen,
        Toggle,
        toggleChannel,
        effectivePushPermission,
        categoryIcons,
        toggleCategoryChannel,
        isPushHelpOpen,
      }}
    />
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
