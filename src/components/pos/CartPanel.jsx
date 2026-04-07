import React, { useState, useMemo } from "react";
import {
    CartHeader,
    CustomerSearch,
    CartItemsList,
    CartSummary,
    PaymentSection
} from "./cart";
import { calculateInvoiceGST } from "@/utils/gstCalculator";

// POS Cart Container
const CartPanel = ({ cart, setCart, checkoutRef }) => {
    const [customerName, setCustomerName] = useState("");
    const [globalDiscount, setGlobalDiscount] = useState("");

    // --- Totals Calculation ---
    const mappedItems = useMemo(() => {
        return cart.map((i) => ({
            price: i.pricing?.sellingPrice || i.price || 0,
            quantity: i.qty,
            gstRate: i.gstInfo?.gstRate || i.tax || 0,
            isInclusive: i.gstInfo?.isGstIncluded ?? i.isInclusive ?? true,
        }));
    }, [cart]);

    const gstSummary = calculateInvoiceGST({
        items: mappedItems,
        totalDiscount: globalDiscount || 0,
        discountMode: "POST_TOTAL",
        supplierHasGst: true,
    });

    const { subtotal, totalAmount: grandTotal, gst: { total: taxTotal } } = gstSummary;

    const discountAmt = globalDiscount || 0;

    return (
        <div className="w-80 xl:w-96 flex flex-col bg-[rgb(var(--color-bg-primary))] border-l border-[rgb(var(--color-border-primary))] overflow-hidden shadow-2xl z-10 transition-all duration-300">
            {/* 1. Header & Quick Actions */}
            <CartHeader
                cartCount={cart.reduce((sum, item) => sum + item.qty, 0)}
                onClear={() => setCart([])}
            />

            {/* 2. Walk-in Customer Identification */}
            <CustomerSearch
                customerName={customerName}
                setCustomerName={setCustomerName}
            />

            {/* 3. Product List (Handles local quty & item-discounts) */}
            <CartItemsList
                cart={cart}
                setCart={setCart}
            />

            {/* 4. Totals & Payment (Handles checkout flow) */}
            {cart.length > 0 && (
                <div className="animate-in slide-in-from-bottom duration-500 border-t border-[rgb(var(--color-border-primary))] shadow-[0_-12px_40px_rgba(0,0,0,0.06)] bg-[rgb(var(--color-bg-primary))]">
                    <CartSummary
                        subtotal={subtotal}
                        taxTotal={taxTotal}
                        discountAmt={discountAmt}
                        globalDiscount={globalDiscount}
                        setGlobalDiscount={setGlobalDiscount}
                        grandTotal={grandTotal}
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
