"use client";
import { ConfirmDialog } from "@dragorbit/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
export default function LogoutModal({ onClose, onConfirm, isLoggingOut }) {
  const { t } = useTranslation();
  return (
    <ConfirmDialog
      onClose={onClose}
      onConfirm={onConfirm}
      busy={isLoggingOut}
      title={t("header.signOut")}
      description={t("modals.deleteConfirm")}
      cancelLabel={t("common.cancel")}
      confirmLabel={t("header.signOut")}
    />
  );
}
