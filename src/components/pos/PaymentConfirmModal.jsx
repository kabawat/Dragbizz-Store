"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Wallet, Banknote, CreditCard, ChevronRight, X, Loader2, Globe } from "lucide-react";
import { Button, Input, Modal, ModalFooter } from "@/components/ui";
import { UpiPaymentQr } from "@/components/common";

const PAYMENT_METHODS = [
    { id: "cash", icon: Banknote, label: "Cash" },
    { id: "upi", icon: Wallet, label: "UPI" },
    { id: "card", icon: CreditCard, label: "Card" },
    { id: "online", icon: Globe, label: "Online" },
];

const formatAmount = (n) => `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const PaymentConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    onOnlinePay,
    grandTotal,
    loading,
    defaultUpi,
    storeName,
    upiLoading = false,
    missingDefault = false,
    noUpiConfigured = false,
    onlineGatewayAvailable = false,
}) => {
    const [paidAmount, setPaidAmount] = useState(grandTotal);
    const [mode, setMode] = useState("cash");

    const visibleMethods = useMemo(
        () => PAYMENT_METHODS.filter((method) => method.id !== "online" || onlineGatewayAvailable),
        [onlineGatewayAvailable],
    );

    useEffect(() => {
        if (isOpen) {
            setPaidAmount(grandTotal);
            setMode("cash");
        }
    }, [grandTotal, isOpen]);

    const changeDue = mode === "cash" ? Math.max(0, paidAmount - grandTotal) : 0;
    const canConfirm = mode === "online" || paidAmount >= grandTotal || mode !== "cash";
    const upiBlocked = mode === "upi" && (upiLoading || missingDefault || noUpiConfigured);
    const showUpiQr = mode === "upi" && defaultUpi?.upiId && paidAmount > 0 && !upiBlocked;
    const confirmLabel = mode === "online" ? "Pay with Razorpay" : "Release Invoice";

    const handleConfirm = () => {
        if (mode === "online") {
            onOnlinePay?.();
            return;
        }
        onConfirm({ paidAmount, paymentMode: mode });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="md"
            showCloseButton={false}
            closeOnOverlayClick={!loading}
            className="!overflow-visible"
        >
            <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 flex-shrink-0">
                        <CheckCircle2 size={18} />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                            Confirm Payment
                        </h3>
                        <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                            Verify payment details to finish sale
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="flex-shrink-0 p-1 rounded-md text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Close"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="rounded-lg border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-secondary))] p-4 space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-[rgb(var(--color-text-secondary))]">Total Bill</span>
                    <span className="text-lg font-bold text-[rgb(var(--color-primary))] tabular-nums">
                        {formatAmount(grandTotal)}
                    </span>
                </div>

                <div className="pt-3 border-t border-[rgb(var(--color-border-primary))] space-y-4">
                    <div>
                        <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-2">
                            Method
                        </p>
                        <div className={`grid gap-2 ${visibleMethods.length === 4 ? "grid-cols-4" : "grid-cols-3"}`}>
                            {visibleMethods.map((m) => {
                                const Icon = m.icon;
                                const active = mode === m.id;
                                return (
                                    <button
                                        key={m.id}
                                        type="button"
                                        onClick={() => setMode(m.id)}
                                        className={`flex flex-row items-center justify-center gap-1.5 h-9 px-2 rounded-lg border text-xs font-semibold uppercase transition-all cursor-pointer min-w-0 ${active
                                            ? "border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))]"
                                            : "border-[rgb(var(--color-border-primary))] text-[rgb(var(--color-text-secondary))] bg-[rgb(var(--color-bg-primary))] hover:border-[rgb(var(--color-primary))]/30"
                                            }`}
                                    >
                                        <Icon size={14} className="flex-shrink-0" />
                                        <span className="whitespace-nowrap leading-none">{m.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {mode !== "online" && (
                        <Input
                            type="number"
                            label="Amount Collected"
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
                        <div className="rounded-lg border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))] p-3 text-sm text-[rgb(var(--color-text-secondary))]">
                            Customer will pay via Razorpay. Invoice releases automatically after payment confirmation.
                        </div>
                    )}

                    {mode === "cash" && paidAmount > grandTotal && (
                        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-green-500/5 border border-green-500/15 text-sm">
                            <span className="text-green-700 font-medium">Change due</span>
                            <span className="font-bold text-green-700 tabular-nums">
                                {formatAmount(changeDue)}
                            </span>
                        </div>
                    )}

                    {mode === "upi" && upiLoading && (
                        <div className="flex items-center justify-center gap-2 py-4 text-sm text-[rgb(var(--color-text-secondary))]">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Loading UPI...
                        </div>
                    )}

                    {mode === "upi" && !upiLoading && (missingDefault || noUpiConfigured) && (
                        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-800 dark:text-amber-200">
                            <p className="font-medium mb-1">
                                {noUpiConfigured
                                    ? "No UPI ID configured for this store."
                                    : "No default UPI is set for this store."}
                            </p>
                            <Link
                                href="/dashboard/settings?tab=payment"
                                className="text-[rgb(var(--color-primary))] underline text-xs font-medium"
                            >
                                Configure in Settings
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

            <ModalFooter className="!px-0 !pb-0 !pt-4 !border-t-0">
                <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
                    Back
                </Button>
                <Button
                    variant="primary"
                    size="sm"
                    onClick={handleConfirm}
                    disabled={!canConfirm || upiBlocked}
                    loading={loading}
                    rightIcon={ChevronRight}
                >
                    {confirmLabel}
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default PaymentConfirmModal;
