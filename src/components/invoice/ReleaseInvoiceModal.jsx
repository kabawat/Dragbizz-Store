"use client";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Select } from "@/components/ui";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { invoiceService } from "@/service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getInvoices } from "@/store/slices/invoicesSlice";
import { useApiResponse } from "@/hooks/useApiResponse";
import { pickStoreId } from "@/utils/store.util";

const ReleaseInvoiceModal = ({ onClose, invoice, onSuccess }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const { showError } = useGlobalToast();
  const { execute, loading } = useApiResponse();
  const [paymentStatus, setPaymentStatus] = useState("UNPAID");

  const storeId = pickStoreId(selectedStore);
  const totalAmount = invoice?.totalAmount || 0;
  const invoiceNumber =
    invoice?.invoiceNumber ||
    invoice?.name ||
    (invoice?.id ? `INV-${invoice.id.slice(-6)}` : "");

  useEffect(() => {
    if (invoice) {
      setPaymentStatus("UNPAID");
    }
  }, [invoice]);

  if (!invoice) return null;

  const handleCollectPayment = () => {
    if (!invoice?.id) return;
    onClose();
    router.push(`/dashboard/collect-payment/${invoice.id}?source=release`);
  };

  const handleConfirm = async () => {
    if (paymentStatus === "PAID" || paymentStatus === "PARTIAL") {
      handleCollectPayment();
      return;
    }

    if (!invoice?.id || !storeId) {
      showError("Store ID is missing. Please select a store.");
      return;
    }

    const result = await execute(
      invoiceService.releaseInvoice(invoice.id, paymentStatus, storeId),
      { message: "Invoice released successfully" },
    );

    if (result?.success) {
      await dispatch(
        getInvoices({ store: storeId, limit: 20, cursor: null, isFreshLoad: true }),
      );
      onSuccess?.(result.data || invoice.id);
      onClose();
      router.push(`/dashboard/invoices/${invoice.id}`);
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
            onChange={setPaymentStatus}
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
            <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-3">
              {t("invoice.collectPayment.releasePaidHint")}
            </p>
            <Button variant="outline" className="w-full" onClick={handleCollectPayment}>
              {t("invoice.collectPayment.collectPayment")}
            </Button>
          </div>
        )}

        {paymentStatus === "UNPAID" && (
          <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-6">
            {t("invoice.totalInvoiceAmount")}: ₹{totalAmount?.toLocaleString() || 0}
          </p>
        )}

        <div className="flex space-x-3">
          <Button onClick={onClose} variant="outline" className="flex-1" disabled={loading}>
            {t("common.cancel")}
          </Button>
          {(paymentStatus === "UNPAID" || paymentStatus === "CANCELLED") && (
            <Button onClick={handleConfirm} className="flex-1" disabled={loading} loading={loading}>
              {loading ? t("invoice.releasing") : t("invoice.releaseInvoice")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReleaseInvoiceModal;
