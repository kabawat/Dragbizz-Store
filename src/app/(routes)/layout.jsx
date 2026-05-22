"use client";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { useInactivityLogout } from "@/hooks/auth/useInactivityLogout";
import AuthGuard from "@/components/auth/AuthGuard";

export default function RoutesLayout({ children }) {
  useInactivityLogout();

  return (
    <AuthGuard>
      <ErrorBoundary>
        <SubscriptionProvider>
          <div className="min-h-screen bg-[rgb(var(--color-bg-primary))]">
            {children}
          </div>
        </SubscriptionProvider>
      </ErrorBoundary>
    </AuthGuard>
  );
}
