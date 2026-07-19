"use client";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { ShieldAlert, Crown } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useEffect, useState } from "react";
import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";
import { ROLES } from "@/hooks/permissions/useModulePermissions";
import { getModuleFromPath, getActionFromPath } from "@/data/config/moduleRegistry";
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

    const { subscription, isLoading: subscriptionLoading } = useSubscription();

    const [hasAccess, setHasAccess] = useState(true);
    const [isSubscriptionRestricted, setIsSubscriptionRestricted] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const isLoading = (authProfileLoading && !authProfile) || (staffProfileLoading && !staffProfile) || subscriptionLoading;
        if (isLoading) return setIsChecking(true);

        if (!isAuthenticated || !authProfile) {
            setIsChecking(false);
            setHasAccess(true);
            return;
        }

        const moduleName = getModuleFromPath(pathname);

        // 1. Subscription Check
        if (moduleName) {
            const action = getActionFromPath(pathname);
            const feature = (subscription?.features || []).find(f => f.module === moduleName);
            const isModuleActive = feature && (feature.usageType === "UNLIMITED" || (feature.maxLimit && feature.maxLimit > 0));

            if (!isModuleActive) {
                setHasAccess(false);
                setIsSubscriptionRestricted(true);
                setIsChecking(false);
                return;
            }

            // Sub-feature check (Analytics/Reports)
            if (action === "analytics" && !feature.analytics) {
                setIsSubscriptionRestricted(true);
                setHasAccess(false);
                setIsChecking(false);
                return;
            }

            if (action === "report" && !feature.report) {
                setIsSubscriptionRestricted(true);
                setHasAccess(false);
                setIsChecking(false);
                return;
            }
        }

        setIsSubscriptionRestricted(false);

        // 2. Owner bypass
        if (authProfile.role === ROLES.OWNER) {
            setHasAccess(true);
            setIsChecking(false);
            return;
        }

        // 3. Staff logic
        const ALLOWED_PATHS = ["/dashboard", "/dashboard/support", "/dashboard/settings"];
        if (ALLOWED_PATHS.includes(pathname)) {
            setHasAccess(true);
            setIsChecking(false);
            return;
        }

        if (pathname.startsWith("/dashboard/management")) {
            setHasAccess(false);
            setIsChecking(false);
            return;
        }

        if (!moduleName) {
            setHasAccess(true);
            setIsChecking(false);
            return;
        }

        const action = getActionFromPath(pathname);
        const permissions = staffProfile?.permissions || [];
        const modulePermission = permissions.find((p) => p.module === moduleName);

        setHasAccess(modulePermission?.[action] === true);
        setIsChecking(false);

    }, [pathname, authProfile, staffProfile, authProfileLoading, staffProfileLoading, subscription, subscriptionLoading, isAuthenticated]);

    // Show nothing (or a subtle loader) while checking permissions
    if (isChecking) {
        return null; // Or a minimalist loading bar
    }

    if (!hasAccess) {
        return (
            <div className="flex w-full bg-[rgb(var(--color-bg-secondary))] overflow-hidden">
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
                                    <span className="text-[8.75rem] font-black leading-none tracking-tighter text-[rgb(var(--color-text-primary))]/5 select-none">
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
                                            <div className={`relative w-24 h-24 rounded-full bg-gradient-to-br ${isSubscriptionRestricted ? 'from-[#f59e0b]/25 to-[#f59e0b]/10 border-[#f59e0b]/30 shadow-[#f59e0b]/20' : 'from-red-500/25 to-red-700/10 border-red-500/30 shadow-red-500/20'} border shadow-xl flex items-center justify-center`}>
                                                {isSubscriptionRestricted ? (
                                                    <Crown className="w-11 h-11 text-[#f59e0b] drop-shadow-sm" role="img" aria-label="Premium feature crown" />
                                                ) : (
                                                    <ShieldAlert className="w-11 h-11 text-red-500 drop-shadow-sm" role="img" aria-label="Access denied shield" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Pulsing status pill below 403 */}
                                <span className={`mt-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest ${isSubscriptionRestricted ? 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/20' : 'text-red-500 bg-red-500/10 border-red-500/20'} px-4 py-1.5 rounded-full`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${isSubscriptionRestricted ? 'bg-[#f59e0b]' : 'bg-red-500'} animate-pulse`} />
                                    {isSubscriptionRestricted ? "Plan Limited" : "Permission Denied"}
                                </span>
                            </div>

                            {/* Vertical divider (desktop only) */}
                            <div className="hidden md:block w-px h-48 bg-gradient-to-b from-transparent via-[rgb(var(--color-border-primary))] to-transparent flex-shrink-0" />

                            {/* Right — text + button */}
                            <div className="flex flex-col items-start max-w-sm">
                                <h1 className="text-3xl font-bold text-[rgb(var(--color-text-primary))] mb-3 leading-tight">
                                    {isSubscriptionRestricted ? (
                                        <>Plan <span className="text-[#f59e0b]">Restricted</span></>
                                    ) : (
                                        <>Access <span className="text-red-500">Restricted</span></>
                                    )}
                                </h1>

                                {isSubscriptionRestricted ? (
                                    <p className="text-sm text-[rgb(var(--color-text-secondary))] leading-relaxed mb-8">
                                        Your current plan does not include this module. Please upgrade your subscription or contact your store admin to access this feature.
                                    </p>
                                ) : (
                                    <>
                                        <p className="text-sm text-[rgb(var(--color-text-secondary))] leading-relaxed mb-2">
                                            You don&apos;t have the required permissions to view this section.
                                        </p>
                                        <p className="text-sm text-[rgb(var(--color-text-secondary))] leading-relaxed mb-8">
                                            Please contact your{" "}
                                            <span className="text-[rgb(var(--color-primary))] font-semibold">store owner</span>{" "}
                                            to request access.
                                        </p>
                                    </>
                                )}

                                {/* Divider */}
                                <div className="w-full h-px bg-[rgb(var(--color-border-primary))]/40 mb-8" />

                                {/* Return / Upgrade button */}
                                {isSubscriptionRestricted && authProfile?.role === ROLES.OWNER ? (
                                    <button
                                        onClick={() => {
                                            const { redirectToMainDomain } = require("@/utils/helper/domain");
                                            redirectToMainDomain("/pricing");
                                        }}
                                        className="cursor-pointer group flex items-center gap-2.5 px-6 py-3 bg-[#f59e0b] text-white font-semibold rounded-xl hover:bg-[#f59e0b]/90 active:scale-[0.97] transition-all duration-200 shadow-lg shadow-[#f59e0b]/25"
                                    >
                                        <Crown className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" role="img" aria-hidden="true" />
                                        Upgrade Plan Now
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => router.push("/dashboard")}
                                        className="group flex items-center gap-2.5 px-6 py-3 bg-[rgb(var(--color-primary))] text-white font-semibold rounded-xl hover:bg-[rgb(var(--color-primary))]/90 active:scale-[0.97] transition-all duration-200 shadow-lg shadow-[rgb(var(--color-primary))]/25"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200"
                                            fill="none" viewBox="0 0 24 24"
                                            stroke="currentColor" strokeWidth={2.5}
                                            role="img" aria-hidden="true"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                                        </svg>
                                        Return to Dashboard
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return children;
};
