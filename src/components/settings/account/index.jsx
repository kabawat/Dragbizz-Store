"use client"
import { useState } from 'react';
import { Save, Settings } from 'lucide-react';
import { FormDrawer } from '@/components/common';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/ui';
import { useAccountData } from './useAccountData';
import AccountPreferencesSection from './AccountPreferencesSection';

const AccountSettings = () => {
  const {
    settings,
    setSettings,
    handleChange,
    handleToggle,
  } = useAccountData();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toasts, showSuccess, showError, removeToast } = useToast();

  const handleOpenEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      showSuccess('Account preferences updated successfully!');
      setIsEditing(false);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || 'An unexpected error occurred. Please try again.';
      showError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">Account Settings</h2>
        <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">
          Configure your account preferences
        </p>
      </div>

      {/* Account Preferences Section */}
      <AccountPreferencesSection
        settings={settings}
        isEditing={isEditing}
        onEditClick={handleOpenEdit}
        onChange={handleChange}
      />

      {/* Edit Drawer */}
      <FormDrawer
        isOpen={isEditing}
        onClose={handleCancel}
        title="Edit Account Preferences"
        icon={Settings}
        description="Update your account settings"
        width="w-full md:w-2/3 lg:w-1/2"
        onSave={handleSave}
        onCancel={handleCancel}
        saveLabel={isSaving ? 'Saving...' : 'Save Changes'}
        cancelLabel="Cancel"
        isSaving={isSaving}
        saveIcon={Save}
        saveVariant="primary"
      >
        <AccountPreferencesSection
          settings={settings}
          isEditing={true}
          onChange={handleChange}
        />
      </FormDrawer>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default AccountSettings;

