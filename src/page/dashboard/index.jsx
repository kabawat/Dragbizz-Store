"use client";
import {
  createDashboardRoutes,
  DashboardScreen,
} from "@dragorbit/features/dashboard";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { ROLES } from "@/hooks/permissions/useModulePermissions";
import useSelectedStoreId from "@/hooks/store/useSelectedStoreId";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useDashboardLayout } from "@/hooks/ui/useDashboardLayout";
import { useTranslation } from "@/hooks/ui/useTranslation";
import useApiResponse from "@/hooks/useApiResponse";
import { agencyService } from "@/service/retailer";
import { cashbookService } from "@/service/retailer/cashbook.service";
import { useAppSelector } from "@/store/hooks";

const routes = createDashboardRoutes("/dashboard");
export default function Dashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const { authProfile, staffProfile } = useAppSelector(
    (state) => state.profile
  );
  const { storeId, ready } = useSelectedStoreId();
  const isStaff = authProfile?.role === ROLES.STAFF;
  useDashboardHeader(
    isStaff ? "Operations Overview" : t("dashboard.title"),
    isStaff
      ? "Access your quick tools and assigned modules"
      : t("dashboard.description")
  );
  const { execute } = useApiResponse();
  const repository = useMemo(
    () => ({
      async getSummary() {
        const result = await execute(agencyService.getSummary(), {
          showToast: false,
        });
        return result?.success ? result.data : null;
      },
      async getCashbook({ storeId }) {
        const result = await execute(
          cashbookService.getAnalytics({ store: storeId }),
          { showToast: false }
        );
        return result?.data ?? null;
      },
    }),
    [execute]
  );
  const userId =
    authProfile?.id ||
    authProfile?._id ||
    authProfile?.user?.id ||
    authProfile?.user?._id ||
    authProfile?.userId ||
    authProfile?.sub;
  const scope = userId && storeId ? `${userId}:${storeId}` : null;
  const stats = useDashboardLayout(scope, "stats");
  const actions = useDashboardLayout(scope, "actions", { columns: 2 });
  return (
    <DashboardScreen
      t={t}
      repository={repository}
      storeId={storeId}
      ready={ready}
      isStaff={isStaff}
      permissions={staffProfile?.permissions || []}
      routes={routes}
      onNavigate={(path) => router.push(path)}
      scope={scope}
      statsLayout={stats.layout}
      actionsLayout={actions.layout}
      onSaveStats={stats.save}
      onSaveActions={actions.save}
    />
  );
}
