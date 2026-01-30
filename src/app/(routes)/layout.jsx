// src/app/(routes)/layout.jsx
"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { useInactivityLogout } from "@/hooks/useInactivityLogout";
import { useAppSelector } from "@/store/hooks";

export default function RoutesLayout({ children }) {
  const router = useRouter();

  useInactivityLogout();

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

  // Redirect to login if not authenticated (profile is loaded by GlobalProfileLoader for whole app)
  useEffect(() => {
    if (authProfileLoading) return;
    if (authProfile) return;
    const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
    if (currentPath === "/login" || currentPath.startsWith("/login")) return;
    if (authProfileError) {
      router.push("/login");
    }
  }, [authProfile, authProfileLoading, authProfileError, router]);

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

  const isVerifyingAuth = authProfileLoading || (!authProfile && !authProfileError);
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
