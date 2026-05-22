"use client";
import { AlertTriangle, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useTranslation } from "@/hooks/ui/useTranslation";

export default function LogoutModal({ onClose, onConfirm, isLoggingOut }) {
  const { t } = useTranslation();
  const modalContent = (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      style={{
        zIndex: 2147483647, // Maximum z-index value
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(4px)",
      }}
      onClick={(e) => {
        // Only close if clicking the backdrop, not the modal content
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-xl shadow-2xl max-w-md w-full"
        style={{
          zIndex: 2147483647, // Maximum z-index value
          position: "relative",
          backgroundColor: "rgb(var(--color-bg-primary))",
          border: "1px solid rgb(var(--color-border-primary))",
          borderRadius: "12px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          maxWidth: "28rem",
          width: "100%",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[rgb(var(--color-border-primary))]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[rgb(var(--color-warning))]/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-[rgb(var(--color-warning))]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
                {t("header.signOut")}
              </h3>
              <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                {t("modals.deleteConfirm")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoggingOut}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isLoggingOut
                ? 'bg-[rgb(var(--color-bg-secondary))] opacity-50 cursor-not-allowed'
                : 'bg-[rgb(var(--color-bg-secondary))] hover:bg-[rgb(var(--color-bg-tertiary))] cursor-pointer'
              }`}
          >
            <X className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-[rgb(var(--color-text-primary))] mb-2">
              {t("modals.deleteConfirm")}
            </p>
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">
              {t("modals.deleteConfirmMessage")}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isLoggingOut}
              className={`flex-1 px-4 py-2.5 bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-text-primary))] rounded-lg font-medium transition-colors ${isLoggingOut
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-[rgb(var(--color-bg-tertiary))] cursor-pointer'
                }`}
            >
              {t("common.cancel")}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoggingOut}
              className={`flex-1 px-4 py-2.5 bg-[rgb(var(--color-danger))] text-white rounded-lg font-medium transition-colors flex items-center justify-center ${isLoggingOut
                  ? 'opacity-70 cursor-not-allowed'
                  : 'hover:bg-[rgb(var(--color-danger))]/90 cursor-pointer'
                }`}
            >
              {isLoggingOut ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t("header.signOut") || "Signing out..."}
                </>
              ) : (
                t("header.signOut")
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render modal using portal to ensure it's on top of everything
  return createPortal(modalContent, document.body);
}
