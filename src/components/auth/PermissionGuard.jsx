"use client";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";

export const PermissionGuard = ({ children }) => {
    const pathname = usePathname();
    const router = useRouter();
    const { authProfile, staffProfile } = useAppSelector((state) => state.profile);
    const [hasAccess, setHasAccess] = useState(true);

    useEffect(() => {
        // Only apply checks if user is store_staff
        if (authProfile?.role !== "store_staff") {
            setHasAccess(true);
            return;
        }

        // Always allowed paths for staff
        const ALLOWED_EXACT_PATHS = ["/dashboard", "/dashboard/support", "/dashboard/settings", "/dashboard/pos"];
        if (ALLOWED_EXACT_PATHS.includes(pathname)) {
            setHasAccess(true);
            return;
        }

        // Staff can never access staff management page
        if (pathname === "/dashboard/staff" || pathname.startsWith("/dashboard/staff/")) {
            setHasAccess(false);
            return;
        }

        const permissions = staffProfile?.permissions || [];

        // Check analytics routes
        if (pathname.startsWith("/dashboard/analytics")) {
            const pm = permissions.find(p => p.module === "analytics" || p.module === "reports");
            if (pm?.read || pm?.analytics || pm?.report) {
                setHasAccess(true);
            } else {
                setHasAccess(false);
            }
            return;
        }

        // Map routes to their respective modules
        const ROUTE_MODULE_MAP = {
            "/dashboard/customers": "customer",
            "/dashboard/invoices": "invoice",
            "/dashboard/expenses": "expense",
            "/dashboard/sales-order": "sales_order",
            "/dashboard/products": "product",
            "/dashboard/stock": "inventory",
            "/dashboard/suppliers": "supplier",
            "/dashboard/purchase-orders": "purchase_order",
            "/dashboard/bills": "billing",
            "/dashboard/payments": "billing",
        };

        // Find which module this route belongs to
        const getModuleForPath = (path) => {
            for (const [key, module] of Object.entries(ROUTE_MODULE_MAP)) {
                if (path === key || path.startsWith(`${key}/`)) {
                    return module;
                }
            }
            return null; // Route is not restricted by standard mapping
        };

        const moduleName = getModuleForPath(pathname);

        if (moduleName) {
            const pm = permissions.find(p => p.module === moduleName);
            // Default check is minimum `read` access for navigating to the page
            if (pm?.read === true) {
                setHasAccess(true);
            } else {
                setHasAccess(false);
            }
        } else {
            // Unmapped routes are accessible by default once they load, unless restricted explicitly
            setHasAccess(true);
        }

    }, [pathname, authProfile, staffProfile]);

    if (!hasAccess) {
        return (
            <div className="relative flex flex-col items-center justify-center min-h-[80vh] overflow-hidden px-6">
                {/* Ambient background glow */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[120px]" />
                    <div className="absolute top-1/3 left-1/3 w-[200px] h-[200px] bg-[rgb(var(--color-primary))]/5 rounded-full blur-[80px]" />
                </div>

                {/* Card */}
                <div className="relative z-10 w-full max-w-md bg-[rgb(var(--color-bg-primary))]/60 backdrop-blur-xl border border-[rgb(var(--color-border-primary))]/50 rounded-2xl shadow-2xl p-10 flex flex-col items-center text-center">

                    {/* Icon with pulse rings */}
                    <div className="relative mb-8">
                        <span className="absolute inset-0 rounded-full bg-red-500/10 animate-ping" style={{ animationDuration: "2s" }} />
                        <span className="absolute -inset-3 rounded-full bg-red-500/5" />
                        <div className="relative w-20 h-20 bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30 rounded-full flex items-center justify-center shadow-lg shadow-red-500/20">
                            <ShieldAlert className="w-9 h-9 text-red-500" />
                        </div>
                    </div>

                    {/* Badge */}
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-red-500 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full mb-5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        Permission Denied
                    </span>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-[rgb(var(--color-text-primary))] mb-3">
                        Access Restricted
                    </h1>

                    {/* Description */}
                    <p className="text-sm text-[rgb(var(--color-text-secondary))] leading-relaxed mb-8">
                        You don&apos;t have permission to view this page. Please contact your{" "}
                        <span className="text-[rgb(var(--color-primary))] font-medium">store owner</span>{" "}
                        to request access to this section.
                    </p>

                    {/* Divider */}
                    <div className="w-full h-px bg-[rgb(var(--color-border-primary))]/50 mb-8" />

                    {/* Button */}
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="group w-full flex items-center justify-center gap-2 px-6 py-3 bg-[rgb(var(--color-primary))] text-white font-semibold rounded-xl hover:bg-[rgb(var(--color-primary))]/90 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[rgb(var(--color-primary))]/25"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return children;
};
