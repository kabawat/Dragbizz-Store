"use client";

import { useHotkeys } from "@/hooks/useHotkeys";
import { useRouter } from "next/navigation";
import { useGlobalToast } from "@/contexts/ToastContext";

const GlobalHotkeys = () => {
    const router = useRouter();
    const { showSuccess } = useGlobalToast();

    useHotkeys({
        // --- General Navigation ---
        "alt+h": (e) => {
            e.preventDefault();
            router.push("/dashboard");
        },
        "alt+g": (e) => { // Settings (Gear)
            e.preventDefault();
            router.push("/dashboard/settings");
        },
        "alt+a": (e) => { // Analytics
            e.preventDefault();
            router.push("/dashboard/analytics/revenue");
        },

        // --- Sales & Transactions ---
        "alt+c": (e) => {
            e.preventDefault();
            router.push("/dashboard/customers");
        },
        "alt+i": (e) => {
            e.preventDefault();
            router.push("/dashboard/invoices");
        },
        "alt+e": (e) => { // Expenses
            e.preventDefault();
            router.push("/dashboard/expenses");
        },
        "alt+o": (e) => { // Sell Orders
            e.preventDefault();
            router.push("/dashboard/sales-order");
        },

        // --- Inventory ---
        "alt+p": (e) => {
            e.preventDefault();
            router.push("/dashboard/products");
        },
        "alt+s": (e) => { // Stock
            e.preventDefault();
            router.push("/dashboard/stock");
        },

        // --- Purchase ---
        "alt+u": (e) => { // sUppliers (S is taken)
            e.preventDefault();
            router.push("/dashboard/suppliers");
        },
        "alt+shift+o": (e) => { // Purchase Orders (Alt+O is Sell Orders)
            e.preventDefault();
            router.push("/dashboard/purchase-orders");
        },
        "alt+b": (e) => { // Bills
            e.preventDefault();
            router.push("/dashboard/bills");
        },
        "alt+y": (e) => { // PaYments (P is taken)
            e.preventDefault();
            router.push("/dashboard/payments");
        },

        // --- Help ---
        "shift+?": (e) => {
            e.preventDefault();
            showSuccess("Shortcuts: Alt+H (Home), Alt+I (Invoices), Alt+P (Products), Alt+C (Customers), etc.");
        },
    });

    return null; // This component doesn't render anything
};

export default GlobalHotkeys;
