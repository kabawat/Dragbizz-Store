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
  Activity,
  BarChart3,
  Building2,
  IndianRupee,
  LineChart,
  Package,
  Receipt,
  Users,
  Warehouse,
  TrendingUp,
  AlertTriangle,
  LayoutDashboard
} from "lucide-react";
import { useRouter } from "next/navigation";
import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { dashboardService, agencyService } from "@/service/retailer";
import useApiResponse from "@/hooks/useApiResponse";
import { useAppSelector } from "@/store/hooks";
import logger from "@/utils/logger";

// Extracted Dashboard Components
import {
  SortableSection,
  SortableMetricCard,
  SortableAnalyticsCard
} from "@/components/dashboard/SortableComponents";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { StoresSummaryTable } from "@/components/dashboard/StoresSummaryTable";
import { StaffDashboard } from "@/components/dashboard/StaffDashboard";
import { ROLES } from "@/hooks/permissions/useModulePermissions";

// Lazy load components
const Sidebar = lazy(() => import("@/components/dashboard/sidebar"));
const Header = lazy(() => import("@/components/dashboard/header"));

const formatPercentChange = (value) => {
  const numericValue = Number(value);
  const safeValue = Number.isFinite(numericValue) ? numericValue : 0;
  return `${safeValue >= 0 ? "+" : ""}${safeValue.toFixed(1)}%`;
};

export default function Dashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const { selectedStore: storeFromRedux, authProfile, staffProfile } = useAppSelector(
    (state) => state.profile
  );

  const isStaff = authProfile?.role === ROLES.STAFF;

  const { execute, loading } = useApiResponse();
  const [metrics, setMetrics] = useState([
    { id: "revenue", title: t("dashboard.totalRevenue"), value: "₹0", change: "0%", changeType: "up", icon: IndianRupee, iconColor: "bg-green-500" },
    { id: "profit", title: t("dashboard.totalProfit"), value: "₹0", change: "0%", changeType: "up", icon: TrendingUp, iconColor: "bg-emerald-500" },
    { id: "customers", title: t("dashboard.totalCustomers"), value: "0", change: "0%", changeType: "up", icon: Users, iconColor: "bg-blue-500" },
    { id: "products", title: t("dashboard.totalProducts"), value: "0", change: "0%", changeType: "up", icon: Package, iconColor: "bg-purple-500" },
    { id: "stockValue", title: t("dashboard.stockValue"), value: "₹0", change: "0%", changeType: "up", icon: Warehouse, iconColor: "bg-indigo-500" },
    { id: "outOfStock", title: t("dashboard.outOfStock"), value: "0", change: "0%", changeType: "down", icon: AlertTriangle, iconColor: "bg-red-500" },
    { id: "payables", title: t("dashboard.totalPayables"), value: "₹0", change: "0%", changeType: "down", icon: Receipt, iconColor: "bg-orange-500" },
  ]);

  const [sections, setSections] = useState([
    { id: "storesSummary", visible: true },
    { id: "quickActions", visible: true },
  ]);

  const [storesData, setStoresData] = useState([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const loadDashboardMetrics = useCallback(async (storeId) => {
    const result = await execute(
      agencyService.getSummary(),
      { showToast: false }
    );

    if (result?.success && result?.data) {
      const summaryData = result.data;
      setStoresData(summaryData);

      // Calculate totals across all stores
      const totals = summaryData.reduce((acc, store) => ({
        revenue: acc.revenue + (store.revenue || 0),
        profit: acc.profit + (store.profit || 0),
        customers: acc.customers + (store.customers || 0),
        products: acc.products + (store.products || 0),
        stockValue: acc.stockValue + (store.stockValue || 0),
        outOfStock: acc.outOfStock + (store.outOfStock || 0),
        payables: acc.payables + (store.payables || 0),
      }), {
        revenue: 0, profit: 0, customers: 0, products: 0, stockValue: 0, outOfStock: 0, payables: 0
      });

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
      setMetrics(prev => {
        const metricsMap = new Map(updatedMetrics.map(m => [m.id, m]));
        return prev.map(m => metricsMap.get(m.id) || m);
      });
    }
  }, [t, execute]);

  useEffect(() => {
    const storeId = storeFromRedux?._id || storeFromRedux?.id || storeFromRedux?.storeId;
    if (!storeId) return;
    loadDashboardMetrics(storeId);
  }, [storeFromRedux?._id, storeFromRedux?.id, storeFromRedux?.storeId, loadDashboardMetrics]);

  // Load saved layout
  useEffect(() => {
    const savedMetrics = localStorage.getItem("dashboard-metrics-order");
    const savedSections = localStorage.getItem("dashboard-sections-order");

    if (savedMetrics) {
      try {
        const savedOrder = JSON.parse(savedMetrics);
        setMetrics(prev => {
          const reordered = savedOrder.map(id => prev.find(m => m.id === id)).filter(Boolean);
          return reordered.length === prev.length ? reordered : prev;
        });
      } catch (e) { logger.error(e); }
    }

    if (savedSections) {
      try {
        const savedOrder = JSON.parse(savedSections);
        setSections(prev => {
          const reordered = savedOrder.map(id => prev.find(s => s.id === id)).filter(Boolean);
          const defaultIds = ["storesSummary", "quickActions"];
          const missing = defaultIds.filter(id => !reordered.find(s => s.id === id));
          missing.forEach(id => {
            const def = prev.find(s => s.id === id);
            if (def) reordered.push(def);
          });
          return reordered;
        });
      } catch (e) { logger.error(e); }
    }
  }, []);

  const handleMetricsDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setMetrics((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        localStorage.setItem("dashboard-metrics-order", JSON.stringify(newItems.map(m => m.id)));
        return newItems;
      });
    }
  };

  const handleSectionsDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        localStorage.setItem("dashboard-sections-order", JSON.stringify(newItems.map(s => s.id)));
        return newItems;
      });
    }
  };

  const renderSection = (section) => {
    switch (section.id) {
      case "quickActions":
        return <QuickActions t={t} onActionClick={(path) => router.push(path)} />;
      case "storesSummary":
        return <SortableAnalyticsCard id={section.id} title={t("dashboard.storesSummary")} icon={LayoutDashboard} iconColor="bg-slate-700" isVisible={section.visible}><StoresSummaryTable data={storesData} loading={loading} /></SortableAnalyticsCard>;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[rgb(var(--color-bg-secondary))] relative">
      <Suspense fallback={<div className="w-64 bg-[rgb(var(--color-bg-primary))] border-r" />}>
        <Sidebar />
      </Suspense>

      <div className="flex-1 min-h-screen flex flex-col overflow-hidden">
        <Suspense fallback={<div className="h-20 bg-[rgb(var(--color-bg-primary))] border-b" />}>
          <Header
            title={isStaff ? "Operations Overview" : t("dashboard.title")}
            description={isStaff ? "Access your quick tools and assigned modules" : t("dashboard.description")}
          />
        </Suspense>

        <div className="flex-1 p-6 overflow-y-auto">
          {isStaff ? (
            <StaffDashboard
              permissions={staffProfile?.permissions || []}
              t={t}
            />
          ) : (
            <>
              {/* Metrics Section */}
              <div className="mb-8">
                {loading && metrics.length === 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-[rgb(var(--color-bg-primary))]/20 rounded-lg animate-pulse" />)}
                  </div>
                ) : (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleMetricsDragEnd}>
                    <SortableContext items={metrics.map(m => m.id)} strategy={rectSortingStrategy}>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {metrics.map(m => <SortableMetricCard key={m.id} {...m} />)}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </div>

              {/* Draggable Layout Grid */}
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectionsDragEnd}>
                <SortableContext items={sections.map(s => s.id)} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {sections.map(section => (
                      <div
                        key={section.id}
                        className={`w-full ${section.id === "storesSummary" ? "lg:col-span-3" : "lg:col-span-1"}`}
                      >
                        {section.id === "quickActions" ? (
                          <SortableSection id={section.id} isVisible={section.visible}>
                            {renderSection(section)}
                          </SortableSection>
                        ) : (
                          renderSection(section)
                        )}
                      </div>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
