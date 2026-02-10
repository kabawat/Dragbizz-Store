"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/store/hooks";

/**
 * GuestGuard - Protects routes that should NOT be accessed by authenticated users (e.g., /login, /register).
 * Redirects to /dashboard or onboarding step if already authenticated.
 */
export default function GuestGuard({ children }) {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    const {
        authProfile,
        isAuthenticated,
        redirectTo,
        agency,
        stores,
        isInitialized
    } = useAppSelector((state) => state.profile);

    useEffect(() => {
        // Wait for auth verification
        if (!isInitialized) return;

        // If authenticated, redirect away from guest pages
        if (authProfile && isAuthenticated) {
            // Prioritize onboarding steps if missing data
            if (!agency) {
                router.replace("/onboarding/agency");
            } else if (!stores || stores.length === 0) {
                router.replace("/onboarding/store");
            } else {
                router.replace(redirectTo || "/dashboard");
            }
        } else {
            setIsChecking(false);
        }
    }, [
        authProfile,
        isAuthenticated,
        redirectTo,
        agency,
        stores,
        router,
        isInitialized
    ]);

    if (!isInitialized || isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--color-bg-primary))]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                        Verifying Session...
                    </h2>
                </div>
            </div>
        );
    }

    // If we reach here, user is NOT authenticated
    return <>{children}</>;
}
