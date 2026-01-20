"use client";
import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function LogoutModal({ onClose, onConfirm }) {
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
            className="w-8 h-8 bg-[rgb(var(--color-bg-secondary))] hover:bg-[rgb(var(--color-bg-tertiary))] rounded-full flex items-center justify-center transition-colors"
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
              className="flex-1 px-4 py-2.5 bg-[rgb(var(--color-bg-secondary))] hover:bg-[rgb(var(--color-bg-tertiary))] text-[rgb(var(--color-text-primary))] rounded-lg font-medium transition-colors"
            >
              {t("common.cancel")}
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 bg-[rgb(var(--color-danger))] hover:bg-[rgb(var(--color-danger))]/90 text-white rounded-lg font-medium transition-colors"
            >
              {t("header.signOut")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render modal using portal to ensure it's on top of everything
  return createPortal(modalContent, document.body);
}
