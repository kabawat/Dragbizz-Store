"use client";
import { ViewCancelInvoiceModalPresentation } from "@dragorbit/features/invoices";

import { useTranslation } from "@/hooks/ui/useTranslation";
import { invoiceService } from "@/service";
import { useApiResponse } from "@/hooks/useApiResponse";

const CancelInvoiceModal = ({
  isOpen,
  onClose,
  invoiceId,
  invoiceNumber,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { execute, loading: isCancelling } = useApiResponse();

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!invoiceId) return;

    const result = await execute(
      invoiceService.cancelInvoice(invoiceId, "Cancelled by user"),
      {
        message: t("success.cancelledSuccessfully", {
          item: t("common.invoice"),
        }),
      },
    );

    if (result?.success) {
      if (onSuccess) onSuccess();
      onClose();
    }
  };

  return (
    <ViewCancelInvoiceModalPresentation
      model={{ t, invoiceNumber, onClose, isCancelling, handleConfirm }}
    />
  );
};

export default CancelInvoiceModal;
