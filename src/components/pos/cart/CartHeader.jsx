"use client";
import React from "react";
import { ShoppingCart, Trash2 } from "lucide-react";

const CartHeader = ({ cartCount, onClear }) => {
    return (
        <div className="px-4 py-3 border-b border-[rgb(var(--color-border-primary))] flex items-center justify-between bg-[rgb(var(--color-bg-primary))]">
            <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                <span className="font-semibold text-[rgb(var(--color-text-primary))]">Cart</span>
                <span className="bg-[rgb(var(--color-primary))] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cartCount}
                </span>
            </div>
            <button
                onClick={onClear}
                className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                disabled={cartCount === 0}
            >
                <Trash2 className="w-3 h-3" /> Clear
            </button>
        </div>
    );
};

export default CartHeader;
