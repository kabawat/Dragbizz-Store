"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/store/hooks";

/**
 * AuthGuard - Protects routes that require authentication.
 * Redirects to /login if not authenticated.
 * Redirects to onboarding steps if profile is incomplete.
 */
export default function AuthGuard({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isChecking, setIsChecking] = useState(true);

    const {
        authProfile,
        isAuthenticated,
        isLoading,
        agency,
        stores,
        redirectTo,
        isInitialized,
    } = useAppSelector((state) => state.profile);

    useEffect(() => {
        // Wait for auth verification and initial data loading
        if (!isInitialized) return;

        // 1. Check basic authentication
        if (!authProfile || !isAuthenticated) {
            if (!pathname.startsWith("/login")) {
                const searchParams = new URLSearchParams();
                searchParams.set("redirect", pathname);
                router.replace(`/login?${searchParams.toString()}`);
            }
            return;
        }

        // 2. Check onboarding status (only if we are not on an onboarding page or we are going to the wrong one)
        if (!isLoading) {
            // Logic for Onboarding Redirection
            if (!agency) {
                if (pathname !== "/onboarding/agency") {
                    router.replace("/onboarding/agency");
                }
                setIsChecking(false);
                return;
            }

            if (!stores || stores.length === 0) {
                if (pathname !== "/onboarding/store") {
                    router.replace("/onboarding/store");
                }
                setIsChecking(false);
                return;
            }

            // If everything is fine but we land on onboarding, go to dashboard
            if (pathname.startsWith("/onboarding") && agency && stores?.length > 0) {
                router.replace("/dashboard");
                return;
            }

            // Explicit redirectTo from slice (like force onboarding)
            if (redirectTo && pathname !== redirectTo && !pathname.startsWith(redirectTo)) {
                router.replace(redirectTo);
                setIsChecking(false);
                return;
            }

            setIsChecking(false);
        }
    }, [
        authProfile,
        isAuthenticated,
        isLoading,
        agency,
        stores,
        redirectTo,
        pathname,
        router,
        isInitialized,
    ]);

    const isDataLoading = isLoading && !agency; // Only show data loading if we don't have an agency yet

    if (!isInitialized || isChecking || isDataLoading) {
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

    // If we reach here, user is authenticated and data is present (or we are on the correct onboarding page)
    return <>{children}</>;
}
