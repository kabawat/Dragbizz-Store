"use client";
import { AccessRestricted, DashboardShell } from "@dragorbit/ui/app";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import { useSubscription } from "@/contexts/SubscriptionContext";
import {
  getActionFromPath,
  getModuleFromPath,
} from "@/data/config/moduleRegistry";
import { ROLES } from "@/hooks/permissions/useModulePermissions";
import { useAppSelector } from "@/store/hooks";
import { redirectToMainDomain } from "@/utils/helper/domain";
export const PermissionGuard = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const {
    authProfile,
    authProfileLoading,
    staffProfile,
    staffProfileLoading,
    isAuthenticated,
  } = useAppSelector((state) => state.profile);

  const { subscription, isLoading: subscriptionLoading } = useSubscription();

  const [hasAccess, setHasAccess] = useState(true);
  const [isSubscriptionRestricted, setIsSubscriptionRestricted] =
    useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const isLoading =
      (authProfileLoading && !authProfile) ||
      (staffProfileLoading && !staffProfile) ||
      subscriptionLoading;
    if (isLoading) return setIsChecking(true);

    if (!isAuthenticated || !authProfile) {
      setIsChecking(false);
      setHasAccess(true);
      return;
    }

    const moduleName = getModuleFromPath(pathname);

    // 1. Subscription Check
    if (moduleName) {
      const action = getActionFromPath(pathname);
      const feature = (subscription?.features || []).find(
        (f) => f.module === moduleName
      );
      const isModuleActive =
        feature &&
        (feature.usageType === "UNLIMITED" ||
          (feature.maxLimit && feature.maxLimit > 0));

      if (!isModuleActive) {
        setHasAccess(false);
        setIsSubscriptionRestricted(true);
        setIsChecking(false);
        return;
      }

      // Sub-feature check (Analytics/Reports)
      if (action === "analytics" && !feature.analytics) {
        setIsSubscriptionRestricted(true);
        setHasAccess(false);
        setIsChecking(false);
        return;
      }

      if (action === "report" && !feature.report) {
        setIsSubscriptionRestricted(true);
        setHasAccess(false);
        setIsChecking(false);
        return;
      }
    }

    setIsSubscriptionRestricted(false);

    // 2. Owner bypass
    if (authProfile.role === ROLES.OWNER) {
      setHasAccess(true);
      setIsChecking(false);
      return;
    }

    // 3. Staff logic
    const ALLOWED_PATHS = [
      "/dashboard",
      "/dashboard/support",
      "/dashboard/settings",
    ];
    if (ALLOWED_PATHS.includes(pathname)) {
      setHasAccess(true);
      setIsChecking(false);
      return;
    }

    if (pathname.startsWith("/dashboard/management")) {
      setHasAccess(false);
      setIsChecking(false);
      return;
    }

    if (!moduleName) {
      setHasAccess(true);
      setIsChecking(false);
      return;
    }

    const action = getActionFromPath(pathname);
    const permissions = staffProfile?.permissions || [];
    const modulePermission = permissions.find((p) => p.module === moduleName);

    setHasAccess(modulePermission?.[action] === true);
    setIsChecking(false);
  }, [
    pathname,
    authProfile,
    staffProfile,
    authProfileLoading,
    staffProfileLoading,
    subscription,
    subscriptionLoading,
    isAuthenticated,
  ]);

  // Show nothing (or a subtle loader) while checking permissions
  if (isChecking) {
    return null; // Or a minimalist loading bar
  }

  if (!hasAccess) {
    return (
      <DashboardShell
        sidebar={<Sidebar />}
        header={
          <Header
            title="Access Restricted"
            description="You do not have permission to view this page"
          />
        }
      >
        <AccessRestricted
          isSubscriptionRestricted={isSubscriptionRestricted}
          canUpgrade={authProfile?.role === ROLES.OWNER}
          onUpgrade={() => redirectToMainDomain("/pricing")}
          onGoHome={() => router.push("/dashboard")}
        />
      </DashboardShell>
    );
  }

  return children;
};
