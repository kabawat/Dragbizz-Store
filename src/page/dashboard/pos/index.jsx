"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import ProductPanel from "@/components/pos/ProductPanel";
import CartPanel from "@/components/pos/CartPanel";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useHotkeys } from "@/hooks/keyboard/useHotkeys";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";

const fmt = (n) =>
    `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const POSPage = () => {
    const { t } = useTranslation();
    const [cart, setCart] = useState([]);
    const [mobileCartOpen, setMobileCartOpen] = useState(false);
    const [cartSummary, setCartSummary] = useState({ grandTotal: 0, itemCount: 0 });

    useDashboardHeader(t("pos.title"), t("pos.description"));

    const searchRef = useRef(null);
    const checkoutRef = useRef(null);

    const addToCart = (product) => {
        setCart((prev) => {
            const prodId = product.id || product._id;
            const exists = prev.find((i) => (i.id || i._id) === prodId);
            if (exists) {
                return prev.map((i) =>
                    (i.id || i._id) === prodId ? { ...i, qty: i.qty + 1 } : i
                );
            }
            return [...prev, { ...product, id: prodId, qty: 1, discount: 0 }];
        });
    };

    const handleTotalsChange = useCallback(({ grandTotal, itemCount }) => {
        setCartSummary({ grandTotal, itemCount });
    }, []);

    useEffect(() => {
        if (!mobileCartOpen) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [mobileCartOpen]);

    useHotkeys({
        "/": (e) => {
            e.preventDefault();
            searchRef.current?.focus();
        },
        "ctrl+k": (e) => {
            e.preventDefault();
            searchRef.current?.focus();
        },
        "ctrl+delete": (e) => {
            e.preventDefault();
            setCart([]);
            setMobileCartOpen(false);
        },
        "ctrl+enter": (e) => {
            e.preventDefault();
            if (cart.length === 0) return;
            setMobileCartOpen(true);
            setTimeout(() => checkoutRef.current?.click(), 100);
        },
    });

    const showMobileCartBar = cart.length > 0 && !mobileCartOpen;

    return (
        <div className="relative flex flex-col lg:flex-row flex-1 min-h-0 h-[calc(100dvh-64px)] max-h-[calc(100dvh-64px)] overflow-hidden">
            {mobileCartOpen && (
                <button
                    type="button"
                    aria-label="Close cart"
                    className="lg:hidden absolute inset-0 z-40 bg-[rgb(var(--color-bg-primary))]/55 backdrop-blur-[0px]"
                    onClick={() => setMobileCartOpen(false)}
                />
            )}

            <div
                className={`flex-1 min-h-0 min-w-0 flex flex-col ${mobileCartOpen ? "pointer-events-none lg:pointer-events-auto" : ""}`}
            >
                <div className="flex-1 min-h-0 overflow-hidden">
                    <ProductPanel addToCart={addToCart} searchRef={searchRef} />
                </div>

                {showMobileCartBar && (
                    <div className="lg:hidden flex-shrink-0 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-[rgb(var(--color-bg-primary))] border-t border-[rgb(var(--color-border-primary))] shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
                        <button
                            type="button"
                            onClick={() => setMobileCartOpen(true)}
                            className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[rgb(var(--color-primary))] text-white font-semibold text-sm active:scale-[0.98] transition-transform cursor-pointer"
                        >
                            <span className="flex items-center gap-2 min-w-0">
                                <ShoppingCart className="w-5 h-5 flex-shrink-0" />
                                <span className="truncate">
                                    View Cart ({cartSummary.itemCount})
                                </span>
                            </span>
                            <span className="font-bold tabular-nums flex-shrink-0">
                                {fmt(cartSummary.grandTotal)}
                            </span>
                        </button>
                    </div>
                )}
            </div>

            <CartPanel
                cart={cart}
                setCart={setCart}
                checkoutRef={checkoutRef}
                mobileOpen={mobileCartOpen}
                onMobileClose={() => setMobileCartOpen(false)}
                onTotalsChange={handleTotalsChange}
            />

        </div>
    );
};

export default POSPage;
