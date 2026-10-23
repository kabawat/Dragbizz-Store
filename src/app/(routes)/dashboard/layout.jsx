"use client";
import { DashboardShell, StartupLoader } from "@dragorbit/ui/app";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { HeaderProvider } from "@/contexts/HeaderContext";
import useSelectedStoreId from "@/hooks/store/useSelectedStoreId";
import { useAppSelector } from "@/store/hooks";
import { ensureSubdomain } from "@/utils/helper/domain";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const isCustomerPayment = pathname?.includes("/customer-payment");

  const {
    agency,
    stores,
    isLoading,
    authProfile,
    authProfileLoading,
    staffProfileLoading,
  } = useAppSelector((state) => state.profile);

  const { isLoading: planLoading, hasPlanPreview } = useSubscription();
  const { ready: storeReady } = useSelectedStoreId();
  const isProfileLoading =
    !agency && (isLoading || authProfileLoading || staffProfileLoading);

  useEffect(() => {
    if (authProfile?.tenant) {
      ensureSubdomain(authProfile.tenant);
    }
  }, [authProfile?.tenant]);

  useEffect(() => {
    if (isCustomerPayment) return;
    const root = document.documentElement;
    const body = document.body;
    root.classList.add("dashboard-viewport-active");
    body.classList.add("dashboard-viewport-active");
    return () => {
      root.classList.remove("dashboard-viewport-active");
      body.classList.remove("dashboard-viewport-active");
    };
  }, [isCustomerPayment]);

  if (isProfileLoading || !storeReady || !agency || !stores?.length)
    return <StartupLoader />;

  if (planLoading && !hasPlanPreview) return <StartupLoader />;

  return (
    <HeaderProvider>
      <DashboardShell
        standalone={isCustomerPayment}
        sidebar={<Sidebar />}
        header={<Header />}
      >
        <PermissionGuard>{children}</PermissionGuard>
      </DashboardShell>
    </HeaderProvider>
  );
}
