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
import { agencyService, invoiceService } from "@/service/retailer";
import { cashbookService } from "@/service/retailer/cashbook.service";
import { useAppSelector } from "@/store/hooks";
import { ProactiveRetailIntelligence } from "@/components/dashboard/ProactiveRetailIntelligence";
import { StoreDashboardOverview } from "@/components/dashboard/StoreDashboardOverview";
import { StoreSalesTrend } from "@/components/dashboard/StoreSalesTrend";

const istDateKey = (date) => {
  const values = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map(({ type, value }) => [type, value])
  );
  return `${values.year}-${values.month}-${values.day}`;
};

const buildSalesTrend = (invoices, days) => {
  const endDate = istDateKey(new Date());
  const endDay = new Date(`${endDate}T00:00:00.000Z`);
  const salesDays = Array.from({ length: days }, (_, index) => {
    const date = new Date(endDay);
    date.setUTCDate(date.getUTCDate() - (days - 1 - index));
    const dateLabel = new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    }).format(date);
    return {
      date: date.toISOString().slice(0, 10),
      dateLabel,
      label:
        days === 7
          ? new Intl.DateTimeFormat("en-IN", {
              weekday: "short",
              timeZone: "UTC",
            }).format(date)
          : dateLabel,
      revenue: 0,
      sales: 0,
    };
  });
  const salesByDate = new Map(salesDays.map((day) => [day.date, day]));

  for (const invoice of invoices) {
    const createdAt = new Date(invoice.createdAt);
    if (!Number.isFinite(createdAt.getTime())) continue;
    const day = salesByDate.get(istDateKey(createdAt));
    if (!day) continue;
    day.revenue += Number(invoice.totalAmount) || 0;
    day.sales += 1;
  }

  return salesDays;
};

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
        if (!result?.success)
          throw new Error(result?.message || "Unable to load dashboard data.");
        return result.data;
      },
      async getCashbook({ storeId }) {
        const result = await execute(
          cashbookService.getAnalytics({ store: storeId }),
          { showToast: false }
        );
        return result?.data ?? null;
      },
      async getSalesTrend({ storeId, days = 7 }) {
        const endDate = istDateKey(new Date());
        const start = new Date(`${endDate}T00:00:00.000Z`);
        start.setUTCDate(start.getUTCDate() - (days - 1));
        const startDate = start.toISOString().slice(0, 10);
        const result = await execute(
          invoiceService.getInvoices({
            store: storeId,
            invoiceStatus: "RELEASED",
            startDate,
            endDate,
            downloadAll: true,
            fields: "date,totalAmount",
            includeItems: false,
          }),
          { showToast: false }
        );
        if (!result?.success || !Array.isArray(result.data)) {
          throw new Error(result?.message || "Sales trend is unavailable.");
        }
        return buildSalesTrend(result.data, days);
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
      layoutVariant={isStaff ? "overview" : "store"}
      storeOverview={StoreDashboardOverview}
      intelligencePanel={isStaff ? undefined : ProactiveRetailIntelligence}
      salesTrendPanel={isStaff ? undefined : StoreSalesTrend}
    />
  );
}
