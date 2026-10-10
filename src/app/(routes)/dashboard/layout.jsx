"use client";
import { DashboardShell, StartupLoader } from "@dragorbit/ui/app";
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
      <StartupLoader
        title={isProfileLoading ? "Verifying Profile..." : "Loading Store..."}
        description={
          isProfileLoading
            ? "Checking your retailer information"
            : "Preparing your store workspace"
        }
      />
    );
  }
  if (redirectTo || !agency || (agency && (!stores || stores.length === 0))) {
    return (
      <StartupLoader
        title="Redirecting..."
        description="Please wait while we redirect you"
      />
    );
  }

  return (
    <HeaderProvider>
      <PermissionGuard>
        <DashboardShell
          standalone={isCustomerPayment}
          sidebar={<Sidebar />}
          header={<Header />}
          overlay={
            <div className="no-print">
              <VoiceCommandLauncher />
            </div>
          }
        >
          {children}
        </DashboardShell>
      </PermissionGuard>
    </HeaderProvider>
  );
}
