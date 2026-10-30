"use client";
import { InvoiceDeleteConfirmModalPresentation } from "@dragorbit/features/invoices";
import { memo, useCallback, useMemo } from "react";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useApiResponse } from "@/hooks/useApiResponse";
import { invoiceService } from "@/service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { removeInvoice } from "@/store/slices/invoicesSlice";
import { pickStoreId } from "@/utils/store.util";
import { Button } from "../ui";

const InvoiceDeleteConfirmModal = ({ onClose, invoice }) => {
  const dispatch = useAppDispatch();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = useMemo(() => pickStoreId(selectedStore), [selectedStore]);
  const { showError } = useGlobalToast();
  const { execute, loading } = useApiResponse();

  const invoiceNumber = useMemo(() => {
    if (!invoice) return "";
    return (
      invoice.invoiceNumber ||
      invoice.name ||
      `INV-${(invoice.id || invoice._id)?.slice(-6)}`
    );
  }, [invoice]);

  const handleConfirmDelete = useCallback(async () => {
    if (!invoice) return;

    const invoiceId = invoice.id || invoice._id;

    if (!storeId) {
      showError("Store ID is missing. Please select a store.");
      return;
    }

    const result = await execute(
      invoiceService.deleteInvoice(invoiceId, storeId),
      { message: "Invoice deleted successfully" }
    );

    if (result?.success) {
      dispatch(removeInvoice(invoiceId));
      onClose();
    }
  }, [invoice, storeId, showError, execute, dispatch, onClose]);

  const model = useMemo(
    () => ({
      invoiceNumber,
      Button,
      onClose,
      loading,
      handleConfirmDelete,
    }),
    [invoiceNumber, onClose, loading, handleConfirmDelete]
  );

  if (!invoice) return null;

  return <InvoiceDeleteConfirmModalPresentation model={model} />;
};

export default memo(InvoiceDeleteConfirmModal);
