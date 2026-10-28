"use client";
import { usePathname, useRouter } from "next/navigation";
import { useHotkeys } from "@/hooks/keyboard/useHotkeys";
import { useSubscriptionAccess } from "@/hooks/permissions/useSubscriptionAccess";
import { useAppDispatch } from "@/store/hooks";
import { toggleSidebar } from "@/store/slices/uiSlice";

// GlobalHotkeys Component Handles strictly global navigation shortcuts (Alt + Key) and global Help navigation.
const GlobalHotkeys = () => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { withAccess } = useSubscriptionAccess();

  const navigateTo = (
    path,
    moduleName = null,
    requireAnalytics = false,
    requireCapability = null
  ) => {
    withAccess(
      moduleName,
      () => router.push(path),
      requireAnalytics,
      false,
      false,
      requireCapability
    )();
  };

  const hotkeys = {
    // --- Sidebar Toggle ---
    "alt+\\": (e) => {
      // Alt+\ → toggle sidebar (VS Code style)
      e.preventDefault();
      dispatch(toggleSidebar());
    },

    // --- Global Navigation ---
    "alt+h": (e) => {
      e.preventDefault();
      router.push("/dashboard");
    },
    "alt+g": (e) => {
      // Settings (Gear)
      e.preventDefault();
      router.push("/dashboard/settings");
    },
    "alt+a": (e) => {
      // Analytics
      e.preventDefault();
      navigateTo("/dashboard/analytics/revenue", "invoice"); // Analytics usually depends on main modules
    },
    "alt+c": (e) => {
      // Customers
      e.preventDefault();
      navigateTo("/dashboard/customers", "customer");
    },
    "alt+i": (e) => {
      // Invoices
      e.preventDefault();
      navigateTo("/dashboard/invoices", "invoice");
    },
    "alt+p": (e) => {
      // Products
      e.preventDefault();
      navigateTo("/dashboard/products", "product");
    },
    "alt+e": (e) => {
      // Expenses
      e.preventDefault();
      navigateTo("/dashboard/expenses", "expense");
    },
    "alt+u": (e) => {
      // Suppliers
      e.preventDefault();
      navigateTo("/dashboard/suppliers", "supplier");
    },
    "alt+b": (e) => {
      // Bills
      e.preventDefault();
      navigateTo("/dashboard/bills", "billing");
    },
    "alt+y": (e) => {
      // Payments
      e.preventDefault();
      navigateTo("/dashboard/payments", "billing");
    },
    "alt+o": (e) => {
      // Sales Orders
      e.preventDefault();
      navigateTo("/dashboard/sales-order", "invoice");
    },
    "alt+shift+o": (e) => {
      // Purchase Orders
      e.preventDefault();
      navigateTo("/dashboard/purchase-orders", "purchase_order");
    },
    "alt+q": (e) => {
      // Support Center (Questions)
      e.preventDefault();
      router.push("/dashboard/support");
    },
    // --- Management Navigation ---
    "alt+f": (e) => {
      // Staff
      e.preventDefault();
      router.push("/dashboard/management/staff");
    },
    "alt+m": (e) => {
      // Subscription (Management)
      e.preventDefault();
      router.push("/dashboard/management/subscription");
    },
    "alt+l": (e) => {
      // Limits
      e.preventDefault();
      router.push("/dashboard/management/limits");
    },

    "alt+k": (e) => {
      e.preventDefault();
      navigateTo("/dashboard/pos", "invoice", false, "pos");
    },
    "alt+shift+s": (e) => {
      e.preventDefault();
      navigateTo("/dashboard/analytics/stock", "product", true);
    },
    "alt+shift+c": (e) => {
      e.preventDefault();
      navigateTo("/dashboard/cashbook", "cashbook");
    },
    // --- Global Control ---
    "shift+backspace": (e) => {
      // Global "Back"
      e.preventDefault();
      router.back();
    },

    // --- Help ---
    "shift+?": (e) => {
      // Open Support/Help Center
      e.preventDefault();
      router.push("/dashboard/support");
    },
  };
  useHotkeys(pathname?.startsWith("/dashboard") ? hotkeys : {});

  return null;
};

export default GlobalHotkeys;
