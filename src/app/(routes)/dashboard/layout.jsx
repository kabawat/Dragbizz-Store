"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import { ensureSubdomain } from "@/utils/helper/domain";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";
import { HeaderProvider } from "@/contexts/HeaderContext";

export default function DashboardLayout({ children }) {
  const router = useRouter();

  const {
    redirectTo,
    agency,
    stores,
    isLoading,
    isAuthenticated,
    authProfile,
    authProfileLoading,
    staffProfileLoading
  } = useAppSelector((state) => state.profile);

  const isProfileLoading = isLoading || authProfileLoading || staffProfileLoading;

  useEffect(() => {
    if (isProfileLoading) {
      return;
    }

    if (!isAuthenticated) {
      return;
    }

    if (redirectTo) {
      router.push(redirectTo);
      return;
    }

    if (!agency) {
      router.push("/onboarding/agency");
      return;
    }

    if (agency && (!stores || stores.length === 0)) {
      router.push("/onboarding/store");
      return;
    }
  }, [isAuthenticated, redirectTo, isProfileLoading, agency, stores, router]);

  useEffect(() => {
    if (authProfile?.tenant) {
      ensureSubdomain(authProfile.tenant);
    }
  }, [authProfile?.tenant]);


  if (isProfileLoading) {
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
    <HeaderProvider>
      <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] overflow-hidden">
        <PermissionGuard>
          <div className="no-print">
            <Sidebar />
          </div>
          <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
            <div className="no-print">
              <Header />
            </div>
            <main className="flex-1 overflow-y-auto custom-scrollbar">
              {children}
            </main>
          </div>
        </PermissionGuard>
      </div>
    </HeaderProvider>
  );
}
