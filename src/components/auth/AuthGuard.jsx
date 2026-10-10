"use client";

import { StartupLoader } from "@dragorbit/ui/app";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useSelectedStoreId from "@/hooks/store/useSelectedStoreId";
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
  const { ready: storeReady } = useSelectedStoreId();

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
      if (
        redirectTo &&
        pathname !== redirectTo &&
        !pathname.startsWith(redirectTo)
      ) {
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

  const needsStoreBootstrap =
    isAuthenticated && agency && stores.length > 0 && !storeReady;

  // Show loader
  if (
    !isInitialized ||
    isChecking ||
    (isLoading && !agency) ||
    needsStoreBootstrap
  ) {
    return (
      <StartupLoader
        title={!isInitialized ? "Verifying Session..." : "Securing Access..."}
        description="Please wait while we verify your account status."
      />
    );
  }

  return <>{children}</>;
}
