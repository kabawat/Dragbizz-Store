"use client";
import { ViewDeleteInvoiceModalPresentation } from "@dragorbit/features/invoices";
import { useRouter } from "next/navigation";
import { memo, useCallback, useMemo } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useApiResponse } from "@/hooks/useApiResponse";
import { invoiceService } from "@/service";

const DeleteInvoiceModal = ({ isOpen, onClose, invoiceId, invoiceNumber }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { execute, loading: isDeleting } = useApiResponse();

  const handleConfirm = useCallback(async () => {
    if (!invoiceId) return;

    const result = await execute(invoiceService.deleteInvoice(invoiceId), {
      message: t("success.deletedSuccessfully", { item: t("common.invoice") }),
    });

    if (result?.success) {
      setTimeout(() => {
        router.push("/dashboard/invoices");
      }, 1000);
    }
  }, [invoiceId, execute, t, router]);

  const model = useMemo(
    () => ({ t, invoiceNumber, onClose, isDeleting, handleConfirm }),
    [t, invoiceNumber, onClose, isDeleting, handleConfirm]
  );

  if (!isOpen) return null;

  return <ViewDeleteInvoiceModalPresentation model={model} />;
};

export default memo(DeleteInvoiceModal);
