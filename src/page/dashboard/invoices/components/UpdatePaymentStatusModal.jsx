"use client";
import { UpdatePaymentStatusModalPresentation } from "@dragorbit/features/invoices";

import { useEffect, useState } from "react";

import { useGlobalToast } from "@/contexts/ToastContext";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { invoiceService } from "@/service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getInvoices } from "@/store/slices/invoicesSlice";
import { useApiResponse } from "@/hooks/useApiResponse";

const UpdatePaymentStatusModal = ({ onClose, invoice, onSuccess }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const { showError } = useGlobalToast();
  const { execute, loading } = useApiResponse();
  const [paymentStatus, setPaymentStatus] = useState("UNPAID");
  const [paidAmount, setPaidAmount] = useState("");
  const [errors, setErrors] = useState({});

  const totalAmount = invoice?.totalAmount || 0;
  const currentPaymentStatus = invoice?.paymentStatus || "UNPAID";
  const invoiceNumber =
    invoice?.invoiceNumber ||
    invoice?.name ||
    `INV-${(invoice?.id || invoice?._id)?.slice(-6)}`;

  // Reset form when invoice changes
  useEffect(() => {
    if (invoice) {
      setPaymentStatus(currentPaymentStatus || "UNPAID");
      // Set default paidAmount to totalAmount
      setPaidAmount(totalAmount ? totalAmount.toString() : "");
      setErrors({});
    }
  }, [invoice, currentPaymentStatus, totalAmount]);

  if (!invoice) return null;

  const handlePaymentStatusChange = (value) => {
    setPaymentStatus(value);
    setErrors({});
    if (value === "UNPAID") {
      setPaidAmount("");
    }
  };

  const handlePaidAmountChange = (value) => {
    const numValue = parseFloat(value) || 0;
    if (numValue < 0) {
      setErrors({ paidAmount: "Paid amount cannot be negative" });
      return;
    }
    if (paymentStatus === "PARTIAL" && numValue > totalAmount) {
      setErrors({
        paidAmount: `Paid amount cannot exceed total amount (₹${totalAmount.toLocaleString()})`,
      });
      return;
    }
    setPaidAmount(value);
    setErrors({});
  };

  const handleConfirm = async () => {
    // Validate
    const newErrors = {};
    if (
      paymentStatus === "PARTIAL" &&
      paidAmount &&
      parseFloat(paidAmount) > totalAmount
    ) {
      newErrors.paidAmount = `Paid amount cannot exceed total amount (₹${totalAmount.toLocaleString()})`;
    }
    if (
      paidAmount &&
      (Number.isNaN(parseFloat(paidAmount)) || parseFloat(paidAmount) < 0)
    ) {
      newErrors.paidAmount = "Paid amount must be a valid number >= 0";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!invoice) return;

    const invoiceId = invoice.id || invoice._id;
    const storeId = selectedStore?.storeId;

    if (!storeId) {
      showError("Store ID is missing. Please select a store.");
      return;
    }

    const result = await execute(
      invoiceService.updatePaymentStatus(
        invoiceId,
        paymentStatus,
        null, // paymentMode (optional)
        storeId, // storeId (required for middleware)
        paidAmount ? parseFloat(paidAmount) : null, // paidAmount (optional, for PARTIAL)
      ),
      { message: "Payment status updated successfully" },
    );

    if (result?.success) {
      // Refresh the invoices list
      const refreshParams = {
        store: storeId,
        limit: 20,
        cursor: null,
        isFreshLoad: true,
      };
      await dispatch(getInvoices(refreshParams));

      if (onSuccess) {
        onSuccess(result.data || invoiceId);
      }
      onClose();
    }
  };

  return (
    <UpdatePaymentStatusModalPresentation
      model={{
        t,
        invoiceNumber,
        paymentStatus,
        handlePaymentStatusChange,
        paidAmount,
        handlePaidAmountChange,
        totalAmount,
        errors,
        onClose,
        loading,
        handleConfirm,
      }}
    />
  );
};

export default UpdatePaymentStatusModal;
