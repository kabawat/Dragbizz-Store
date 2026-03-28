"use client";

import { useHotkeys } from "@/hooks/keyboard/useHotkeys";
import { useAppDispatch } from "@/store/hooks";
import { toggleSidebar } from "@/store/slices/uiSlice";
import { useRouter } from "next/navigation";


// GlobalHotkeys Component Handles strictly global navigation shortcuts (Alt + Key) and global Help navigation.
const GlobalHotkeys = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();

    useHotkeys({
        // --- Sidebar Toggle ---
        "alt+\\": (e) => {  // Alt+\ → toggle sidebar (VS Code style)
            e.preventDefault();
            dispatch(toggleSidebar());
        },

        // --- Global Navigation ---
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
        "alt+c": (e) => { // Customers
            e.preventDefault();
            router.push("/dashboard/customers");
        },
        "alt+i": (e) => { // Invoices
            e.preventDefault();
            router.push("/dashboard/invoices");
        },
        "alt+p": (e) => { // Products
            e.preventDefault();
            router.push("/dashboard/products");
        },
        "alt+e": (e) => { // Expenses
            e.preventDefault();
            router.push("/dashboard/expenses");
        },
        "alt+s": (e) => { // Stock
            e.preventDefault();
            router.push("/dashboard/stock");
        },
        "alt+u": (e) => { // Suppliers
            e.preventDefault();
            router.push("/dashboard/suppliers");
        },
        "alt+b": (e) => { // Bills
            e.preventDefault();
            router.push("/dashboard/bills");
        },
        "alt+y": (e) => { // Payments
            e.preventDefault();
            router.push("/dashboard/payments");
        },
        "alt+o": (e) => { // Sales Orders
            e.preventDefault();
            router.push("/dashboard/sales-order");
        },
        "alt+shift+o": (e) => { // Purchase Orders
            e.preventDefault();
            router.push("/dashboard/purchase-orders");
        },
        "alt+q": (e) => { // Support Center (Questions)
            e.preventDefault();
            router.push("/dashboard/support");
        },
        // --- Management Navigation ---
        "alt+f": (e) => { // Staff
            e.preventDefault();
            router.push("/dashboard/management/staff");
        },
        "alt+m": (e) => { // Subscription (Management)
            e.preventDefault();
            router.push("/dashboard/management/subscription");
        },
        "alt+l": (e) => { // Limits
            e.preventDefault();
            router.push("/dashboard/management/limits");
        },

        // --- Global Control ---
        "shift+backspace": (e) => { // Global "Back"
            e.preventDefault();
            router.back();
        },

        // --- Help ---
        "shift+?": (e) => { // Open Support/Help Center
            e.preventDefault();
            router.push("/dashboard/support");
        },
    });

    return null;
};

export default GlobalHotkeys;
