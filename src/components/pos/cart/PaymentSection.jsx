"use client";
import React, { useState } from "react";
import { Receipt, ArrowRight, Loader2 } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { useGlobalToast } from "@/contexts/ToastContext";
import useApiResponse from "@/hooks/useApiResponse";
import { invoiceService } from "@/service";
import PaymentConfirmModal from "../PaymentConfirmModal";

const fmt = (n) => `₹${Number(n).toFixed(2)}`;
const generateBillNo = () => `POS-${Date.now().toString().slice(-6)}`;

const PaymentSection = ({
    cart,
    customerName,
    globalDiscount,
    grandTotal,
    subtotal,
    taxTotal,
    discountAmt,
    checkoutRef,
}) => {
    const [invoiceLoading, setInvoiceLoading] = useState(false);
    const [isReleasing, setIsReleasing] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [tempBill, setTempBill] = useState(null);

    const { selectedStore } = useAppSelector((state) => state.profile);
    const { showError } = useGlobalToast();
    const { execute } = useApiResponse();

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
                subtotal,
                taxTotal,
                discountAmt,
                grandTotal,
                date: new Date(),
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
            <div className="p-4 pt-0">
                <button
                    ref={checkoutRef}
                    onClick={handleCheckout}
                    disabled={invoiceLoading}
                    className="w-full py-4 rounded-2xl bg-[rgb(var(--color-primary))] text-white font-black text-sm flex items-center justify-center gap-3 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest group cursor-pointer"
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

            <PaymentConfirmModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onConfirm={handlePaymentConfirm}
                grandTotal={grandTotal}
                loading={isReleasing}
            />
        </>
    );
};

export default PaymentSection;
