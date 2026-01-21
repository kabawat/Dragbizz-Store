"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { useInactivityLogout } from "@/hooks/useInactivityLogout";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getAuthProfile,
  getRetailerDetails,
} from "@/store/slices/profileSlice";
import { cookieManager } from "@/utils/cookieManager";

export default function RoutesLayout({ children }) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Use refs to track fetch status (prevents re-fetches on re-renders)
  const hasFetchedRetailerProfileRef = useRef(false);
  const hasFetchedAuthProfileRef = useRef(false);
  const isCheckingAuthRef = useRef(false);

  // Setup inactivity logout (7 days inactivity)
  useInactivityLogout();

  // Get auth state from Redux
  const {
    isLoading,
    error,
    agency,
    stores,
    user,
    authProfile,
    authProfileLoading,
    authProfileError,
    redirectTo,
  } = useAppSelector((state) => state.profile);

  // Check auth and fetch profiles - only run once or when auth token changes
  useEffect(() => {
    // Prevent concurrent executions
    if (isCheckingAuthRef.current) {
      return;
    }

    const checkAuth = async () => {
      isCheckingAuthRef.current = true;

      try {
        const authToken = cookieManager.getAuthToken();
        const currentPath =
          typeof window !== "undefined" ? window.location.pathname : "";

        // Don't redirect if already on login page to prevent loops
        if (!authToken && currentPath !== "/login") {
          router.push("/login");
          return;
        }

        // If no auth token, don't proceed with fetching
        if (!authToken) {
          return;
        }

        // Reset flags if auth token was cleared and re-added
        if (
          !authToken &&
          (hasFetchedRetailerProfileRef.current ||
            hasFetchedAuthProfileRef.current)
        ) {
          hasFetchedRetailerProfileRef.current = false;
          hasFetchedAuthProfileRef.current = false;
        }

        // If no retailer data and no ongoing/error state, fetch retailer profile
        const hasRetailerData =
          !!user || !!agency || (stores && stores.length > 0);

        if (
          !hasRetailerData &&
          !isLoading &&
          !error &&
          !hasFetchedRetailerProfileRef.current
        ) {
          hasFetchedRetailerProfileRef.current = true;
          await dispatch(getRetailerDetails());
        }

        // If no auth-service profile and no ongoing/error state, fetch auth profile
        const hasAuthProfile = !!authProfile;
        if (
          !hasAuthProfile &&
          !authProfileLoading &&
          !authProfileError &&
          !hasFetchedAuthProfileRef.current
        ) {
          hasFetchedAuthProfileRef.current = true;
          await dispatch(getAuthProfile());
        }
      } finally {
        isCheckingAuthRef.current = false;
      }
    };

    checkAuth();
    // Only depend on loading states and auth token presence, not on data that changes after fetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isLoading,
    authProfileLoading,
    error,
    authProfileError,
    agency,
    authProfile,
    dispatch,
    router.push,
    stores,
    user,
  ]);

  // Handle redirectTo from profile state (for onboarding flow)
  useEffect(() => {
    if (redirectTo && !isLoading) {
      const currentPath = window.location.pathname;
      // Only redirect if not already on the target path or a subpath
      // Use exact match or check if we're not already there
      if (
        currentPath !== redirectTo &&
        !currentPath.startsWith(`${redirectTo}/`)
      ) {
        router.push(redirectTo);
      }
    }
  }, [redirectTo, isLoading, router]);

  // Show loading screen while profile is being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--color-bg-primary))]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-2">
            Loading Profile...
          </h2>
          <p className="text-[rgb(var(--color-text-secondary))]">
            Please wait while we fetch your retailer information
          </p>
        </div>
      </div>
    );
  }
  // Render routes with profile data available
  return (
    <ErrorBoundary>
      <SubscriptionProvider>
        <div className="min-h-screen bg-[rgb(var(--color-bg-primary))]">
          {children}
        </div>
      </SubscriptionProvider>
    </ErrorBoundary>
  );
}
