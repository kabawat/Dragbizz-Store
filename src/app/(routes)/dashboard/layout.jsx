"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAppSelector } from "@/store/hooks";
import { authService } from "@/service";
import updateSubdomain from "@/utils/helper/domain";

export default function DashboardLayout({ children }) {
  const router = useRouter();

  // Get profile state from Redux
  const { redirectTo, agency, stores, isLoading, isAuthenticated } = useAppSelector((state) => state.profile);

  // Get subscription from context (no duplicate API call)
  const { isLoading: subscriptionLoading, hasSubscription } = useSubscription();

  // Handle redirects and missing data checks
  useEffect(() => {
    // Don't redirect while loading
    if (isLoading || subscriptionLoading) {
      return;
    }

    // Don't redirect if not authenticated (handled by parent layout)
    if (!isAuthenticated) {
      return;
    }

    // Check subscription first - redirect to packages if no subscription
    if (!hasSubscription) {
      router.push("/packages");
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
  }, [subscriptionLoading, isAuthenticated, hasSubscription, redirectTo, isLoading, agency, stores, router]);


  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const res = await authService.refreshToken()
        const domain = updateSubdomain(window.location.href, res.data.tenant)
        if (!domain?.hasSubdomain) {
          window.location.replace(domain.url)
        }

      } catch (error) {
        console.log(error)
      }
    }
    handleRedirect()
  }, [])

  // Show loading while checking data
  if (isLoading || subscriptionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--color-bg-primary))]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-2">
            {subscriptionLoading
              ? "Checking Subscription..."
              : "Checking Profile..."}
          </h2>
          <p className="text-[rgb(var(--color-text-secondary))]">
            {subscriptionLoading
              ? "Verifying your subscription status"
              : "Verifying your retailer information"}
          </p>
        </div>
      </div>
    );
  }

  // Don't render children if redirecting or no subscription
  if (!hasSubscription || redirectTo || !agency || (agency && (!stores || stores.length === 0))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--color-bg-primary))]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-2">
            Redirecting...
          </h2>
          <p className="text-[rgb(var(--color-text-secondary))]">
            {!hasSubscription
              ? "Please select a subscription plan to continue"
              : "Please wait while we redirect you"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] relative">
      {children}
    </div>
  );
}
