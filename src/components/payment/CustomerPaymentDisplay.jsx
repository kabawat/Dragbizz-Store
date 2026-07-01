"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, CreditCard, Banknote, Globe, Loader2 } from "lucide-react";
import { UpiPaymentQr } from "@/components/common";
import CustomerDisplayIdle from "@/components/payment/CustomerDisplayIdle";
import { useTranslation } from "@/hooks/ui/useTranslation";
import usePaymentDisplaySession from "@/hooks/payment/usePaymentDisplaySession";
import { useRazorpayCheckout } from "@/hooks/payment/useRazorpayCheckout";
import { useAppSelector } from "@/store/hooks";
import {
  clearPaymentDisplaySession,
  writePaymentDisplaySession,
} from "@/utils/payment/paymentDisplaySession";

const PAID_IDLE_MS = 5000;

const formatAmount = (n) => `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const CustomerPaymentDisplay = () => {
  const { t } = useTranslation();
  const { session, ready, scope } = usePaymentDisplaySession();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const { startCheckout } = useRazorpayCheckout();
  const [checkoutState, setCheckoutState] = useState("idle");
  const [checkoutError, setCheckoutError] = useState("");
  const lastOnlineAttemptRef = useRef(null);
  const storeName = session?.storeName || selectedStore?.storeName || "";
  const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

  const handlePayWithRazorpay = useCallback(async () => {
    if (!ready || !scope || !session || checkoutState === "processing") return;
    if (session.status !== "awaiting" || session.paymentMethod !== "online") return;
    if (!session.invoiceId || !session.storeId) return;

    const amount = Number(session.paidAmount ?? session.amount ?? 0);
    if (!amount || amount <= 0) return;

    setCheckoutState("processing");
    setCheckoutError("");

    try {
      await startCheckout({
        storeId: session.storeId,
        invoiceId: session.invoiceId,
        amount,
        storeName: session.storeName || storeName || "",
        customerName: session.customerName || "",
        onSuccess: () => {
          writePaymentDisplaySession(scope, {
            ...session,
            status: "paid",
            paidAmount: amount,
            updatedAt: Date.now(),
          });
          setCheckoutState("success");
        },
        onFailure: (error) => {
          setCheckoutError(error?.message || t("invoice.customerPayment.paymentFailed"));
          setCheckoutState("failed");
        },
      });
    } catch (error) {
      setCheckoutError(error?.message || t("invoice.customerPayment.paymentFailed"));
      setCheckoutState("failed");
    }
  }, [checkoutState, ready, scope, session, startCheckout, storeName, t]);

  useEffect(() => {
    if (!session || session.paymentMethod !== "online" || session.status !== "awaiting") return;
    if (!isOnline) return;
    if (checkoutState === "processing" || checkoutState === "success") return;

    const attemptAt = session.onlineAttemptAt;
    if (!attemptAt || attemptAt === lastOnlineAttemptRef.current) return;

    lastOnlineAttemptRef.current = attemptAt;
    handlePayWithRazorpay();
  }, [session, isOnline, checkoutState, handlePayWithRazorpay]);

  useEffect(() => {
    if (!session || session.status !== "paid" || !scope) return undefined;

    const timer = setTimeout(() => {
      clearPaymentDisplaySession(scope);
      setCheckoutState("idle");
      setCheckoutError("");
      lastOnlineAttemptRef.current = null;
    }, PAID_IDLE_MS);

    return () => clearTimeout(timer);
  }, [session?.status, session?.sessionId, scope]);

  if (!ready) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[rgb(var(--color-primary))]" />
        <p className="text-sm text-[rgb(var(--color-text-secondary))]">Preparing payment display…</p>
      </div>
    );
  }

  if (!session || session.status === "idle" || session.status === "cancelled") {
    return <CustomerDisplayIdle />;
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
        <p className="text-lg text-[rgb(var(--color-text-primary))]">
          {t("invoice.customerPayment.payAtCounter", { amount: formatAmount(amount) })}
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
        {checkoutState === "processing" ? (
          <>
            <Loader2 className="w-8 h-8 animate-spin text-[rgb(var(--color-primary))] mb-3" />
            <p className="text-lg text-[rgb(var(--color-text-primary))]">
              {t("invoice.customerPayment.openingPaymentGateway")}
            </p>
          </>
        ) : checkoutState === "failed" ? (
          <>
            <p className="text-lg text-[rgb(var(--color-text-primary))] mb-2">
              {checkoutError || t("invoice.customerPayment.paymentFailed")}
            </p>
            <button
              type="button"
              onClick={handlePayWithRazorpay}
              className="mt-3 rounded-full bg-[rgb(var(--color-primary))] px-5 py-2.5 text-sm font-semibold text-white shadow-sm"
            >
              {t("invoice.collectPayment.payWithRazorpay")}
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <p className="text-lg text-[rgb(var(--color-text-primary))]">
              {!isOnline
                ? t("invoice.customerPayment.offlineOnlineRequired")
                : t("invoice.customerPayment.openingPaymentGateway")}
            </p>
            <button
              type="button"
              onClick={handlePayWithRazorpay}
              className="rounded-full bg-[rgb(var(--color-primary))] px-5 py-2.5 text-sm font-semibold text-white shadow-sm"
            >
              {t("invoice.collectPayment.payWithRazorpay")}
            </button>
          </div>
        )}
      </div>
    );
  }

  return <CustomerDisplayIdle />;
};

export default CustomerPaymentDisplay;
