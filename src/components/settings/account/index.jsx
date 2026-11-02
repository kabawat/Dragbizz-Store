"use client";
import { AccountSettingsView } from "@dragorbit/features/settings";

import { useState } from "react";
import { FormDrawer } from "@/components/common";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useTranslation } from "@/hooks/ui/useTranslation";
import AccountPreferencesSection from "./AccountPreferencesSection";
import { useAccountData } from "./useAccountData";

const AccountSettings = () => {
  const { t } = useTranslation();
  const { settings, setSettings, handleChange, handleToggle } =
    useAccountData();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { showSuccess, showError } = useGlobalToast();

  const handleOpenEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      await new Promise((resolve) => setTimeout(resolve, 500));

      showSuccess(t("settings.accountPreferencesUpdatedSuccess"));
      setIsEditing(false);
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        t("errors.unexpectedError");
      showError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AccountSettingsView
      model={{
        t,
        AccountPreferencesSection,
        settings,
        isEditing,
        handleOpenEdit,
        handleChange,
        FormDrawer,
        handleCancel,
        handleSave,
        isSaving,
      }}
    />
  );
};

export default AccountSettings;
