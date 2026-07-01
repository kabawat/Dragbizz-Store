"use client";
import React, { useState } from "react";
import { Receipt, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui";
import { useAppSelector } from "@/store/hooks";
import { useGlobalToast } from "@/contexts/ToastContext";
import useApiResponse from "@/hooks/useApiResponse";
import { invoiceService } from "@/service";
import { pickStoreId } from "@/utils/store.util";

const fmt = (n) => `₹${Number(n).toFixed(2)}`;

const PaymentSection = ({
    cart,
    globalDiscount,
    grandTotal,
    checkoutRef,
    onCheckoutComplete,
    onDraftCreated,
}) => {
    const [invoiceLoading, setInvoiceLoading] = useState(false);
    const { selectedStore } = useAppSelector((state) => state.profile);
    const { showError } = useGlobalToast();
    const { execute } = useApiResponse();

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
            const createdId = result?.data?.id;
            if (!createdId) {
                showError("Failed to create draft invoice.");
                return;
            }
            onCheckoutComplete?.();
            onDraftCreated?.(createdId);
        } else {
            showError(result?.message || "Failed to create draft invoice.");
        }
    };

    return (
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
    );
};

export default PaymentSection;
