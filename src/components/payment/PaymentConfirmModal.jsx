"use client";

import { Loader2 } from "lucide-react";
import InvoicePaymentPanel from "@/components/payment/InvoicePaymentPanel";
import { useTranslation } from "@/hooks/ui/useTranslation";
import useStaffInvoicePayment from "@/hooks/payment/useStaffInvoicePayment";

const PaymentConfirmModal = ({ open, onClose, invoiceId, source = "create" }) => {
  const { t } = useTranslation();

  const {
    invoiceNumber,
    grandTotal,
    customerName,
    storeName,
    pageState,
    fetching,
    isProcessing,
    defaultUpi,
    upiLoading,
    missingDefault,
    noUpiConfigured,
    onlineGatewayAvailable,
    handleManualRelease,
    handleOnlinePay,
    handleUnpaidRelease,
    handleClose,
    handlePaymentStateChange,
    loadInvoice,
  } = useStaffInvoicePayment({ invoiceId, source, open });

  if (!open || !invoiceId) return null;

  const handleDismiss = () => {
    handleClose();
    onClose?.();
  };

  const showPanel = pageState === "ready" && grandTotal > 0;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"
        onClick={!isProcessing ? handleDismiss : undefined}
        aria-hidden
      />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar bg-[rgb(var(--color-bg-primary))] rounded-2xl border border-[rgb(var(--color-border-primary))] shadow-[0_20px_60px_rgba(0,0,0,0.22)] p-6">
        {pageState === "error" && (
          <div className="text-center py-8">
            <p className="text-[rgb(var(--color-text-secondary))] mb-4">
              {t("invoice.collectPayment.loadError")}
            </p>
            <button
              type="button"
              onClick={loadInvoice}
              className="text-sm text-[rgb(var(--color-primary))] underline"
            >
              {t("common.retry")}
            </button>
          </div>
        )}

        {(pageState === "loading" || (fetching && !showPanel)) && pageState !== "error" && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[rgb(var(--color-primary))]" />
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">
              {t("invoice.collectPayment.preparing")}
            </p>
          </div>
        )}

        {showPanel && (
          <>
            <InvoicePaymentPanel
              invoiceNumber={invoiceNumber}
              grandTotal={grandTotal}
              customerName={customerName}
              loading={isProcessing}
              defaultUpi={defaultUpi}
              storeName={storeName}
              upiLoading={upiLoading}
              missingDefault={missingDefault}
              noUpiConfigured={noUpiConfigured}
              onlineGatewayAvailable={onlineGatewayAvailable}
              onConfirm={handleManualRelease}
              onOnlinePay={handleOnlinePay}
              onBack={handleDismiss}
              onPaymentStateChange={handlePaymentStateChange}
            />
            <div className="max-w-lg mx-auto mt-4 text-center">
              <button
                type="button"
                onClick={handleUnpaidRelease}
                disabled={isProcessing}
                className="text-sm text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] underline underline-offset-2 disabled:opacity-50"
              >
                {t("invoice.collectPayment.releaseUnpaid")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentConfirmModal;
