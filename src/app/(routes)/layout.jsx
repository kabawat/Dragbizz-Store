"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { cookieManager } from "@/utils/cookieManager";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getRetailerDetails,
  getAuthProfile,
} from "@/store/slices/profileSlice";
import { Button } from "@/components/ui";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { useInactivityLogout } from "@/hooks/useInactivityLogout";

// Prevent duplicate profile API calls (e.g. React Strict Mode double effects in dev)
let hasFetchedRetailerProfile = false;
let hasFetchedAuthProfileOnce = false;

export default function RoutesLayout({ children }) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Setup inactivity logout (7 days inactivity)
  useInactivityLogout();

  // Get auth state from Redux
  const {
    isLoading,
    isAuthenticated,
    error,
    agency,
    stores,
    user,
    authProfile,
    authProfileLoading,
    authProfileError,
    redirectTo,
  } = useAppSelector((state) => state.profile);
  useEffect(() => {
    const checkAuth = async () => {
      const authToken = cookieManager.getAuthToken();
      if (!authToken) {
        router.push("/login");
        return;
      }

      // If no retailer data and no ongoing/error state, fetch retailer profile
      const hasRetailerData =
        !!user || !!agency || (stores && stores.length > 0);

      if (
        !hasRetailerData &&
        !isLoading &&
        !error &&
        !hasFetchedRetailerProfile
      ) {
        hasFetchedRetailerProfile = true;
        await dispatch(getRetailerDetails());
      }

      // If no auth-service profile and no ongoing/error state, fetch auth profile
      const hasAuthProfile = !!authProfile;
      if (
        !hasAuthProfile &&
        !authProfileLoading &&
        !authProfileError &&
        !hasFetchedAuthProfileOnce
      ) {
        hasFetchedAuthProfileOnce = true;
        await dispatch(getAuthProfile());
      }
    };

    checkAuth();
  }, [
    router,
    dispatch,
    isLoading,
    error,
    agency,
    stores,
    user,
    authProfile,
    authProfileLoading,
    authProfileError,
  ]);

  // Handle redirectTo from profile state (for onboarding flow)
  useEffect(() => {
    if (redirectTo && !isLoading) {
      const currentPath = window.location.pathname;
      // Only redirect if not already on the target path
      if (!currentPath.startsWith(redirectTo)) {
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
    <SubscriptionProvider>
      <div className="min-h-screen bg-[rgb(var(--color-bg-primary))]">
        {children}
      </div>
    </SubscriptionProvider>
  );
}
