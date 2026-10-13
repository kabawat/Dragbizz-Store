"use client";

import { StartupLoader } from "@dragorbit/ui/app";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useSelectedStoreId from "@/hooks/store/useSelectedStoreId";
import { useAppSelector } from "@/store/hooks";

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
    if (!isInitialized) return;

    if (!isAuthenticated) {
      const hasSessionCookie =
        typeof document !== "undefined" &&
        document.cookie.includes("logged_in=true");
      if (pathname.startsWith("/onboarding") && hasSessionCookie) {
        setIsChecking(false);
        return;
      }
      if (!pathname.startsWith("/login")) {
        const searchParams = new URLSearchParams();
        searchParams.set("redirect", pathname);
        window.location.href = `/login?${searchParams.toString()}`;
      }
      return;
    }

    if (!isLoading) {
      const safeRedirect =
        redirectTo && redirectTo !== "/login" ? redirectTo : null;

      if (
        safeRedirect &&
        pathname !== safeRedirect &&
        !pathname.startsWith(safeRedirect)
      ) {
        router.replace(safeRedirect);
        setIsChecking(false);
        return;
      }

      if (!agency) {
        if (pathname !== "/onboarding/agency") {
          router.replace("/onboarding/agency");
        }
        setIsChecking(false);
        return;
      }

      if (stores.length === 0) {
        if (pathname !== "/onboarding/store") {
          router.replace("/onboarding/store");
        }
        setIsChecking(false);
        return;
      }

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
