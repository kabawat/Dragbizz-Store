"use client";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";

const CancelInvoiceModal = ({
  isOpen,
  onClose,
  onConfirm,
  invoiceNumber,
  isCancelling,
}) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 max-w-md w-full mx-4 border border-[rgb(var(--color-border-primary))]">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-[rgb(var(--color-warning))]/10 rounded-full flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-[rgb(var(--color-warning))]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
              {t("invoices.cancelInvoice")}
            </h3>
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">
              {t("invoices.cancelInvoiceDescription")}
            </p>
          </div>
        </div>
        <p className="text-[rgb(var(--color-text-primary))] mb-6">
          {t("invoices.cancelConfirmMessage", { invoiceNumber })}{" "}
          {t("invoices.cancelActionCanBeReversed")}
        </p>
        <div className="flex space-x-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
            disabled={isCancelling}
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 bg-[rgb(var(--color-warning))] hover:bg-[rgb(var(--color-warning))]/90"
            disabled={isCancelling}
          >
            {isCancelling ? t("invoices.cancelling") : t("invoices.yesCancel")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CancelInvoiceModal;
