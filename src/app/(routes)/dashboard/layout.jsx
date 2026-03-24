"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAppSelector } from "@/store/hooks";
import { updateSubdomain } from "@/utils/helper/domain";
import { PermissionGuard } from "@/components/auth/PermissionGuard";

export default function DashboardLayout({ children }) {
  const router = useRouter();

  // Get profile state
  const { redirectTo, agency, stores, isLoading, isAuthenticated, authProfile, authProfileLoading, staffProfileLoading } = useAppSelector((state) => state.profile);

  // Subscription context
  const { isLoading: subscriptionLoading, hasSubscription } = useSubscription();

  const isProfileLoading = isLoading || authProfileLoading || staffProfileLoading;

  // Handle redirects and missing data checks
  useEffect(() => {
    // Don't redirect while loading
    if (isProfileLoading || subscriptionLoading) {
      return;
    }

    // Don't redirect if not authenticated (handled by parent layout)
    if (!isAuthenticated) {
      return;
    }

    // Handle explicit redirects
    if (redirectTo) {
      router.push(redirectTo);
      return;
    }

    // Check for missing data and redirect accordingly
    if (!agency) {
      router.push("/onboarding/agency");
      return;
    }

    if (agency && (!stores || stores.length === 0)) {
      router.push("/onboarding/store");
      return;
    }
  }, [subscriptionLoading, isAuthenticated, hasSubscription, redirectTo, isProfileLoading, agency, stores, router]);

  // Redirect to tenant subdomain if missing
  useEffect(() => {
    const tenant = authProfile?.tenant;
    if (!tenant || typeof window === "undefined") return;
    const domain = updateSubdomain(window.location.href, tenant);
    if (!domain?.hasSubdomain) {
      window.location.replace(domain.url);
    }
  }, [authProfile?.tenant]);

  // Show loading while checking data
  if (isProfileLoading || subscriptionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--color-bg-primary))]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-2">
            Verifying Profile...
          </h2>
          <p className="text-[rgb(var(--color-text-secondary))]">
            Checking your retailer information
          </p>
        </div>
      </div>
    );
  }

  // Don't render children if redirecting or no subscription
  if (redirectTo || !agency || (agency && (!stores || stores.length === 0))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--color-bg-primary))]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-2">
            Redirecting...
          </h2>
          <p className="text-[rgb(var(--color-text-secondary))]">
            Please wait while we redirect you
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] relative">
      <PermissionGuard>
        {children}
      </PermissionGuard>
    </div>
  );
}
