"use client";
import { SecuritySettingsView } from "@dragorbit/features/settings";

import { useState } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";

import { useApiResponse } from "@/hooks/useApiResponse";
import authService from "@/service/auth/auth.service";

const SecuritySettings = () => {
  const { t } = useTranslation();
  const { execute, loading: updatePasswordLoading } = useApiResponse();

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [error, setError] = useState("");
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const validate = () => {
    if (!passwordData.oldPassword) {
      setError(
        t("settings.oldPasswordRequired") || "Current password is required",
      );
      return false;
    }
    if (passwordData.newPassword.length < 8) {
      setError(
        t("settings.passwordMinLength") ||
          "New password must be at least 8 characters",
      );
      return false;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError(t("settings.passwordsDoNotMatch") || "Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const result = await execute(
      authService.updatePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      }),
      {
        showToast: true,
        message:
          t("settings.passwordUpdatedSuccess") ||
          "Password updated successfully",
      },
    );

    if (result.success) {
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowChangePassword(false);
    } else if (result.message) {
      setError(result.message);
    }
  };

  return (
    <SecuritySettingsView
      model={{
        t,
        showChangePassword,
        setShowChangePassword,
        error,
        showOldPassword,
        passwordData,
        handleChange,
        updatePasswordLoading,
        setShowOldPassword,
        showNewPassword,
        setShowNewPassword,
        showConfirmPassword,
        setShowConfirmPassword,
        setPasswordData,
        setError,
        handleSave,
      }}
    />
  );
};

export default SecuritySettings;
