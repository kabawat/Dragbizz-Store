"use client";
import { Save, User } from "lucide-react";
import { FormDrawer } from "@/components/common";
import useErrorHandling from "@/hooks/useErrorHandling";
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

  const { showSuccess, showError } = useErrorHandling();

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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">
          Profile Settings
        </h2>
        <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">
          Manage your personal information and profile details
        </p>
      </div>

      {/* Profile Picture Section */}
      <ProfilePictureSection
        firstName={form.firstName}
        lastName={form.lastName}
        email={apiUser?.email || user?.email}
        phone={apiUser?.phone || user?.phone}
        countryCode={apiUser?.countryCode || user?.countryCode}
      />

      {/* Personal Information Section */}
      <PersonalInfoSection
        form={form}
        apiUser={apiUser}
        user={user}
        onEditClick={handleOpenEdit}
      />

      {/* Account Actions */}
      {!isEditing && <AccountActionsSection />}

      {/* Edit Drawer */}
      <FormDrawer
        isOpen={isEditing}
        onClose={handleCancel}
        title="Edit Profile"
        icon={User}
        description="Update your personal information"
        width="w-full md:w-2/3 lg:w-1/2"
        onSave={handleSave}
        onCancel={handleCancel}
        saveLabel={isSaving ? "Saving..." : "Save Changes"}
        cancelLabel="Cancel"
        isSaving={isSaving}
        saveIcon={Save}
        saveVariant="primary"
      >
        <ProfileEditForm form={form} onChange={handleChange} />
      </FormDrawer>

      {/* Toast Container */}
    </div>
  );
};

export default ProfileSettings;
