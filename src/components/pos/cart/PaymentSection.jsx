"use client";
import React, { useState } from "react";
import { Receipt, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui";
import { useAppSelector } from "@/store/hooks";
import { useGlobalToast } from "@/contexts/ToastContext";
import useApiResponse from "@/hooks/useApiResponse";
import { invoiceService } from "@/service";
import PaymentConfirmModal from "../PaymentConfirmModal";
import { useStoreDefaultUpi } from "@/hooks/store/useStoreDefaultUpi";
import { pickStoreId } from "@/utils/store.util";

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

    const storeId = pickStoreId(selectedStore);
    const {
        defaultUpi,
        isLoading: upiLoading,
        missingDefault,
        noUpiConfigured,
    } = useStoreDefaultUpi(storeId, { enabled: showPaymentModal });

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        const storeId = pickStoreId(selectedStore);
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
        const storeId = pickStoreId(selectedStore);

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
                <div
                    ref={(el) => {
                        if (checkoutRef) checkoutRef.current = el?.querySelector("button") ?? null;
                    }}
                    className="w-full"
                >
                    <Button
                        variant="primary"
                        size="md"
                        fullWidth
                        onClick={handleCheckout}
                        disabled={invoiceLoading}
                        loading={invoiceLoading}
                        leftIcon={Receipt}
                        rightIcon={ArrowRight}
                        className="uppercase tracking-wide font-semibold"
                    >
                        Collect {fmt(grandTotal)}
                    </Button>
                </div>
            </div>

            <PaymentConfirmModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onConfirm={handlePaymentConfirm}
                grandTotal={grandTotal}
                loading={isReleasing}
                defaultUpi={defaultUpi}
                storeName={selectedStore?.storeName}
                upiLoading={upiLoading}
                missingDefault={missingDefault}
                noUpiConfigured={noUpiConfigured}
            />
        </>
    );
};

export default PaymentSection;
