"use client";
import { X, XCircle } from "lucide-react";
import { Button } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";

const ProductErrorModal = ({
  isOpen,
  onClose,
  title,
  message = "Something went wrong",
  details = null,
}) => {
  const { t } = useTranslation();
  const defaultTitle = title || t("common.error");
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-[2px] bg-black/10 flex items-center justify-center z-[9999] transition-all duration-300">
      <div className="bg-gradient-to-br from-[rgb(var(--color-bg-primary))] to-[rgb(var(--color-bg-secondary))] rounded-2xl border border-[rgb(var(--color-border-primary))] shadow-2xl max-w-md w-full mx-4 transform transition-all duration-500">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[rgb(var(--color-border-primary))]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                  {defaultTitle}
                </h2>
                <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                  {t("products.pleaseTryAgain")}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[rgb(var(--color-bg-tertiary))] rounded-lg transition-colors duration-200"
            >
              <X className="w-5 h-5 text-[rgb(var(--color-text-secondary))]" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <div className="mb-6">
            <p className="text-[rgb(var(--color-text-primary))] mb-3">
              {message}
            </p>
            {details && (
              <div className="bg-[rgb(var(--color-bg-tertiary))] rounded-lg p-3 border border-[rgb(var(--color-border-primary))]">
                <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                  {details}
                </p>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={onClose}
              className="px-6 h-10 text-sm font-semibold bg-[rgb(var(--color-primary))] text-white"
            >
              {t("common.ok")}
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[rgb(var(--color-bg-tertiary))] border-t border-[rgb(var(--color-border-primary))] rounded-b-2xl">
          <p className="text-xs text-[rgb(var(--color-text-tertiary))] text-center">
            {t("products.ifProblemPersists")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductErrorModal;
