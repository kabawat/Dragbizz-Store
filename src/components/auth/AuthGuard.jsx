"use client";

import { StartupLoader } from "@dragorbit/ui/app";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useSelectedStoreId from "@/hooks/store/useSelectedStoreId";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

import {
  getAuthProfile,
  getRetailerDetails,
} from "@/store/slices/profileSlice";

export default function AuthGuard({ children }) {
  const dispatch = useAppDispatch();
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
    error,
    authProfile,
    authProfileError,
    authProfileErrorStatus,
    authProfileLoading,
    retailerErrorStatus,
  } = useAppSelector((state) => state.profile);
  const { ready: storeReady } = useSelectedStoreId();

  const profileUnavailable = Boolean(
    (authProfileError && authProfileErrorStatus !== 401 && !authProfile) ||
      (error && retailerErrorStatus !== 401 && (!agency || stores.length === 0))
  );
  const retryProfile = async () => {
    try {
      let profile = authProfile;
      if (!profile) profile = (await dispatch(getAuthProfile()).unwrap())?.data;
      if (profile?.agencyId)
        await dispatch(getRetailerDetails({ forceRefresh: true })).unwrap();
    } catch {
      /* Redux retains the latest error for retry. */
    }
  };

  useEffect(() => {
    if (!isInitialized || authProfileLoading || profileUnavailable) return;

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
    profileUnavailable,
    authProfileLoading,
  ]);

  const needsStoreBootstrap =
    isAuthenticated && agency && stores.length > 0 && !storeReady;

  if (profileUnavailable && !isLoading && !authProfileLoading) {
    return (
      <section
        role="alert"
        className="mx-auto my-12 max-w-lg space-y-4 rounded-xl border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))] p-6"
      >
        <h1 className="text-base font-semibold">Unable to load your account</h1>
        <p className="text-sm text-[rgb(var(--color-text-secondary))]">
          {authProfileError || error}
        </p>
        <p className="text-sm text-[rgb(var(--color-text-secondary))]">
          We could not verify your account right now. Please try again shortly.
        </p>
        <button
          type="button"
          onClick={retryProfile}
          className="rounded-lg bg-[rgb(var(--color-primary))] px-4 py-2 text-sm font-medium text-white"
        >
          Try again
        </button>
      </section>
    );
  }

  if (
    !isInitialized ||
    isChecking ||
    authProfileLoading ||
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
