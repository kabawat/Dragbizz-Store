"use client";
import { Eye, EyeOff, Lock, Save, AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useGlobalToast } from "@/contexts/ToastContext";
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
      setError(t("settings.oldPasswordRequired") || "Current password is required");
      return false;
    }
    if (passwordData.newPassword.length < 8) {
      setError(t("settings.passwordMinLength") || "New password must be at least 8 characters");
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
        newPassword: passwordData.newPassword
      }),
      {
        showToast: true,
        message: t("settings.passwordUpdatedSuccess") || "Password updated successfully"
      }
    );

    if (result.success) {
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setShowChangePassword(false);
    } else if (result.message) {
      setError(result.message);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[rgb(var(--color-text-primary))]">
          {t("settings.securitySettings")}
        </h2>
        <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">
          {t("settings.manageAccountSecurity")}
        </p>
      </div>

      <div className="bg-[rgb(var(--color-bg-primary))]/20 backdrop-blur-md rounded-xl border border-[rgb(var(--color-border-primary))]/50 overflow-hidden">
        <div className="p-6">
          {!showChangePassword ? (
            <button onClick={() => setShowChangePassword(true)} className="w-full p-6 border-2 border-dashed border-[rgb(var(--color-border-primary))] rounded-xl hover:border-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))]/5 transition-all duration-300 group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[rgb(var(--color-primary))]/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Lock className="w-6 h-6 text-[rgb(var(--color-primary))]" />
                </div>
                <div className="text-left">
                  <p className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                    {t("settings.changePassword")}
                  </p>
                  <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                    {t("settings.updatePasswordDescription") || "Protect your account with a strong password"}
                  </p>
                </div>
              </div>
            </button>
          ) : (
            <div className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div Name="form-group">
                  <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1.5">
                    {t("settings.currentPassword")}
                  </label>
                  <div className="relative">
                    <input
                      type={showOldPassword ? "text" : "password"}
                      name="oldPassword"
                      value={passwordData.oldPassword}
                      onChange={handleChange}
                      placeholder={t("settings.enterCurrentPassword")}
                      className="w-full px-4 py-2.5 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]/50 transition-all"
                      disabled={updatePasswordLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-primary))] transition-colors"
                      disabled={updatePasswordLoading}
                    >
                      {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div Name="form-group">
                  <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1.5">
                    {t("settings.newPassword")}
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handleChange}
                      placeholder={t("settings.enterNewPassword")}
                      className="w-full px-4 py-2.5 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]/50 transition-all"
                      disabled={updatePasswordLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-primary))] transition-colors"
                      disabled={updatePasswordLoading}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div Name="form-group">
                  <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1.5">
                    {t("settings.confirmNewPassword")}
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handleChange}
                      placeholder={t("settings.confirmNewPasswordPlaceholder")}
                      className="w-full px-4 py-2.5 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]/50 transition-all"
                      disabled={updatePasswordLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-primary))] transition-colors"
                      disabled={updatePasswordLoading}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowChangePassword(false);
                    setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
                    setError("");
                  }}
                  className="flex-1 px-4 py-2.5 border border-[rgb(var(--color-border-primary))] rounded-lg hover:bg-[rgb(var(--color-bg-tertiary))] transition-all font-medium text-sm disabled:opacity-50 cursor-pointer"
                  disabled={updatePasswordLoading}
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={handleSave}
                  disabled={updatePasswordLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[rgb(var(--color-primary))] text-white rounded-lg hover:bg-[rgb(var(--color-primary))]/90 transition-all font-medium text-sm disabled:opacity-70 cursor-pointer"
                >
                  {updatePasswordLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {updatePasswordLoading ? t("common.saving") : t("settings.updatePassword")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
