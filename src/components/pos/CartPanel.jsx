import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    CartHeader,
    CustomerSearch,
    CartItemsList,
    CartSummary,
    PaymentSection,
} from "./cart";
import { useAppSelector } from "@/store/hooks";
import { invoiceService } from "@/service";
import useApiResponse from "@/hooks/useApiResponse";

const CartPanel = ({
    cart,
    setCart,
    checkoutRef,
    mobileOpen = false,
    onMobileClose,
    onTotalsChange,
}) => {
    const [customerName, setCustomerName] = useState("");
    const [globalDiscount, setGlobalDiscount] = useState("");
    const [totals, setTotals] = useState({
        subtotal: 0,
        taxTotal: 0,
        grandTotal: 0,
        gstBreakdown: null,
    });
    const [calculating, setCalculating] = useState(false);

    const { selectedStore } = useAppSelector((state) => state.profile);
    const storeId = selectedStore?.storeId || selectedStore?._id;
    const { execute } = useApiResponse();
    const debounceRef = useRef(null);

    const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);

    const fetchTotals = useCallback(async () => {
        if (!storeId || cart.length === 0) {
            setTotals({ subtotal: 0, taxTotal: 0, grandTotal: 0, gstBreakdown: null });
            return;
        }

        setCalculating(true);
        const result = await execute(
            invoiceService.calculateInvoicePreview(
                {
                    store: storeId,
                    items: cart.map((item) => ({
                        product: item.id || item._id,
                        quantity: item.qty,
                    })),
                    totalDiscount: Number(globalDiscount) || 0,
                    discountMode: "POST_TOTAL",
                    isWalkin: true,
                },
                { store: storeId }
            ),
            { showToast: false }
        );
        setCalculating(false);

        if (result?.success) {
            const data = result.data;
            setTotals({
                subtotal: data?.subtotal ?? 0,
                taxTotal: data?.gst?.amount ?? data?.gst?.breakdown?.total ?? 0,
                grandTotal: data?.totalAmount ?? 0,
                gstBreakdown: data?.gst?.breakdown ?? null,
            });
        }
    }, [cart, globalDiscount, storeId, execute]);

    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(fetchTotals, 300);
        return () => clearTimeout(debounceRef.current);
    }, [fetchTotals]);

    const { subtotal, taxTotal, grandTotal, gstBreakdown } = totals;
    const discountAmt = Number(globalDiscount) || 0;

    useEffect(() => {
        onTotalsChange?.({ grandTotal, itemCount });
    }, [grandTotal, itemCount, onTotalsChange]);

    useEffect(() => {
        if (cart.length === 0 && mobileOpen) {
            onMobileClose?.();
        }
    }, [cart.length, mobileOpen, onMobileClose]);

    return (
        <div
            className={`
                flex flex-col bg-[rgb(var(--color-bg-primary))] border-[rgb(var(--color-border-primary))] overflow-hidden transition-transform duration-300 ease-out
                absolute top-0 right-0 bottom-0 w-full max-w-md z-50 shadow-2xl border-l border-[rgb(var(--color-border-primary))]
                lg:relative lg:inset-auto lg:z-10 lg:w-80 xl:w-96 lg:max-w-none lg:shadow-none
                ${mobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
            `}
        >
            <CartHeader
                cartCount={itemCount}
                onClear={() => setCart([])}
                onClose={onMobileClose}
            />

            <CustomerSearch
                customerName={customerName}
                setCustomerName={setCustomerName}
            />

            <CartItemsList cart={cart} setCart={setCart} />

            {cart.length > 0 && (
                <div className="flex-shrink-0 animate-in slide-in-from-bottom duration-500 border-t border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))]">
                    <CartSummary
                        subtotal={subtotal}
                        taxTotal={taxTotal}
                        gstBreakdown={gstBreakdown}
                        discountAmt={discountAmt}
                        globalDiscount={globalDiscount}
                        setGlobalDiscount={setGlobalDiscount}
                        grandTotal={grandTotal}
                        calculating={calculating}
                    />

                    <PaymentSection
                        cart={cart}
                        customerName={customerName}
                        globalDiscount={globalDiscount}
                        grandTotal={grandTotal}
                        subtotal={subtotal}
                        taxTotal={taxTotal}
                        discountAmt={discountAmt}
                        checkoutRef={checkoutRef}
                    />
                </div>
            )}
        </div>
    );
};

export default CartPanel;
