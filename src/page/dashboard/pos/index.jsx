"use client";
import React, { useState, useRef } from "react";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import ProductPanel from "@/components/pos/ProductPanel";
import CartPanel from "@/components/pos/CartPanel";
import { useHotkeys } from "@/hooks/keyboard/useHotkeys";

const POSPage = () => {
    const [cart, setCart] = useState([]);

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
        <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title="POS" description="Point of Sale — fast billing at your fingertips" />

                <div className="flex flex-1 overflow-hidden gap-0">
                    <ProductPanel addToCart={addToCart} searchRef={searchRef} />

                    <CartPanel
                        cart={cart}
                        setCart={setCart}
                        checkoutRef={checkoutRef}
                    />
                </div>
            </div>
        </div>
    );
};

export default POSPage;
