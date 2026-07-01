"use client";

import { CheckCircle2, CreditCard, Banknote, Globe, Loader2 } from "lucide-react";
import { UpiPaymentQr } from "@/components/common";
import { useTranslation } from "@/hooks/ui/useTranslation";
import usePaymentDisplaySession from "@/hooks/payment/usePaymentDisplaySession";
import { useAppSelector } from "@/store/hooks";

const formatAmount = (n) =>
  `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const CustomerPaymentDisplay = () => {
  const { t } = useTranslation();
  const { session, ready } = usePaymentDisplaySession();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeName = session?.storeName || selectedStore?.storeName || "";
  const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

  if (!ready) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[rgb(var(--color-primary))]" />
        <p className="text-sm text-[rgb(var(--color-text-secondary))]">Preparing payment display…</p>
      </div>
    );
  }

  if (!session || session.status === "idle" || session.status === "cancelled") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center animate-in fade-in duration-300">
        <p className="text-lg font-medium text-[rgb(var(--color-text-primary))]">
          {t("invoice.customerPayment.waiting")}
        </p>
        {storeName && (
          <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-2">{storeName}</p>
        )}
      </div>
    );
  }

  if (session.status === "paid") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-semibold text-[rgb(var(--color-text-primary))]">
          {t("invoice.customerPayment.thankYou")}
        </h1>
        <p className="text-3xl font-bold text-[rgb(var(--color-primary))] tabular-nums mt-4">
          {formatAmount(session.paidAmount ?? session.amount)}
        </p>
        {session.invoiceNumber && (
          <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-2">
            {session.invoiceNumber}
          </p>
        )}
      </div>
    );
  }

  const amount = session.paidAmount ?? session.amount;
  const method = session.paymentMethod;

  if (method === "upi" && session.defaultUpi?.upiId && amount > 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 animate-in fade-in duration-300">
        <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-6">
          {storeName}
        </p>
        <UpiPaymentQr
          upiId={session.defaultUpi.upiId}
          payeeName={session.storeName || session.defaultUpi.payeeName || "Merchant"}
          amount={amount}
          size={220}
        />
        {session.invoiceNumber && (
          <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-6">
            {session.invoiceNumber}
          </p>
        )}
      </div>
    );
  }

  if (method === "cash") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center animate-in fade-in duration-300">
        <Banknote className="w-16 h-16 text-[rgb(var(--color-primary))] mb-6" />
        <p className="text-3xl font-bold text-[rgb(var(--color-primary))] tabular-nums mb-4">
          {formatAmount(amount)}
        </p>
        <p className="text-lg text-[rgb(var(--color-text-primary))]">
          {t("invoice.customerPayment.payAtCounter")}
        </p>
      </div>
    );
  }

  if (method === "card") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center animate-in fade-in duration-300">
        <CreditCard className="w-16 h-16 text-[rgb(var(--color-primary))] mb-6" />
        <p className="text-3xl font-bold text-[rgb(var(--color-primary))] tabular-nums mb-4">
          {formatAmount(amount)}
        </p>
        <p className="text-lg text-[rgb(var(--color-text-primary))]">
          {t("invoice.customerPayment.useCardTerminal")}
        </p>
      </div>
    );
  }

  if (method === "online") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center animate-in fade-in duration-300">
        <Globe className="w-16 h-16 text-[rgb(var(--color-primary))] mb-6" />
        <p className="text-3xl font-bold text-[rgb(var(--color-primary))] tabular-nums mb-4">
          {formatAmount(amount)}
        </p>
        <p className="text-lg text-[rgb(var(--color-text-primary))]">
          {!isOnline
            ? t("invoice.customerPayment.offlineOnlineRequired")
            : t("invoice.customerPayment.completeOnStaffScreen")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <p className="text-lg text-[rgb(var(--color-text-secondary))]">
        {t("invoice.customerPayment.waiting")}
      </p>
    </div>
  );
};

export default CustomerPaymentDisplay;
