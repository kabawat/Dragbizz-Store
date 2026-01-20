"use client";
import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "../ui";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { deleteInvoice } from "@/store/slices/invoicesSlice";
import { useGlobalToast } from "@/contexts/ToastContext";

const InvoiceDeleteConfirmModal = ({ onClose, invoice }) => {
  const dispatch = useAppDispatch();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const { showError, showSuccess } = useGlobalToast();
  const [isLoading, setIsLoading] = useState(false);

  if (!invoice) return null;

  const invoiceNumber =
    invoice?.invoiceNumber ||
    invoice?.name ||
    `INV-${(invoice?.id || invoice?._id)?.slice(-6)}`;

  const handleConfirmDelete = async () => {
    if (!invoice) return;

    setIsLoading(true);
    try {
      const invoiceId = invoice.id || invoice._id;
      const storeId =
        selectedStore?.storeId || selectedStore?._id || selectedStore?.id;

      if (!storeId) {
        showError("Store ID is missing. Please select a store.");
        setIsLoading(false);
        return;
      }

      const result = await dispatch(
        deleteInvoice({
          invoiceId: invoiceId,
          storeId: storeId,
        }),
      );

      if (result.payload?.success) {
        showSuccess("Invoice deleted successfully");
        onClose();
      } else {
        showError(
          result.payload?.message ||
            "Failed to delete invoice. Please try again.",
        );
      }
    } catch (error) {
      showError(
        "An error occurred while deleting the invoice. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-[9999]">
      <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 max-w-md w-full mx-4 mt-20">
        <div className="text-center">
          <div className="w-16 h-16 bg-[rgb(var(--color-danger))]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-[rgb(var(--color-danger))]" />
          </div>
          <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
            Delete Invoice
          </h3>
          <p className="text-[rgb(var(--color-text-secondary))] mb-6">
            {invoiceNumber ? (
              <>
                Are you sure you want to delete invoice{" "}
                <span className="font-semibold text-[rgb(var(--color-text-primary))]">
                  "{invoiceNumber}"
                </span>
                ? This action cannot be undone.
              </>
            ) : (
              "Are you sure you want to delete this invoice? This action cannot be undone."
            )}
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              loading={isLoading}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDeleteConfirmModal;
