"use client";
import { AccessRestricted } from "@dragorbit/ui/app";
import DashboardContentLoading from "@/components/dashboard/DashboardContentLoading";
import { usePathname, useRouter } from "next/navigation";
import { useSubscription } from "@/contexts/SubscriptionContext";
import {
  getActionFromPath,
  getCapabilityFromPath,
  getModuleFromPath,
} from "@/data/config/moduleRegistry";
import { ROLES } from "@/hooks/permissions/useModulePermissions";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getStaffProfileDetails } from "@/store/slices/profileSlice";
import { redirectToMainDomain } from "@dragorbit/core/domain";
import { hasFeatureCapability } from "@/utils/subscriptionCapability.util";
export const PermissionGuard = ({ children }) => {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const {
    authProfile,
    selectedStore,
    authProfileLoading,
    staffProfile,
    staffProfileLoading,
    staffProfileError,
    isAuthenticated,
    shellRestored,
    sessionVerified,
    authProfileError,
    error: workspaceError,
  } = useAppSelector((state) => state.profile);

  const {
    subscription,
    isVerified: planVerified,
    isLoading: subscriptionLoading,
    error: subscriptionError,
    reload,
  } = useSubscription();

  const isChecking =
    (authProfileLoading && !authProfile) ||
    (staffProfileLoading && !staffProfile) ||
    (subscriptionLoading && !subscription);
  // Evaluate from the current render: effect-backed decisions can leak the old route's result.
  const evaluateAccess = () => {
    if (!isAuthenticated || !authProfile) return { hasAccess: true };
    const moduleName = getModuleFromPath(pathname);
    const action = getActionFromPath(pathname);
    if (moduleName) {
      const feature = subscription?.features?.find(
        (item) => item.module === moduleName
      );
      const active =
        feature && (feature.usageType === "UNLIMITED" || feature.maxLimit > 0);
      const capability = getCapabilityFromPath(pathname);
      if (
        !active ||
        (action === "analytics" && !feature.analytics) ||
        (action === "report" && !feature.report) ||
        (capability && !hasFeatureCapability(feature, capability))
      ) {
        return { hasAccess: false, isSubscriptionRestricted: true };
      }
    }
    if (authProfile.role === ROLES.OWNER) return { hasAccess: true };
    if (
      ["/dashboard", "/dashboard/support", "/dashboard/settings"].includes(
        pathname
      )
    )
      return { hasAccess: true };
    if (pathname.startsWith("/dashboard/management"))
      return { hasAccess: false };
    if (!moduleName) return { hasAccess: true };
    return {
      hasAccess:
        staffProfile?.permissions?.find((item) => item.module === moduleName)?.[
          action
        ] === true,
    };
  };
  const { hasAccess, isSubscriptionRestricted = false } = evaluateAccess();

  // A restored shell is only a preview. Protected content waits for live APIs.
  if (
    shellRestored &&
    !sessionVerified &&
    (authProfileError || workspaceError || staffProfileError)
  ) {
    return (
      <section role="alert" className="space-y-3 p-6">
        <p>{authProfileError || workspaceError || staffProfileError}</p>
        <button
          type="button"
          className="rounded-lg border border-[rgb(var(--color-border-primary))] px-4 py-2"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </section>
    );
  }
  if (
    (shellRestored && !sessionVerified) ||
    (planVerified === false && subscriptionLoading)
  ) {
    return <DashboardContentLoading pathname={pathname} storeId={selectedStore?.storeId} />;
  }

  // Keep the loading UI until subscription and profile data are resolved.
  if (isChecking) {
    return <DashboardContentLoading pathname={pathname} storeId={selectedStore?.storeId} />;
  }

  if (authProfile?.role === ROLES.STAFF && !staffProfile && staffProfileError) {
    return (
      <section role="alert" className="space-y-3 p-6">
        <p>{staffProfileError}</p>
        <button
          type="button"
          onClick={() => dispatch(getStaffProfileDetails())}
          className="rounded-lg border border-[rgb(var(--color-border-primary))] px-4 py-2"
        >
          Try again
        </button>
      </section>
    );
  }
  if (subscriptionError && (!subscription || planVerified === false)) {
    return (
      <section role="alert" className="space-y-3 p-6">
        <p>{subscriptionError}</p>
        <button
          type="button"
          onClick={reload}
          className="rounded-lg border border-[rgb(var(--color-border-primary))] px-4 py-2"
        >
          Try again
        </button>
      </section>
    );
  }

  if (!hasAccess) {
    return (
      <AccessRestricted
        isSubscriptionRestricted={isSubscriptionRestricted}
        canUpgrade={authProfile?.role === ROLES.OWNER}
        onUpgrade={() => redirectToMainDomain("/pricing")}
        onGoHome={() => router.push("/dashboard")}
      />
    );
  }

  return children;
};
