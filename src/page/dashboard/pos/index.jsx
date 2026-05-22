"use client";
import React, { useState, useRef } from "react";
import ProductPanel from "@/components/pos/ProductPanel";
import CartPanel from "@/components/pos/CartPanel";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useHotkeys } from "@/hooks/keyboard/useHotkeys";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";

const POSPage = () => {
    const { t } = useTranslation();
    const [cart, setCart] = useState([]);
    useDashboardHeader(t("pos.title"), t("pos.description"));
    // Refs exposed to shortcuts
    const searchRef = useRef(null);
    const checkoutRef = useRef(null);

    // ── Cart operations ──────────────────
    const addToCart = (product) => {
        setCart((prev) => {
            const prodId = product.id || product._id;
            const exists = prev.find((i) => (i.id || i._id) === prodId);
            if (exists) return prev.map((i) => (i.id || i._id) === prodId ? { ...i, qty: i.qty + 1 } : i);
            return [...prev, { ...product, id: prodId, qty: 1, discount: 0 }];
        });
    };

    // ── POS Keyboard Shortcuts ────────────
    useHotkeys({
        // Focus search
        "/": (e) => {
            e.preventDefault();
            searchRef.current?.focus();
        },
        "ctrl+k": (e) => {
            e.preventDefault();
            searchRef.current?.focus();
        },
        // Clear cart
        "ctrl+delete": (e) => {
            e.preventDefault();
            setCart([]);
        },
        // Checkout (trigger button click)
        "ctrl+enter": (e) => {
            e.preventDefault();
            checkoutRef.current?.click();
        },
    });

    return (
        <div className="flex flex-1 overflow-hidden gap-0 h-[calc(100vh-64px)]">
            <ProductPanel addToCart={addToCart} searchRef={searchRef} />
            <CartPanel
                cart={cart}
                setCart={setCart}
                checkoutRef={checkoutRef}
            />
        </div>
    );
};

export default POSPage;
