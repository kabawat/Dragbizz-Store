"use client";
import { useState } from "react";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";

// ─── Extracted Components ────────
import POSSuccessScreen from "@/components/pos/POSSuccessScreen";
import ProductPanel from "@/components/pos/ProductPanel";
import CartPanel from "@/components/pos/CartPanel";

// ─── Main POS Page ───────────────────────
const POSPage = () => {
    const [cart, setCart] = useState([]);
    const [showSuccess, setShowSuccess] = useState(false);
    const [lastBill, setLastBill] = useState(null);

    // ── Cart operations ──────────────────
    const addToCart = (product) => {
        setCart((prev) => {
            const exists = prev.find((i) => i.id === product.id);
            if (exists) return prev.map((i) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
            return [...prev, { ...product, qty: 1, discount: 0 }];
        });
    };

    // ── Checkout ─────────────────────────
    const handleCheckoutSuccess = (bill) => {
        setLastBill(bill);
        setShowSuccess(true);
    };

    const handleNewSale = () => {
        setCart([]);
        setShowSuccess(false);
        setLastBill(null);
    };

    // SUCCESS SCREEN
    if (showSuccess && lastBill) {
        return <POSSuccessScreen lastBill={lastBill} handleNewSale={handleNewSale} />;
    }

    // MAIN POS LAYOUT
    return (
        <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title="POS" description="Point of Sale — fast billing at your fingertips" />

                <div className="flex flex-1 overflow-hidden gap-0">
                    <ProductPanel addToCart={addToCart} />

                    <CartPanel
                        cart={cart}
                        setCart={setCart}
                        onCheckout={handleCheckoutSuccess}
                    />
                </div>
            </div>
        </div>
    );
};

export default POSPage;
