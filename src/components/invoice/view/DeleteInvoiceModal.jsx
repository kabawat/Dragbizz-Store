"use client";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";
import { useGlobalToast } from "@/contexts/ToastContext";
import { invoiceService } from "@/service";

const DeleteInvoiceModal = ({
  isOpen,
  onClose,
  invoiceId,
  invoiceNumber,
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { showSuccess, showError } = useGlobalToast();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!invoiceId) return;

    setIsDeleting(true);
    try {
      const result = await invoiceService.deleteInvoice(invoiceId);

      if (result.success) {
        showSuccess(
          t("success.deletedSuccessfully", { item: t("common.invoice") })
        );
        setTimeout(() => {
          router.push("/dashboard/invoices");
        }, 1000);
      } else {
        showError(
          result.message ||
          t("errors.failedToDelete", { item: t("common.invoice") })
        );
      }
    } catch (_error) {
      showError(
        t("errors.failedToDeleteTryAgain", { item: t("common.invoice") })
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 max-w-md w-full mx-4 border border-[rgb(var(--color-border-primary))]">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-[rgb(var(--color-danger))]/10 rounded-full flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-[rgb(var(--color-danger))]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
              {t("invoices.deleteInvoice")}
            </h3>
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">
              {t("invoices.deleteActionCannotBeUndone")}
            </p>
          </div>
        </div>
        <p className="text-[rgb(var(--color-text-primary))] mb-6">
          {t("invoices.deleteConfirmMessage", { invoiceNumber })}{" "}
          {t("invoices.deletePermanentlyRemove")}
        </p>
        <div className="flex space-x-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
            disabled={isDeleting}
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 bg-[rgb(var(--color-danger))] hover:bg-[rgb(var(--color-danger))]/90"
            disabled={isDeleting}
            loading={isDeleting}
          >
            {isDeleting ? t("common.deleting") : t("common.delete")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteInvoiceModal;
