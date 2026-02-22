"use client";
import { CreditCard } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, Input, Select } from "@/components/ui";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { invoiceService } from "@/service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getInvoices } from "@/store/slices/invoicesSlice";

const UpdatePaymentStatusModal = ({ onClose, invoice, onSuccess }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const { showError, showSuccess } = useGlobalToast();
  const [paymentStatus, setPaymentStatus] = useState("UNPAID");
  const [paidAmount, setPaidAmount] = useState("");
  const [errors, setErrors] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);

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

    setIsUpdating(true);
    try {
      const invoiceId = invoice.id || invoice._id;
      const storeId =
        selectedStore?.storeId;

      if (!storeId) {
        showError("Store ID is missing. Please select a store.");
        setIsUpdating(false);
        return;
      }

      // Use new payment status update API (only for RELEASED invoices)
      const result = await invoiceService.updatePaymentStatus(
        invoiceId,
        paymentStatus,
        null, // paymentMode (optional)
        storeId, // storeId (required for middleware)
        paidAmount ? parseFloat(paidAmount) : null // paidAmount (optional, for PARTIAL)
      );

      if (result.success) {
        showSuccess("Payment status updated successfully");

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
      } else {
        showError(
          result.message || "Failed to update payment status. Please try again."
        );
      }
    } catch (_error) {
      showError(
        "An error occurred while updating payment status. Please try again."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-[1px] bg-black/10 flex items-center justify-center z-[9999]">
      <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 max-w-md w-full mx-4 border border-[rgb(var(--color-border-primary))]">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-[rgb(var(--color-primary))]/10 rounded-full flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-[rgb(var(--color-primary))]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
              {t("invoice.updatePaymentStatus")}
            </h3>
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">
              {t("invoice.changePaymentStatusDescription")}
            </p>
          </div>
        </div>

        <p className="text-[rgb(var(--color-text-primary))] mb-4">
          {t("invoice.invoice")}: <strong>{invoiceNumber}</strong>
        </p>

        <div className="mb-4">
          <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-2">
            {t("invoice.paymentStatus")}
          </label>
          <Select
            value={paymentStatus}
            onChange={handlePaymentStatusChange}
            options={[
              { value: "PAID", label: t("invoice.paid") },
              { value: "UNPAID", label: t("invoice.unpaid") },
              { value: "PARTIAL", label: t("invoice.partialPayment") },
            ]}
            placeholder={t("invoice.selectPaymentStatus")}
          />
        </div>

        {(paymentStatus === "PARTIAL" || paymentStatus === "PAID") && (
          <div className="mb-6">
            <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-2">
              {t("invoice.paidAmount")} {t("common.optional")}
            </label>
            <Input
              type="number"
              value={paidAmount}
              onChange={(value) => handlePaidAmountChange(value)}
              placeholder={
                paymentStatus === "PARTIAL"
                  ? t("invoice.enterPaidAmount", {
                    max: totalAmount?.toLocaleString() || 0,
                  })
                  : t("invoice.enterPaidAmountDefault", {
                    amount: totalAmount?.toLocaleString() || 0,
                  })
              }
              min="0"
              max={paymentStatus === "PARTIAL" ? totalAmount : undefined}
              step="0.01"
              className={errors.paidAmount ? "border-red-500" : ""}
            />
            {errors.paidAmount && (
              <p className="text-red-500 text-xs mt-1">{errors.paidAmount}</p>
            )}
            <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-1">
              {t("invoice.totalInvoiceAmount")}: ₹
              {totalAmount?.toLocaleString() || 0}
              {paymentStatus === "PARTIAL" &&
                ` • ${t("invoice.leaveEmptyForZero")}`}
              {paymentStatus === "PAID" &&
                ` • ${t("invoice.leaveEmptyForFullPayment")}`}
            </p>
            {paymentStatus === "PAID" &&
              paidAmount &&
              parseFloat(paidAmount) > 0 &&
              parseFloat(paidAmount) < totalAmount && (
                <div className="mt-3 p-3 bg-[rgb(var(--color-warning))]/10 border border-[rgb(var(--color-warning))]/20 rounded-md">
                  <p className="text-xs text-[rgb(var(--color-warning))] font-medium">
                    {t("invoice.settlementDiscountWarning", {
                      amount: (totalAmount - parseFloat(paidAmount)).toLocaleString(),
                    })}
                  </p>
                </div>
              )}
          </div>
        )}

        <div className="flex space-x-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
            disabled={isUpdating}
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1"
            disabled={isUpdating}
            loading={isUpdating}
          >
            {isUpdating
              ? t("common.updating")
              : t("invoice.updatePaymentStatus")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UpdatePaymentStatusModal;
