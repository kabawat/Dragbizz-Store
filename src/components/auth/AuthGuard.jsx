"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/store/hooks";
// Protects authenticated routes and handles redirects
export default function AuthGuard({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isChecking, setIsChecking] = useState(true);

    const {
        isAuthenticated,
        isLoading,
        agency,
        stores,
        redirectTo,
        isInitialized,
    } = useAppSelector((state) => state.profile);

    useEffect(() => {
        // Wait for auth & data load
        if (!isInitialized) return;

        // Basic auth check
        if (!isAuthenticated) {
            if (!pathname.startsWith("/login")) {
                const searchParams = new URLSearchParams();
                searchParams.set("redirect", pathname);
                window.location.href = `/login?${searchParams.toString()}`;
            }
            return;
        }

        // Handle redirections
        if (!isLoading) {
            // Priority 1: Force redirect
            if (redirectTo && pathname !== redirectTo && !pathname.startsWith(redirectTo)) {
                router.replace(redirectTo);
                setIsChecking(false);
                return;
            }

            // Priority 2: Agency onboarding
            if (!agency) {
                if (pathname !== "/onboarding/agency") {
                    router.replace("/onboarding/agency");
                }
                setIsChecking(false);
                return;
            }

            // Priority 3: Store onboarding
            if (stores.length === 0) {
                if (pathname !== "/onboarding/store") {
                    router.replace("/onboarding/store");
                }
                setIsChecking(false);
                return;
            }

            // Priority 4: Dashboard redirect
            if (pathname.startsWith("/onboarding") && agency && stores.length > 0) {
                router.replace("/dashboard");
                return;
            }

            setIsChecking(false);
        }
    }, [
        isAuthenticated,
        isLoading,
        agency,
        stores.length,
        redirectTo,
        pathname,
        router,
        isInitialized,
    ]);

    // Show loader
    if (!isInitialized || isChecking || (isLoading && !agency)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--color-bg-primary))]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                        {!isInitialized ? "Verifying Session..." : "Securing Access..."}
                    </h2>
                    <p className="text-[rgb(var(--color-text-secondary))]">
                        Please wait while we verify your account status.
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}


