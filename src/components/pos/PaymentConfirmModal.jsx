"use client";
import React, { useState, useEffect } from "react";
import { CheckCircle2, Wallet, Banknote, CreditCard, ChevronRight, Loader2 } from "lucide-react";

// Final payment verification modal.
const PaymentConfirmModal = ({ isOpen, onClose, onConfirm, grandTotal, initialPaymentMethod, loading }) => {
    const [paidAmount, setPaidAmount] = useState(grandTotal);
    const [mode, setMode] = useState(initialPaymentMethod || "cash");

    useEffect(() => {
        if (isOpen) {
            setPaidAmount(grandTotal);
            setMode(initialPaymentMethod || "cash");
        }
    }, [grandTotal, initialPaymentMethod, isOpen]);

    if (!isOpen) return null;

    const changeDue = mode === "cash" ? Math.max(0, paidAmount - grandTotal) : 0;
    const canConfirm = paidAmount >= grandTotal || mode !== "cash";

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            {/* Ambient Backdrop */}
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] animate-in fade-in duration-300" onClick={onClose} />

            <div className="relative w-full max-w-md bg-[rgb(var(--color-bg-primary))] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-[rgb(var(--color-border-primary))]">
                {/* Visual Header */}
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
                    {/* Amount & Mode Summary */}
                    <div className="bg-[rgb(var(--color-bg-secondary))] p-5 rounded-2xl border border-[rgb(var(--color-border-primary))] shadow-inner shadow-[rgb(var(--color-border-primary))]/50">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[rgb(var(--color-text-secondary))] text-sm font-medium">Total Bill</span>
                            <span className="text-2xl font-black text-[rgb(var(--color-primary))]">₹{grandTotal.toFixed(2)}</span>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-[rgb(var(--color-border-primary))]">
                            <div>
                                <label className="block text-[11px] font-black text-[rgb(var(--color-text-secondary))] uppercase tracking-widest mb-3">
                                    Method
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: "cash", icon: Banknote, label: "Cash" },
                                        { id: "upi", icon: Wallet, label: "UPI" },
                                        { id: "card", icon: CreditCard, label: "Card" }
                                    ].map((m) => {
                                        const Icon = m.icon;
                                        const active = mode === m.id;
                                        return (
                                            <button
                                                key={m.id}
                                                onClick={() => setMode(m.id)}
                                                className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all duration-200 ${active
                                                    ? "border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))] shadow-sm"
                                                    : "border-[rgb(var(--color-border-primary))] text-[rgb(var(--color-text-secondary))] hover:border-[rgb(var(--color-primary))]/20 bg-[rgb(var(--color-bg-primary))]"
                                                    }`}
                                            >
                                                <Icon size={18} />
                                                <span className="text-[10px] font-bold uppercase tracking-tighter">{m.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-black text-[rgb(var(--color-text-secondary))] uppercase tracking-widest mb-3">
                                    Amount Collected
                                </label>
                                <div className="relative group">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-[rgb(var(--color-text-secondary))] group-focus-within:text-[rgb(var(--color-primary))] transition-colors">₹</span>
                                    <input
                                        type="number"
                                        autoFocus
                                        value={paidAmount}
                                        onChange={(e) => setPaidAmount(Number(e.target.value))}
                                        className="w-full pl-8 pr-4 py-4 text-2xl font-black bg-[rgb(var(--color-bg-primary))] border-2 border-[rgb(var(--color-border-primary))] rounded-2xl focus:border-[rgb(var(--color-primary))] focus:outline-none transition-all shadow-sm"
                                    />
                                </div>
                            </div>

                            {mode === "cash" && paidAmount > grandTotal && (
                                <div className="flex items-center justify-between p-4 bg-green-500/5 border border-green-500/10 rounded-xl animate-in slide-in-from-top-2">
                                    <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest opacity-70">Returns to Customer</span>
                                    <span className="text-xl font-black text-green-700">₹{changeDue.toFixed(2)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Confirm Actions */}
                <div className="p-6 pt-0 flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 py-4 rounded-xl border border-[rgb(var(--color-border-primary))] text-[rgb(var(--color-text-secondary))] font-bold text-sm hover:bg-[rgb(var(--color-bg-secondary))] transition-all active:scale-95 disabled:opacity-50"
                    >
                        Back
                    </button>
                    <button
                        onClick={() => onConfirm({ paidAmount, paymentMode: mode })}
                        disabled={loading || !canConfirm}
                        className="flex-[2] py-4 rounded-xl bg-[rgb(var(--color-primary))] text-white font-black text-sm flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-[rgb(var(--color-primary))]/20 uppercase tracking-widest"
                    >
                        {loading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <>
                                Release Bill <ChevronRight size={18} strokeWidth={3} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentConfirmModal;
