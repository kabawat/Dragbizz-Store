"use client";
import React, { useState, useEffect } from "react";
import { CheckCircle2, X, Wallet, Banknote, CreditCard, ChevronRight, Loader2 } from "lucide-react";

const PaymentConfirmModal = ({ isOpen, onClose, onConfirm, grandTotal, initialPaymentMethod, loading }) => {
    const [paidAmount, setPaidAmount] = useState(grandTotal);
    const [mode, setMode] = useState(initialPaymentMethod || "cash");

    useEffect(() => {
        setPaidAmount(grandTotal);
        setMode(initialPaymentMethod || "cash");
    }, [grandTotal, initialPaymentMethod, isOpen]);

    if (!isOpen) return null;

    const changeDue = mode === "cash" ? Math.max(0, paidAmount - grandTotal) : 0;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] animate-in fade-in duration-300" onClick={onClose} />

            <div className="relative w-full max-w-md bg-[rgb(var(--color-bg-primary))] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-6 pb-0 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-[rgb(var(--color-text-primary))]">Confirm Payment</h3>
                            <p className="text-xs text-[rgb(var(--color-text-secondary))]">Verify payment details to finish sale</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Amount Summary */}
                    <div className="bg-[rgb(var(--color-bg-secondary))] p-5 rounded-2xl border border-[rgb(var(--color-border-primary))]">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[rgb(var(--color-text-secondary))] text-sm font-medium">Total Payable</span>
                            <span className="text-2xl font-black text-[rgb(var(--color-primary))]">₹{grandTotal.toFixed(2)}</span>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-wider mb-2">
                                    Payment Method
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: "cash", icon: Banknote, label: "Cash" },
                                        { id: "upi", icon: Wallet, label: "UPI" },
                                        { id: "card", icon: CreditCard, label: "Card" }
                                    ].map((m) => {
                                        const Icon = m.icon;
                                        return (
                                            <button
                                                key={m.id}
                                                onClick={() => setMode(m.id)}
                                                className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all ${mode === m.id
                                                    ? "border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]/5 text-[rgb(var(--color-primary))]"
                                                    : "border-[rgb(var(--color-border-primary))] text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-secondary))]"
                                                    }`}
                                            >
                                                <Icon size={18} />
                                                <span className="text-[10px] font-bold">{m.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-wider mb-2">
                                    Amount Received
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-[rgb(var(--color-text-secondary))]">₹</span>
                                    <input
                                        type="number"
                                        autoFocus
                                        value={paidAmount}
                                        onChange={(e) => setPaidAmount(Number(e.target.value))}
                                        className="w-full pl-8 pr-4 py-3.5 text-xl font-bold bg-[rgb(var(--color-bg-primary))] border-2 border-[rgb(var(--color-border-primary))] rounded-2xl focus:border-[rgb(var(--color-primary))] focus:outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {mode === "cash" && paidAmount > grandTotal && (
                                <div className="flex items-center justify-between p-3 bg-green-500/5 border border-green-500/10 rounded-xl">
                                    <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Change to Return</span>
                                    <span className="text-lg font-black text-green-600">₹{changeDue.toFixed(2)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 pt-0 flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 py-3 rounded-xl border border-[rgb(var(--color-border-primary))] text-[rgb(var(--color-text-secondary))] font-bold text-sm hover:bg-[rgb(var(--color-bg-secondary))] transition-all disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm({ paidAmount, paymentMode: mode })}
                        disabled={loading || (paidAmount < grandTotal && mode !== "partial")}
                        className="flex-[2] py-3 rounded-xl bg-[rgb(var(--color-primary))] text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-[rgb(var(--color-primary))]/25"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                Confirm & Print <ChevronRight size={16} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentConfirmModal;
