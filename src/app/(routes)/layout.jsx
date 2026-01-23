// src/app/(routes)/layout.jsx
"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { useInactivityLogout } from "@/hooks/useInactivityLogout";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getAuthProfile,
  getRetailerDetails,
} from "@/store/slices/profileSlice";

export default function RoutesLayout({ children }) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Use refs to track fetch status (prevents re-fetches on re-renders)
  const hasFetchedRetailerProfileRef = useRef(false);
  const hasFetchedAuthProfileRef = useRef(false);
  const isCheckingAuthRef = useRef(false);

  // Setup inactivity logout
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

  // Check auth and fetch profiles
  useEffect(() => {
    // Prevent concurrent executions
    if (isCheckingAuthRef.current) {
      return;
    }

    const checkAuth = async () => {
      isCheckingAuthRef.current = true;

      try {
        const currentPath =
          typeof window !== "undefined" ? window.location.pathname : "";

        // 1. Fetch/Verify Auth Profile (The "Source of Truth" for Auth)
        // This will send cookies automatically via authAxios
        let currentAuthProfile = authProfile;
        if (
          !currentAuthProfile &&
          !authProfileLoading &&
          !authProfileError &&
          !hasFetchedAuthProfileRef.current
        ) {
          hasFetchedAuthProfileRef.current = true;
          try {
            const result = await dispatch(getAuthProfile()).unwrap();
            currentAuthProfile = result.data;
          } catch (err) {
            console.error("Auth profile fetch failed:", err);
            if (currentPath !== "/login") {
              router.push("/login");
              return;
            }
          }
        }

        // 2. If API verification fails, redirect to login
        if (
          !currentAuthProfile &&
          !authProfileLoading &&
          hasFetchedAuthProfileRef.current &&
          !authProfileError
        ) {
          if (currentPath !== "/login") {
            router.push("/login");
            return;
          }
        }

        // 3. Fetch Retailer Details if verified
        if (currentAuthProfile) {
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
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        isCheckingAuthRef.current = false;
      }
    };

    checkAuth();
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

  // Handle redirectTo from profile state
  useEffect(() => {
    if (redirectTo && !isLoading) {
      const currentPath = window.location.pathname;
      if (
        currentPath !== redirectTo &&
        !currentPath.startsWith(`${redirectTo}/`)
      ) {
        router.push(redirectTo);
      }
    }
  }, [redirectTo, isLoading, router]);

  // Show loading screen while auth or profile is being verified/fetched
  const isVerifyingAuth = authProfileLoading || (!authProfile && !authProfileError && !hasFetchedAuthProfileRef.current);
  const isDataLoading = isLoading && !user && !agency && !error;

  if (isVerifyingAuth || isDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--color-bg-primary))]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-2">
            {isVerifyingAuth ? "Verifying Session..." : "Loading Profile..."}
          </h2>
          <p className="text-[rgb(var(--color-text-secondary))]">
            {isVerifyingAuth
              ? "Please wait while we verify your authentication"
              : "Please wait while we fetch your retailer information"}
          </p>
        </div>
      </div>
    );
  }

  // Render routes
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
