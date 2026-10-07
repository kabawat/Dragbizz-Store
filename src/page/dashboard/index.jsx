"use client";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import {
  IndianRupee,
  Package,
  Receipt,
  Users,
  Warehouse,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { agencyService } from "@/service/retailer";
import useApiResponse from "@/hooks/useApiResponse";
import { useAppSelector } from "@/store/hooks";
import logger from "@/utils/logger";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import useSelectedStoreId from "@/hooks/store/useSelectedStoreId";
import { ROLES } from "@/hooks/permissions/useModulePermissions";

// Extracted Dashboard Components
import { SortableMetricCard } from "@/components/dashboard/SortableComponents";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { StoresSummaryTable } from "@/components/dashboard/StoresSummaryTable";
import { StaffDashboard } from "@/components/dashboard/StaffDashboard";
import { CashbookDashboardCard } from "@/components/dashboard/CashbookDashboardCard";

export default function Dashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const { authProfile, staffProfile } = useAppSelector(
    (state) => state.profile
  );
  const { storeId: activeStoreId, ready: storeReady } = useSelectedStoreId();

  const isStaff = authProfile?.role === ROLES.STAFF;

  // Set Header title and description
  useDashboardHeader(
    isStaff ? "Operations Overview" : t("dashboard.title"),
    isStaff
      ? "Access your quick tools and assigned modules"
      : t("dashboard.description")
  );

  const { execute, loading } = useApiResponse();
  const [metrics, setMetrics] = useState([
    {
      id: "revenue",
      title: t("dashboard.totalRevenue"),
      value: "₹0",
      change: "0%",
      changeType: "up",
      icon: IndianRupee,
      iconColor: "bg-green-500",
    },
    {
      id: "profit",
      title: t("dashboard.totalProfit"),
      value: "₹0",
      change: "0%",
      changeType: "up",
      icon: TrendingUp,
      iconColor: "bg-emerald-500",
    },
    {
      id: "customers",
      title: t("dashboard.totalCustomers"),
      value: "0",
      change: "0%",
      changeType: "up",
      icon: Users,
      iconColor: "bg-blue-500",
    },
    {
      id: "products",
      title: t("dashboard.totalProducts"),
      value: "0",
      change: "0%",
      changeType: "up",
      icon: Package,
      iconColor: "bg-purple-500",
    },
    {
      id: "stockValue",
      title: t("dashboard.stockValue"),
      value: "₹0",
      change: "0%",
      changeType: "up",
      icon: Warehouse,
      iconColor: "bg-indigo-500",
    },
    {
      id: "outOfStock",
      title: t("dashboard.outOfStock"),
      value: "0",
      change: "0%",
      changeType: "down",
      icon: AlertTriangle,
      iconColor: "bg-red-500",
    },
    {
      id: "payables",
      title: t("dashboard.totalPayables"),
      value: "₹0",
      change: "0%",
      changeType: "down",
      icon: Receipt,
      iconColor: "bg-orange-500",
    },
  ]);

  const [storesData, setStoresData] = useState([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const loadDashboardMetrics = useCallback(async () => {
    const result = await execute(agencyService.getSummary(), {
      showToast: false,
    });

    if (result?.success && result?.data) {
      const summaryData = result.data;
      setStoresData(summaryData);

      // Calculate totals across all stores
      const totals = summaryData.reduce(
        (acc, store) => ({
          revenue: acc.revenue + (store.revenue || 0),
          profit: acc.profit + (store.profit || 0),
          customers: acc.customers + (store.customers || 0),
          products: acc.products + (store.products || 0),
          stockValue: acc.stockValue + (store.stockValue || 0),
          outOfStock: acc.outOfStock + (store.outOfStock || 0),
          payables: acc.payables + (store.payables || 0),
        }),
        {
          revenue: 0,
          profit: 0,
          customers: 0,
          products: 0,
          stockValue: 0,
          outOfStock: 0,
          payables: 0,
        }
      );

      const updatedMetrics = [
        {
          id: "revenue",
          title: t("dashboard.totalRevenue"),
          value: `₹${totals.revenue.toLocaleString("en-IN")}`,
          change: "0%",
          changeType: "up",
          icon: IndianRupee,
          iconColor: "bg-green-500",
        },
        {
          id: "profit",
          title: t("dashboard.totalProfit"),
          value: `₹${totals.profit.toLocaleString("en-IN")}`,
          change: "0%",
          changeType: "up",
          icon: TrendingUp,
          iconColor: "bg-emerald-500",
        },
        {
          id: "customers",
          title: t("dashboard.totalCustomers"),
          value: totals.customers.toLocaleString("en-IN"),
          change: "0%",
          changeType: "up",
          icon: Users,
          iconColor: "bg-blue-500",
        },
        {
          id: "products",
          title: t("dashboard.totalProducts"),
          value: totals.products.toLocaleString("en-IN"),
          change: "0%",
          changeType: "up",
          icon: Package,
          iconColor: "bg-purple-500",
        },
        {
          id: "stockValue",
          title: t("dashboard.stockValue"),
          value: `₹${totals.stockValue.toLocaleString("en-IN")}`,
          change: "0%",
          changeType: "up",
          icon: Warehouse,
          iconColor: "bg-indigo-500",
        },
        {
          id: "outOfStock",
          title: t("dashboard.outOfStock"),
          value: totals.outOfStock.toLocaleString("en-IN"),
          change: "0%",
          changeType: "down",
          icon: AlertTriangle,
          iconColor: "bg-red-500",
        },
        {
          id: "payables",
          title: t("dashboard.totalPayables"),
          value: `₹${totals.payables.toLocaleString("en-IN")}`,
          change: "0%",
          changeType: "down",
          icon: Receipt,
          iconColor: "bg-orange-500",
        },
      ];
      setMetrics((prev) => {
        const metricsMap = new Map(updatedMetrics.map((m) => [m.id, m]));
        return prev.map((m) => metricsMap.get(m.id) || m);
      });
    }
  }, [t, execute]);

  useEffect(() => {
    if (!storeReady || !activeStoreId) return;
    loadDashboardMetrics();
  }, [storeReady, activeStoreId, loadDashboardMetrics]);

  // Load saved layout
  useEffect(() => {
    const savedMetrics = localStorage.getItem("dashboard-metrics-order");

    if (savedMetrics) {
      try {
        const savedOrder = JSON.parse(savedMetrics);
        setMetrics((prev) => {
          const reordered = savedOrder
            .map((id) => prev.find((m) => m.id === id))
            .filter(Boolean);
          return reordered.length === prev.length ? reordered : prev;
        });
      } catch (e) {
        logger.error(e);
      }
    }
  }, []);

  const handleMetricsDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setMetrics((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        localStorage.setItem(
          "dashboard-metrics-order",
          JSON.stringify(newItems.map((m) => m.id))
        );
        return newItems;
      });
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {isStaff ? (
        <StaffDashboard permissions={staffProfile?.permissions || []} t={t} />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-4">
            <div className="order-2 min-w-0 xl:order-1 xl:col-span-3">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleMetricsDragEnd}
              >
                <SortableContext
                  items={metrics.map((m) => m.id)}
                  strategy={rectSortingStrategy}
                >
                  <div
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                    aria-busy={loading}
                  >
                    {metrics.map((m) => (
                      <SortableMetricCard key={m.id} {...m} loading={loading} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
            <aside
              className="order-1 min-w-0 xl:order-2"
              aria-label={t("dashboard.quickActions")}
            >
              <QuickActions t={t} onActionClick={(path) => router.push(path)} />
            </aside>
          </div>
          {activeStoreId && <CashbookDashboardCard storeId={activeStoreId} />}
          <StoresSummaryTable data={storesData} loading={loading} />
        </div>
      )}
    </div>
  );
}
