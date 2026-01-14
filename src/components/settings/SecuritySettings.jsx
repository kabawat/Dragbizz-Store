"use client"
import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Save } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const SecuritySettings = () => {
  const { t } = useTranslation();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setShowChangePassword(false);
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">{t('settings.securitySettings')}</h2>
        <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">
          {t('settings.manageAccountSecurity')}
        </p>
      </div>

      <div className="bg-[rgb(var(--color-bg-primary))]/20 backdrop-blur-md rounded-lg border border-[rgb(var(--color-border-primary))]/50 p-6">
        {!showChangePassword ? (
          <button
            onClick={() => setShowChangePassword(true)}
            className="w-full p-4 border-2 border-dashed border-[rgb(var(--color-border-primary))] rounded-lg hover:border-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))]/5 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 bg-[rgb(var(--color-primary))]/10 rounded-lg flex items-center justify-center">
                <Lock className="w-6 h-6 text-[rgb(var(--color-primary))]" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">{t('settings.changePassword')}</p>
                <p className="text-xs text-[rgb(var(--color-text-secondary))]">{t('settings.updatePassword')}</p>
              </div>
            </div>
          </button>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                {t('settings.currentPassword')}
              </label>
              <div className="relative">
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  name="oldPassword"
                  value={passwordData.oldPassword}
                  onChange={handleChange}
                  placeholder={t('settings.enterCurrentPassword')}
                  className="w-full px-4 py-2 pr-10 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]"
                >
                  {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                {t('settings.newPassword')}
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handleChange}
                  placeholder={t('settings.enterNewPassword')}
                  className="w-full px-4 py-2 pr-10 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                {t('settings.confirmNewPassword')}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handleChange}
                  placeholder={t('settings.confirmNewPasswordPlaceholder')}
                  className="w-full px-4 py-2 pr-10 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setShowChangePassword(false);
                  setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                }}
                className="flex-1 px-4 py-2 border border-[rgb(var(--color-border-primary))] rounded-lg hover:bg-[rgb(var(--color-bg-tertiary))] transition-colors cursor-pointer"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[rgb(var(--color-primary))] text-white rounded-lg hover:bg-[rgb(var(--color-primary))]/90 transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {t('settings.updatePassword')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecuritySettings;

