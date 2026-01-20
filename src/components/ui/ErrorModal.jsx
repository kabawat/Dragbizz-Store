"use client";
import React from "react";
import { AlertCircle, X } from "lucide-react";
import Button from "./Button";
import { useTranslation } from "@/hooks/useTranslation";

const ErrorModal = ({ isOpen, onClose, title, message, className = "" }) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] backdrop-blur-sm">
      <div
        className={`
        bg-[rgb(var(--color-bg-primary))] 
        rounded-lg 
        border border-[rgb(var(--color-border-primary))] 
        shadow-2xl 
        max-w-md w-full mx-4
        ${className}
      `}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[rgb(var(--color-border-primary))]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
                {title || t("common.error")}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-[rgb(var(--color-bg-tertiary))] rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-[rgb(var(--color-text-secondary))]" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p className="text-[rgb(var(--color-text-secondary))] mb-6">
            {message || t("common.error")}
          </p>

          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={onClose}
              className="px-6 h-10 text-sm font-semibold"
            >
              {t("common.confirm")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
