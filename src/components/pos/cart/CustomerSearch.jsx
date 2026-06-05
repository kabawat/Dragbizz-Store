"use client";
import React from "react";
import { User } from "lucide-react";

// Handles basic customer identification in POS (currently simple string input)
const CustomerSearch = ({ customerName, setCustomerName }) => {
    return (
        <div className="px-4 py-2 border-b border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))]">
            <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[rgb(var(--color-text-secondary))] group-focus-within:text-[rgb(var(--color-primary))] transition-colors" />
                <input
                    type="text"
                    placeholder="Customer name (optional)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border-primary))] rounded-lg text-[rgb(var(--color-text-primary))] placeholder-[rgb(var(--color-text-secondary))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--color-primary))] transition-all"
                />
            </div>
        </div>
    );
};

export default CustomerSearch;
