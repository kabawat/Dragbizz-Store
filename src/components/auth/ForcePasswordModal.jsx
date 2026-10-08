"use client";
import { ForcePasswordForm } from "@dragorbit/ui/app";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { authService } from "@/service";
import { useAppDispatch } from "@/store/hooks";
import { getAuthProfile } from "@/store/slices/profileSlice";
import { handleApiError } from "@/utils/errorHandler";
export default function ForcePasswordModal({ isOpen }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const onSubmit = async (password) => {
    const result = await authService.updatePassword({
      oldPassword: "",
      newPassword: password,
    });
    if (result.success) await dispatch(getAuthProfile());
    return result;
  };
  return (
    <ForcePasswordForm
      isOpen={isOpen}
      onSubmit={onSubmit}
      t={t}
      getError={(error) => handleApiError(error, "update-password")}
    />
  );
}
