"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import VoiceCommandLauncher from "@/components/voice/VoiceCommandLauncher";
import { HeaderProvider } from "@/contexts/HeaderContext";
import useSelectedStoreId from "@/hooks/store/useSelectedStoreId";
import { useAppSelector } from "@/store/hooks";
import { ensureSubdomain } from "@/utils/helper/domain";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const isCustomerPayment = pathname?.includes("/customer-payment");

  const {
    redirectTo,
    agency,
    stores,
    isLoading,
    isAuthenticated,
    authProfile,
    authProfileLoading,
    staffProfileLoading,
  } = useAppSelector((state) => state.profile);

  const { ready: storeReady } = useSelectedStoreId();
  const isProfileLoading =
    isLoading || authProfileLoading || staffProfileLoading;

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

  if (isProfileLoading || !storeReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--color-bg-primary))]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-2">
            {isProfileLoading ? "Verifying Profile..." : "Loading Store..."}
          </h2>
          <p className="text-[rgb(var(--color-text-secondary))]">
            {isProfileLoading
              ? "Checking your retailer information"
              : "Preparing your store workspace"}
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
      <PermissionGuard>
        {isCustomerPayment ? (
          <main className="min-h-[100dvh] bg-[rgb(var(--color-bg-primary))]">
            {children}
          </main>
        ) : (
          <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] overflow-hidden">
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
          </div>
        )}
        <div className="no-print">
          <VoiceCommandLauncher />
        </div>
      </PermissionGuard>
    </HeaderProvider>
  );
}
