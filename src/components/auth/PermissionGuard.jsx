"use client";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";
import { ROLES } from "@/hooks/permissions/useModulePermissions";

export const PermissionGuard = ({ children }) => {
    const pathname = usePathname();
    const router = useRouter();
    const { 
        authProfile, 
        authProfileLoading, 
        staffProfile, 
        staffProfileLoading,
        isAuthenticated 
    } = useAppSelector((state) => state.profile);
    
    const [hasAccess, setHasAccess] = useState(true);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // 1. Determine if we are still loading credentials
        const isLoading = (authProfileLoading && !authProfile) || (staffProfileLoading && !staffProfile);
        
        if (isLoading) {
            setIsChecking(true);
            return;
        }

        // 2. If not authenticated after loading, let AuthGuard handle it
        if (!isAuthenticated || !authProfile) {
            setIsChecking(false);
            setHasAccess(true); // Don't show restricted screen for unauth users
            return;
        }

        // 3. Store Owner has full access
        if (authProfile?.role === ROLES.OWNER) {
            setHasAccess(true);
            setIsChecking(false);
            return;
        }

        // 4. Staff logic starts here
        const permissions = staffProfile?.permissions || [];

        // Always allowed paths for staff
        const ALLOWED_EXACT_PATHS = [
            "/dashboard",
            "/dashboard/support",
            "/dashboard/settings"
        ];

        if (ALLOWED_EXACT_PATHS.includes(pathname)) {
            setHasAccess(true);
            setIsChecking(false);
            return;
        }

        // Staff can never access management features (Staff, Subscription, Plan limits)
        if (pathname === "/dashboard/management" || pathname.startsWith("/dashboard/management/")) {
            setHasAccess(false);
            setIsChecking(false);
            return;
        }

        // Route to module mapping
        const ROUTE_MODULE_MAP = {
            "/dashboard/customers": "customer",
            "/dashboard/invoices": "invoice",
            "/dashboard/invoices/create": "invoice",
            "/dashboard/expenses": "expense",
            "/dashboard/sales-order": "sales_order",
            "/dashboard/products": "product",
            "/dashboard/products/create": "product",
            "/dashboard/stock": "inventory",
            "/dashboard/suppliers": "supplier",
            "/dashboard/purchase-orders": "purchase_order",
            "/dashboard/bills": "billing",
            "/dashboard/payments": "billing",
            "/dashboard/analytics": "analytics",
            "/dashboard/reports": "reports",
        };

        // Detect module from path
        const getModuleFromPath = (path) => {
            for (const [route, module] of Object.entries(ROUTE_MODULE_MAP)) {
                if (path === route || path.startsWith(route + "/")) {
                    return module;
                }
            }
            return null;
        };

        // Detect action from path
        const getActionFromPath = (path) => {
            if (path.includes("/create")) return "create";
            if (path.includes("/edit")) return "edit";
            if (path.includes("/analytics")) return "analytics";
            if (path.includes("/report")) return "report";
            return "read";
        };

        const moduleName = getModuleFromPath(pathname);
        const action = getActionFromPath(pathname);

        // Route not in map → allow by default
        if (!moduleName) {
            setHasAccess(true);
            setIsChecking(false);
            return;
        }

        const modulePermission = permissions.find((p) => p.module === moduleName);

        // Module permission not assigned at all → deny
        if (!modulePermission) {
            setHasAccess(false);
            setIsChecking(false);
            return;
        }

        // Check exact action permission
        setHasAccess(modulePermission[action] === true);
        setIsChecking(false);

    }, [pathname, authProfile, staffProfile, authProfileLoading, staffProfileLoading, isAuthenticated]);

    // Show nothing (or a subtle loader) while checking permissions
    if (isChecking) {
        return null; // Or a minimalist loading bar
    }

    if (!hasAccess) {
        return (
            <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] overflow-hidden">
                <Sidebar />

                <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
                    <Header title="Access Restricted" description="You do not have permission to view this page" />

                    {/* Content area */}
                    <div className="flex-1 relative overflow-hidden flex items-center justify-center">

                        {/* Subtle background glows */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-red-500/6 rounded-full blur-[120px]" />
                            <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-[rgb(var(--color-primary))]/5 rounded-full blur-[100px]" />
                        </div>

                        {/* Main layout — two column */}
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-16 px-8 max-w-4xl w-full">

                            {/* Left — large decorative 403 block */}
                            <div className="flex flex-col items-center select-none">
                                <div className="relative">
                                    {/* Big 403 number */}
                                    <span className="text-[140px] font-black leading-none tracking-tighter text-[rgb(var(--color-text-primary))]/5 select-none">
                                        403
                                    </span>

                                    {/* Centered shield over 403 */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="relative">
                                            {/* Outer ping */}
                                            <span
                                                className="absolute inset-0 rounded-full bg-red-500/20 animate-ping"
                                                style={{ animationDuration: "2.5s" }}
                                            />
                                            {/* Icon container */}
                                            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-red-500/25 to-red-700/10 border border-red-500/30 shadow-xl shadow-red-500/20 flex items-center justify-center">
                                                <ShieldAlert className="w-11 h-11 text-red-500 drop-shadow-sm" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Pulsing status pill below 403 */}
                                <span className="mt-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-red-500 bg-red-500/10 border border-red-500/20 px-4 py-1.5 rounded-full">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                    Permission Denied
                                </span>
                            </div>

                            {/* Vertical divider (desktop only) */}
                            <div className="hidden md:block w-px h-48 bg-gradient-to-b from-transparent via-[rgb(var(--color-border-primary))] to-transparent flex-shrink-0" />

                            {/* Right — text + button */}
                            <div className="flex flex-col items-start max-w-sm">
                                <h1 className="text-3xl font-bold text-[rgb(var(--color-text-primary))] mb-3 leading-tight">
                                    Access <span className="text-red-500">Restricted</span>
                                </h1>

                                <p className="text-sm text-[rgb(var(--color-text-secondary))] leading-relaxed mb-2">
                                    You don&apos;t have the required permissions to view this section.
                                </p>
                                <p className="text-sm text-[rgb(var(--color-text-secondary))] leading-relaxed mb-8">
                                    Please contact your{" "}
                                    <span className="text-[rgb(var(--color-primary))] font-semibold">store owner</span>{" "}
                                    to request access.
                                </p>

                                {/* Divider */}
                                <div className="w-full h-px bg-[rgb(var(--color-border-primary))]/40 mb-8" />

                                {/* Return button */}
                                <button
                                    onClick={() => router.push("/dashboard")}
                                    className="group flex items-center gap-2.5 px-6 py-3 bg-[rgb(var(--color-primary))] text-white font-semibold rounded-xl hover:bg-[rgb(var(--color-primary))]/90 active:scale-[0.97] transition-all duration-200 shadow-lg shadow-[rgb(var(--color-primary))]/25"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200"
                                        fill="none" viewBox="0 0 24 24"
                                        stroke="currentColor" strokeWidth={2.5}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                                    </svg>
                                    Return to Dashboard
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return children;
};
