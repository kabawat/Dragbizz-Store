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
} from "lucide-react";
import { useRouter } from "next/navigation";
import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { dashboardService } from "@/service/retailer";
import { useAppSelector } from "@/store/hooks";
import logger from "@/utils/logger";

// Extracted Dashboard Components
import {
  SortableSection,
  SortableMetricCard,
  SortableAnalyticsCard
} from "@/components/dashboard/SortableComponents";
import { QuickActions } from "@/components/dashboard/QuickActions";
import {
  RevenueAnalytics,
  SalesAnalytics,
  StockAnalytics,
  CustomerAnalytics,
  BillAnalytics,
} from "@/components/dashboard/AnalyticsWrappers";

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
  const { selectedStore: storeFromRedux } = useAppSelector(
    (state) => state.profile
  );

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState([
    { id: "revenue", title: t("dashboard.totalRevenue"), value: "₹0", change: "0%", changeType: "up", icon: IndianRupee, iconColor: "bg-green-500" },
    { id: "customers", title: t("dashboard.totalCustomers"), value: "0", change: "0%", changeType: "up", icon: Users, iconColor: "bg-blue-500" },
    { id: "products", title: t("dashboard.productsInStock"), value: "0", change: "0%", changeType: "up", icon: Package, iconColor: "bg-purple-500" },
    { id: "suppliers", title: t("dashboard.suppliers"), value: "0", change: "0%", changeType: "up", icon: Building2, iconColor: "bg-orange-500" },
  ]);

  const [sections, setSections] = useState([
    { id: "quickActions", visible: true },
    { id: "revenueAnalytics", visible: true },
    { id: "salesAnalytics", visible: true },
    { id: "stockAnalytics", visible: true },
    { id: "customerAnalytics", visible: true },
    { id: "billAnalytics", visible: true },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const loadDashboardMetrics = useCallback(async (storeId) => {
    try {
      const response = await dashboardService.getDashboard({ period: 30, storeId });
      if (response.success && response.data) {
        const dashboardData = response.data;
        const updatedMetrics = [
          {
            id: "revenue",
            title: t("dashboard.totalRevenue"),
            value: `₹${dashboardData.metrics.revenue.value.toLocaleString("en-IN")}`,
            change: formatPercentChange(dashboardData.metrics.revenue.change),
            changeType: dashboardData.metrics.revenue.changeType,
            icon: IndianRupee,
            iconColor: "bg-green-500",
          },
          {
            id: "customers",
            title: t("dashboard.totalCustomers"),
            value: dashboardData.metrics.customers.value.toLocaleString("en-IN"),
            change: formatPercentChange(dashboardData.metrics.customers.change),
            changeType: dashboardData.metrics.customers.changeType,
            icon: Users,
            iconColor: "bg-blue-500",
          },
          {
            id: "products",
            title: t("dashboard.productsInStock"),
            value: dashboardData.metrics.products.value.toLocaleString("en-IN"),
            change: formatPercentChange(dashboardData.metrics.products.change),
            changeType: dashboardData.metrics.products.changeType,
            icon: Package,
            iconColor: "bg-purple-500",
          },
          {
            id: "suppliers",
            title: t("dashboard.suppliers"),
            value: dashboardData.metrics.suppliers.value.toLocaleString("en-IN"),
            change: formatPercentChange(dashboardData.metrics.suppliers.change),
            changeType: dashboardData.metrics.suppliers.changeType,
            icon: Building2,
            iconColor: "bg-orange-500",
          },
        ];
        setMetrics(prev => {
          // preserve order if saved
          const metricsMap = new Map(updatedMetrics.map(m => [m.id, m]));
          return prev.map(m => metricsMap.get(m.id) || m);
        });
      }
    } catch (error) {
      logger.error("Failed to load dashboard metrics:", error);
    }
  }, [t]);

  useEffect(() => {
    const storeId = storeFromRedux?._id || storeFromRedux?.id || storeFromRedux?.storeId;
    if (!storeId) {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      await loadDashboardMetrics(storeId);
      setLoading(false);
    };
    fetchData();
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
          const defaultIds = ["quickActions", "revenueAnalytics", "salesAnalytics", "stockAnalytics", "customerAnalytics", "billAnalytics"];
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
      case "revenueAnalytics":
        return <SortableAnalyticsCard id={section.id} title="Revenue" icon={LineChart} iconColor="bg-green-500" isVisible={section.visible}><RevenueAnalytics /></SortableAnalyticsCard>;
      case "salesAnalytics":
        return <SortableAnalyticsCard id={section.id} title="Sales" icon={BarChart3} iconColor="bg-blue-500" isVisible={section.visible}><SalesAnalytics /></SortableAnalyticsCard>;
      case "stockAnalytics":
        return <SortableAnalyticsCard id={section.id} title="Stock" icon={Warehouse} iconColor="bg-indigo-500" isVisible={section.visible}><StockAnalytics /></SortableAnalyticsCard>;
      case "customerAnalytics":
        return <SortableAnalyticsCard id={section.id} title="Customers" icon={Activity} iconColor="bg-orange-500" isVisible={section.visible}><CustomerAnalytics /></SortableAnalyticsCard>;
      case "billAnalytics":
        return <SortableAnalyticsCard id={section.id} title="Bills" icon={Receipt} iconColor="bg-red-500" isVisible={section.visible}><BillAnalytics /></SortableAnalyticsCard>;
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
          <Header title={t("dashboard.title")} description={t("dashboard.description")} />
        </Suspense>

        <div className="flex-1 p-6 overflow-y-auto">
          {/* Metrics Section */}
          <div className="mb-8">
            {loading ? (
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
              <div className="columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6">
                {sections.map(section => (
                  <div key={section.id} className="inline-block w-full">
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
        </div>
      </div>
    </div>
  );
}
