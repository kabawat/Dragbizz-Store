"use client";
import { ProfileSettingsView } from "@dragorbit/features/settings";

import { FormDrawer } from "@/components/common";
import { useGlobalToast } from "@/contexts/ToastContext";
import authService from "@/service/auth/auth.service";
import { useAppDispatch } from "@/store/hooks";
import { getAuthProfile } from "@/store/slices/profileSlice";
import AccountActionsSection from "./AccountActionsSection";
import PersonalInfoSection from "./PersonalInfoSection";
import ProfileEditForm from "./ProfileEditForm";
import ProfilePictureSection from "./ProfilePictureSection";
import { useProfileData } from "./useProfileData";

const ProfileSettings = ({ user }) => {
  const dispatch = useAppDispatch();
  const {
    isEditing,
    apiUser,
    isSaving,
    setIsSaving,
    form,
    setForm,
    setApiUser,
    handleChange,
    handleOpenEdit,
    handleCancel,
  } = useProfileData(user);

  const { showSuccess, showError } = useGlobalToast();

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Prepare payload - only send fields that have values
      const payload = {};
      if (form.firstName?.trim()) payload.firstName = form.firstName.trim();
      if (form.lastName?.trim()) payload.lastName = form.lastName.trim();
      if (form.dob) payload.dob = form.dob;
      if (form.gender) payload.gender = form.gender;

      const result = await authService.updateProfile(payload);

      if (result?.success) {
        // Update local state with response data
        const updated =
          (result.data && (result.data.data || result.data)) || payload;
        setApiUser((prev) => ({ ...(prev || {}), ...updated }));

        // Update form state to reflect saved values
        setForm((prev) => ({
          ...prev,
          firstName: updated.firstName || prev.firstName,
          lastName: updated.lastName || prev.lastName,
          dob: updated.dob ? String(updated.dob).slice(0, 10) : prev.dob,
          gender: updated.gender || prev.gender,
        }));

        // Refresh global auth profile in Redux so all places get latest data
        dispatch(getAuthProfile());

        showSuccess(result.message || "Profile updated successfully!");
        handleCancel();
      } else {
        // Show error message from API
        const errorMessage =
          result?.message ||
          result?.error?.message ||
          "Failed to update profile. Please try again.";
        showError(errorMessage);
      }
    } catch (error) {
      // Handle unexpected errors
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "An unexpected error occurred. Please try again.";
      showError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProfileSettingsView
      model={{
        ProfilePictureSection,
        form,
        apiUser,
        user,
        PersonalInfoSection,
        handleOpenEdit,
        isEditing,
        AccountActionsSection,
        FormDrawer,
        handleCancel,
        handleSave,
        isSaving,
        ProfileEditForm,
        handleChange,
      }}
    />
  );
};

export default ProfileSettings;
