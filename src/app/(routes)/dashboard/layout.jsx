"use client";
import { DashboardShell, SessionSkeleton } from "@dragorbit/ui/app";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
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

  const { ready: storeReady } = useSelectedStoreId();
  const isProfileLoading =
    !agency && (isLoading || authProfileLoading || staffProfileLoading);

  useEffect(() => {
    if (authProfile?.tenant) {
      ensureSubdomain(authProfile.tenant);
    }
  }, [authProfile?.tenant]);

  if (isProfileLoading || !storeReady || !agency || !stores?.length)
    return <SessionSkeleton />;

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
