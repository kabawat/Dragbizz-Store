"use client";
import React, { useState } from "react";
import { Receipt, ArrowRight, Loader2 } from "lucide-react";
import { PAYMENT_METHODS } from "@/page/dashboard/pos/data/mockData";
import { useAppSelector } from "@/store/hooks";
import { useGlobalToast } from "@/contexts/ToastContext";
import useApiResponse from "@/hooks/useApiResponse";
import { invoiceService } from "@/service";
import PaymentConfirmModal from "../PaymentConfirmModal";

const fmt = (n) => `₹${Number(n).toFixed(2)}`;
const quickAmounts = [50, 100, 200, 500, 1000, 2000];
const generateBillNo = () => `POS-${Date.now().toString().slice(-6)}`;

// Handles the end-of-sale lifecycle: payment method selection, cash management, 
const PaymentSection = ({
    cart,
    customerName,
    globalDiscount,
    grandTotal,
    subtotal,
    taxTotal,
    discountAmt,
    checkoutRef
}) => {
    // --- Local Checkout State ---
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [cashReceived, setCashReceived] = useState("");
    const [invoiceLoading, setInvoiceLoading] = useState(false);
    const [isReleasing, setIsReleasing] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [tempBill, setTempBill] = useState(null);

    // --- Hooks ---
    const { selectedStore } = useAppSelector((state) => state.profile);
    const { showError } = useGlobalToast();
    const { execute } = useApiResponse();

    const changeDue = paymentMethod === "cash" ? Math.max(0, (parseFloat(cashReceived) || 0) - grandTotal) : 0;
    const isCheckoutDisabled = invoiceLoading || (paymentMethod === "cash" && cashReceived && parseFloat(cashReceived) < grandTotal);

    // --- Checkout Flow ---
    const handleCheckout = async () => {
        if (cart.length === 0) return;
        const storeId = selectedStore?.storeId || selectedStore?._id;
        if (!storeId) return showError("Store not found. Please select a store.");

        const invoiceData = {
            customer: null,
            isWalkin: true,
            items: cart.map((item) => ({ product: item.id || item._id, quantity: item.qty })),
            store: storeId,
            totalDiscount: globalDiscount || 0,
            discountMode: "POST_TOTAL",
            orderSource: "POS",
        };

        setInvoiceLoading(true);
        const result = await execute(invoiceService.createDraftInvoice(invoiceData), { showToast: false });
        setInvoiceLoading(false);

        if (result?.success) {
            const createdId = result?.data?.id || result?.data?._id || null;
            setTempBill({
                billNo: createdId || generateBillNo(),
                invoiceId: createdId,
                customer: customerName || "Walk-in Customer",
                items: [...cart],
                subtotal, taxTotal, discountAmt, grandTotal,
                paymentMethod, cashReceived: parseFloat(cashReceived) || 0,
                changeDue, date: new Date(),
            });
            setShowPaymentModal(true);
        } else {
            showError(result?.message || "Failed to create draft invoice.");
        }
    };

    const handlePaymentConfirm = async ({ paidAmount, paymentMode }) => {
        if (!tempBill?.invoiceId) return;
        const modeMapping = { cash: "CASH", upi: "UPI", card: "CREDIT_CARD" };
        const storeId = selectedStore?.storeId || selectedStore?._id;

        setIsReleasing(true);
        try {
            const res = await execute(
                invoiceService.releaseInvoice(tempBill.invoiceId, "PAID", storeId, paidAmount, modeMapping[paymentMode] || "CASH"),
                { message: "Payment Recorded Successfully!" }
            );

            if (res?.success) {
                const invId = res?.data?.id || res?.data?._id || tempBill.invoiceId;
                setShowPaymentModal(false);
                if (invId) window.location.assign(`/dashboard/invoices/${invId}?autoPrint=true&redirect=pos`);
            }
        } finally {
            setIsReleasing(false);
        }
    };

    return (
        <>
            <div className="p-4 pt-0 space-y-3">
                {/* Payment method selection */}
                <div className="grid grid-cols-3 gap-2">
                    {PAYMENT_METHODS.map((pm) => {
                        const Icon = pm.icon;
                        const isActive = paymentMethod === pm.id;
                        return (
                            <button
                                key={pm.id}
                                onClick={() => setPaymentMethod(pm.id)}
                                className={`flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-xl border text-[10px] font-semibold uppercase tracking-wider transition-all duration-200 ${isActive
                                    ? "border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))] scale-[1.02]"
                                    : "border-[rgb(var(--color-border-primary))] text-[rgb(var(--color-text-secondary))] hover:border-[rgb(var(--color-primary))]/30 bg-[rgb(var(--color-bg-secondary))] hover:bg-[rgb(var(--color-bg-tertiary))]"
                                    } shadow-sm hover:shadow-md active:scale-[0.98] cursor-pointer`}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? "animate-pulse" : ""}`} />
                                {pm.label}
                            </button>
                        );
                    })}
                </div>

                {/* Cash Received section */}
                {paymentMethod === "cash" && (
                    <div className="animate-in slide-in-from-top-2 duration-300">
                        <input
                            type="number"
                            placeholder="Cash received..."
                            value={cashReceived}
                            onChange={(e) => setCashReceived(e.target.value)}
                            className="w-full px-4 py-3 text-sm rounded-xl border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] transition-all mb-3 text-center font-medium placeholder:font-normal"
                        />
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            {quickAmounts.map((amt) => (
                                <button key={amt} onClick={() => setCashReceived(String(amt))} className="flex-1 min-w-[50px] px-2 py-1.5 text-xs rounded-lg bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border-primary))] text-[rgb(var(--color-text-secondary))] hover:border-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))]/5 shadow-sm active:scale-95 transition-all text-center cursor-pointer">
                                    ₹{amt}
                                </button>
                            ))}
                        </div>
                        {cashReceived && parseFloat(cashReceived) >= grandTotal && (
                            <div className="flex justify-between items-center text-sm font-bold text-green-700 bg-green-50/80 border border-green-200 rounded-xl px-4 py-3 shadow-inner shadow-green-100/50">
                                <span className="opacity-80">Change Due</span>
                                <span className="text-lg">{fmt(changeDue)}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Main Action Button */}
                <button
                    ref={checkoutRef}
                    onClick={handleCheckout}
                    disabled={isCheckoutDisabled}
                    className="w-full py-4 rounded-2xl bg-[rgb(var(--color-primary))] text-white font-black text-sm flex items-center justify-center gap-3 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-[rgb(var(--color-primary))]/30 uppercase tracking-widest mt-2 group cursor-pointer"
                >
                    {invoiceLoading ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing...
                        </div>
                    ) : (
                        <>
                            <Receipt className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            Collect {fmt(grandTotal)}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </div>

            {/* Local Checkout Confirmation Modal */}
            <PaymentConfirmModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onConfirm={handlePaymentConfirm}
                grandTotal={grandTotal}
                initialPaymentMethod={paymentMethod}
                loading={isReleasing}
            />
        </>
    );
};

export default PaymentSection;
