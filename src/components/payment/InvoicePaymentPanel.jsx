"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Banknote,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Globe,
  Loader2,
  Wallet,
} from "lucide-react";
import { Button, Input } from "@/components/ui";
import { UpiPaymentQr } from "@/components/common";
import { useTranslation } from "@/hooks/ui/useTranslation";

const PAYMENT_METHODS = [
  { id: "cash", icon: Banknote, labelKey: "invoice.collectPayment.cash" },
  { id: "upi", icon: Wallet, labelKey: "invoice.collectPayment.upi" },
  { id: "card", icon: CreditCard, labelKey: "invoice.collectPayment.card" },
  { id: "online", icon: Globe, labelKey: "invoice.collectPayment.online" },
];

const formatAmount = (n) =>
  `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const InvoicePaymentPanel = ({
  invoiceNumber,
  grandTotal,
  customerName,
  loading,
  defaultUpi,
  storeName,
  upiLoading = false,
  missingDefault = false,
  noUpiConfigured = false,
  onlineGatewayAvailable = false,
  onConfirm,
  onOnlinePay,
  onBack,
  onPaymentStateChange,
}) => {
  const { t } = useTranslation();
  const [paidAmount, setPaidAmount] = useState(grandTotal);
  const [mode, setMode] = useState("cash");

  const visibleMethods = useMemo(
    () => PAYMENT_METHODS.filter((method) => method.id !== "online" || onlineGatewayAvailable),
    [onlineGatewayAvailable],
  );

  useEffect(() => {
    setPaidAmount(grandTotal);
    setMode("cash");
  }, [grandTotal]);

  useEffect(() => {
    onPaymentStateChange?.({ mode, paidAmount });
  }, [mode, paidAmount, onPaymentStateChange]);

  const changeDue = mode === "cash" ? Math.max(0, paidAmount - grandTotal) : 0;
  const canConfirm = mode === "online" || paidAmount >= grandTotal || mode !== "cash";
  const upiBlocked = mode === "upi" && (upiLoading || missingDefault || noUpiConfigured);
  const showUpiQr = mode === "upi" && defaultUpi?.upiId && paidAmount > 0 && !upiBlocked;
  const confirmLabel =
    mode === "online" ? t("invoice.collectPayment.payWithRazorpay") : t("invoice.collectPayment.releaseInvoice");

  const handleConfirm = () => {
    if (mode === "online") {
      onOnlinePay?.();
      return;
    }
    onConfirm({ paidAmount, paymentMode: mode });
  };

  return (
    <div className="max-w-lg mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2.5 mb-6">
        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 flex-shrink-0">
          <CheckCircle2 size={20} />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-[rgb(var(--color-text-primary))]">
            {t("invoice.collectPayment.title")}
          </h1>
          <p className="text-sm text-[rgb(var(--color-text-secondary))]">
            {t("invoice.collectPayment.subtitle")}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))] p-5 space-y-4 shadow-sm">
        {invoiceNumber && (
          <div className="flex justify-between text-sm">
            <span className="text-[rgb(var(--color-text-secondary))]">
              {t("invoice.collectPayment.invoice")}
            </span>
            <span className="font-medium text-[rgb(var(--color-text-primary))]">{invoiceNumber}</span>
          </div>
        )}

        {customerName && (
          <div className="flex justify-between text-sm">
            <span className="text-[rgb(var(--color-text-secondary))]">
              {t("invoice.collectPayment.customer")}
            </span>
            <span className="font-medium text-[rgb(var(--color-text-primary))]">{customerName}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-[rgb(var(--color-border-primary))]">
          <span className="text-sm text-[rgb(var(--color-text-secondary))]">
            {t("invoice.collectPayment.totalBill")}
          </span>
          <span className="text-2xl font-bold text-[rgb(var(--color-primary))] tabular-nums">
            {formatAmount(grandTotal)}
          </span>
        </div>

        <div className="pt-3 border-t border-[rgb(var(--color-border-primary))] space-y-4">
          <div>
            <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-2">
              {t("invoice.collectPayment.selectMethod")}
            </p>
            <div
              className={`grid gap-2 ${visibleMethods.length === 4 ? "grid-cols-4" : "grid-cols-3"}`}
            >
              {visibleMethods.map((m) => {
                const Icon = m.icon;
                const active = mode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMode(m.id)}
                    className={`flex flex-row items-center justify-center gap-1.5 h-9 px-2 rounded-lg border text-xs font-semibold uppercase transition-all cursor-pointer min-w-0 ${
                      active
                        ? "border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))]"
                        : "border-[rgb(var(--color-border-primary))] text-[rgb(var(--color-text-secondary))] bg-[rgb(var(--color-bg-secondary))] hover:border-[rgb(var(--color-primary))]/30"
                    }`}
                  >
                    <Icon size={14} className="flex-shrink-0" />
                    <span className="whitespace-nowrap leading-none">{t(m.labelKey)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {mode !== "online" && (
            <Input
              type="number"
              label={t("invoice.collectPayment.amountCollected")}
              size="sm"
              min={0}
              precision={2}
              value={paidAmount}
              onChange={setPaidAmount}
              autoFocus
              className="[&_input]:font-semibold [&_input]:tabular-nums"
            />
          )}

          {mode === "online" && (
            <div className="rounded-lg border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-secondary))] p-3 text-sm text-[rgb(var(--color-text-secondary))]">
              {t("invoice.collectPayment.onlineDescription")}
            </div>
          )}

          {mode === "cash" && paidAmount > grandTotal && (
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-green-500/5 border border-green-500/15 text-sm">
              <span className="text-green-700 font-medium">{t("invoice.collectPayment.changeDue")}</span>
              <span className="font-bold text-green-700 tabular-nums">{formatAmount(changeDue)}</span>
            </div>
          )}

          {mode === "upi" && upiLoading && (
            <div className="flex items-center justify-center gap-2 py-4 text-sm text-[rgb(var(--color-text-secondary))]">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t("invoice.collectPayment.loadingUpi")}
            </div>
          )}

          {mode === "upi" && !upiLoading && (missingDefault || noUpiConfigured) && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-800 dark:text-amber-200">
              <p className="font-medium mb-1">
                {noUpiConfigured
                  ? t("invoice.collectPayment.noUpiConfigured")
                  : t("invoice.collectPayment.noDefaultUpi")}
              </p>
              <Link
                href="/dashboard/settings?tab=payment"
                className="text-[rgb(var(--color-primary))] underline text-xs font-medium"
              >
                {t("invoice.collectPayment.configureSettings")}
              </Link>
            </div>
          )}

          {showUpiQr && (
            <UpiPaymentQr
              upiId={defaultUpi.upiId}
              payeeName={storeName || defaultUpi.label || "Merchant"}
              amount={paidAmount}
            />
          )}
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        {onBack && (
          <Button variant="outline" size="md" onClick={onBack} disabled={loading} className="flex-1">
            {t("common.back")}
          </Button>
        )}
        <Button
          variant="primary"
          size="md"
          onClick={handleConfirm}
          disabled={!canConfirm || upiBlocked}
          loading={loading}
          rightIcon={ChevronRight}
          className="flex-1"
        >
          {confirmLabel}
        </Button>
      </div>
    </div>
  );
};

export default InvoicePaymentPanel;
