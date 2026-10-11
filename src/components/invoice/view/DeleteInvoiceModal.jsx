"use client";
import { ViewDeleteInvoiceModalPresentation } from "@dragorbit/features/invoices";

import { useRouter } from "next/navigation";

import { useTranslation } from "@/hooks/ui/useTranslation";
import { invoiceService } from "@/service";
import { useApiResponse } from "@/hooks/useApiResponse";

const DeleteInvoiceModal = ({ isOpen, onClose, invoiceId, invoiceNumber }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { execute, loading: isDeleting } = useApiResponse();

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!invoiceId) return;

    const result = await execute(invoiceService.deleteInvoice(invoiceId), {
      message: t("success.deletedSuccessfully", { item: t("common.invoice") }),
    });

    if (result?.success) {
      setTimeout(() => {
        router.push("/dashboard/invoices");
      }, 1000);
    }
  };

  return (
    <ViewDeleteInvoiceModalPresentation
      model={{ t, invoiceNumber, onClose, isDeleting, handleConfirm }}
    />
  );
};

export default DeleteInvoiceModal;
