"use client";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Input, Select } from "@/components/ui";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { invoiceService } from "@/service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getInvoices } from "@/store/slices/invoicesSlice";

const ReleaseInvoiceModal = ({ onClose, invoice, onSuccess }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const { showError, showSuccess } = useGlobalToast();
  const [paymentStatus, setPaymentStatus] = useState("PAID");
  const [paidAmount, setPaidAmount] = useState("");
  const [errors, setErrors] = useState({});
  const [isReleasing, setIsReleasing] = useState(false);

  const totalAmount = invoice?.totalAmount || 0;
  const invoiceNumber =
    invoice?.invoiceNumber ||
    invoice?.name ||
    `INV-${(invoice?.id || invoice?._id)?.slice(-6)}`;

  useEffect(() => {
    if (invoice) {
      // Set default payment status and paidAmount
      setPaymentStatus("PAID");
      setPaidAmount(totalAmount ? totalAmount.toString() : "");
      setErrors({});
    }
  }, [invoice, totalAmount]);

  if (!invoice) return null;

  const handlePaymentStatusChange = (value) => {
    setPaymentStatus(value);
    setErrors({});
    if (value === "UNPAID") {
      setPaidAmount("");
    } else if (value === "PAID" || value === "PARTIAL") {
      // Set default to totalAmount for PAID and PARTIAL
      setPaidAmount(totalAmount ? totalAmount.toString() : "");
    }
  };

  const handlePaidAmountChange = (value) => {
    const numValue = parseFloat(value) || 0;
    if (numValue < 0) {
      setErrors({ paidAmount: "Paid amount cannot be negative" });
      return;
    }
    setPaidAmount(value);
    setErrors({});
  };

  const handleConfirm = async () => {
    // Validate if PARTIAL or PAID with paidAmount
    if (
      (paymentStatus === "PARTIAL" || paymentStatus === "PAID") &&
      paidAmount
    ) {
      const numPaidAmount = parseFloat(paidAmount);
      if (Number.isNaN(numPaidAmount) || numPaidAmount < 0) {
        setErrors({ paidAmount: "Paid amount must be a valid number >= 0" });
        return;
      }
    }

    if (!invoice) return;

    setIsReleasing(true);
    try {
      const invoiceId = invoice.id || invoice._id;
      const storeId =
        selectedStore?.storeId;

      if (!storeId) {
        showError("Store ID is missing. Please select a store.");
        setIsReleasing(false);
        return;
      }

      const result = await invoiceService.releaseInvoice(
        invoiceId,
        paymentStatus,
        storeId,
        paidAmount ? parseFloat(paidAmount) : null
      );

      if (result.success) {
        showSuccess("Invoice released successfully");
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

        // Auto-redirect to view invoice page after successful release
        if (router.pathname !== `/dashboard/invoices/${invoiceId}`) {
          router.push(`/dashboard/invoices/${invoiceId}`);
        }
      } else {
        showError(
          result.message || "Failed to release invoice. Please try again."
        );
      }
    } catch (_error) {
      showError(
        "An error occurred while releasing the invoice. Please try again."
      );
    } finally {
      setIsReleasing(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-[1px] bg-black/10 flex items-center justify-center z-[9999]">
      <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 max-w-md w-full mx-4 border border-[rgb(var(--color-border-primary))]">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-[rgb(var(--color-success))]/10 rounded-full flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-[rgb(var(--color-success))]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
              {t("invoice.releaseInvoice")}
            </h3>
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">
              {t("invoice.releaseInvoiceDescription")}
            </p>
          </div>
        </div>
        <p className="text-[rgb(var(--color-text-primary))] mb-4">
          Are you sure you want to release invoice{" "}
          <strong>{invoiceNumber}</strong>? This will finalize the invoice and
          it cannot be edited afterwards.
        </p>
        <div className="mb-4">
          <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-2">
            Payment Status
          </label>
          <Select
            value={paymentStatus}
            onChange={handlePaymentStatusChange}
            options={[
              { value: "PAID", label: t("invoice.paid") },
              { value: "UNPAID", label: t("invoice.unpaid") },
              { value: "PARTIAL", label: t("invoice.partialPayment") },
              { value: "CANCELLED", label: t("invoice.cancelled") },
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
              placeholder={t("invoice.enterPaidAmount", {
                max: totalAmount?.toLocaleString() || 0,
              })}
              min="0"
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
            disabled={isReleasing}
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1"
            disabled={isReleasing}
            loading={isReleasing}
          >
            {isReleasing ? t("invoice.releasing") : t("invoice.releaseInvoice")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReleaseInvoiceModal;
