"use client";
import { InvoiceDeleteConfirmModalPresentation } from "@dragorbit/features/invoices";

import { useGlobalToast } from "@/contexts/ToastContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { removeInvoice } from "@/store/slices/invoicesSlice";
import { invoiceService } from "@/service";
import { useApiResponse } from "@/hooks/useApiResponse";
import { Button } from "../ui";

const InvoiceDeleteConfirmModal = ({ onClose, invoice }) => {
  const dispatch = useAppDispatch();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const { showError } = useGlobalToast();
  const { execute, loading } = useApiResponse();

  if (!invoice) return null;

  const invoiceNumber =
    invoice?.invoiceNumber ||
    invoice?.name ||
    `INV-${(invoice?.id || invoice?._id)?.slice(-6)}`;

  const handleConfirmDelete = async () => {
    if (!invoice) return;

    const invoiceId = invoice.id || invoice._id;
    const storeId = selectedStore?.storeId;

    if (!storeId) {
      showError("Store ID is missing. Please select a store.");
      return;
    }

    const result = await execute(
      invoiceService.deleteInvoice(invoiceId, storeId),
      { message: "Invoice deleted successfully" },
    );

    if (result?.success) {
      dispatch(removeInvoice(invoiceId));
      onClose();
    }
  };

  return (
    <InvoiceDeleteConfirmModalPresentation
      model={{ invoiceNumber, Button, onClose, loading, handleConfirmDelete }}
    />
  );
};

export default InvoiceDeleteConfirmModal;
