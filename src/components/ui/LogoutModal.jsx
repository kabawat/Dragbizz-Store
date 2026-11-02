"use client";

import { Button, Modal, Tooltip as SharedTooltip } from "@dragorbit/ui";
import { AlertTriangle } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppSelector } from "@/store/hooks";

export default function LogoutModal({
  isOpen = true,
  onClose,
  onConfirm,
  isLoggingOut = false,
}) {
  const { t } = useTranslation();

  const profileState = useAppSelector((state) => state?.profile) || {};
  const { user, authProfile } = profileState;

  const userName =
    authProfile?.firstName && authProfile?.lastName
      ? `${authProfile.firstName} ${authProfile.lastName}`
      : authProfile?.firstName ||
        authProfile?.email ||
        user?.name ||
        user?.email ||
        null;

  const userEmail = authProfile?.email || user?.email || null;
  const userAvatar = user?.profile || authProfile?.profile || null;
  const userRole = authProfile?.role || user?.role || null;

  const formattedRole = userRole
    ? userRole
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isLoggingOut) onClose?.();
      }}
      closeOnOverlayClick={!isLoggingOut}
      closeOnEscape={!isLoggingOut}
      title={t("header.signOut", "Sign Out")}
      className="w-full max-w-md"
      footer={
        <>
          <Button variant="secondary" disabled={isLoggingOut} onClick={onClose}>
            {t("common.cancel", "Cancel")}
          </Button>
          <Button variant="danger" loading={isLoggingOut} onClick={onConfirm}>
            {isLoggingOut
              ? t("header.signingOut", "Signing Out...")
              : t("header.signOut", "Sign Out")}
          </Button>
        </>
      }
    >
      <div className="p-6 space-y-4">
        {/* Main Alert Info */}
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full bg-[rgb(var(--color-warning))]/15 flex items-center justify-center shrink-0">
            <AlertTriangle
              className="h-5 w-5 text-[rgb(var(--color-warning))]"
              aria-hidden
            />
          </div>
          <div className="space-y-1 pt-0.5">
            <h4 className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
              {t("header.signOutPrompt", "Are you sure you want to sign out?")}
            </h4>
            <p className="text-xs text-[rgb(var(--color-text-secondary))] leading-relaxed">
              {t(
                "header.signOutDescription",
                "You will need to log back in to access your store and dashboard."
              )}
            </p>
          </div>
        </div>

        {/* User Account Card */}
        {userName && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border-primary))]">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[rgb(var(--color-primary))] to-[rgb(var(--color-secondary))] flex items-center justify-center overflow-hidden shrink-0 border border-[rgb(var(--color-border-primary))]/40">
              {userAvatar ? (
                <Image
                  src={userAvatar}
                  alt={userName}
                  width={36}
                  height={36}
                  unoptimized
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs font-semibold text-white uppercase">
                  {userName.charAt(0)}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-[rgb(var(--color-text-primary))] truncate">
                  {userName}
                </p>
                <SharedTooltip content={"Active session"}><span
                  className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"

                /></SharedTooltip>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[rgb(var(--color-text-tertiary))] truncate">
                {userEmail && <span className="truncate">{userEmail}</span>}
                {formattedRole && (
                  <>
                    <span>•</span>
                    <span className="text-[rgb(var(--color-text-secondary))] font-medium truncate">
                      {formattedRole}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
