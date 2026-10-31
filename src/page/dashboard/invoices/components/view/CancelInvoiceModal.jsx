"use client";
import { ViewCancelInvoiceModalPresentation } from "@dragorbit/features/invoices";
import { memo, useCallback, useMemo } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useApiResponse } from "@/hooks/useApiResponse";
import { invoiceService } from "@/service";

const CancelInvoiceModal = ({
  isOpen,
  onClose,
  invoiceId,
  invoiceNumber,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { execute, loading: isCancelling } = useApiResponse();

  const handleConfirm = useCallback(async () => {
    if (!invoiceId) return;

    const result = await execute(
      invoiceService.cancelInvoice(invoiceId, "Cancelled by user"),
      {
        message: t("success.cancelledSuccessfully", {
          item: t("common.invoice"),
        }),
      }
    );

    if (result?.success) {
      if (onSuccess) onSuccess();
      onClose();
    }
  }, [invoiceId, execute, t, onSuccess, onClose]);

  const model = useMemo(
    () => ({ t, invoiceNumber, onClose, isCancelling, handleConfirm }),
    [t, invoiceNumber, onClose, isCancelling, handleConfirm]
  );

  if (!isOpen) return null;

  return <ViewCancelInvoiceModalPresentation model={model} />;
};

export default memo(CancelInvoiceModal);
