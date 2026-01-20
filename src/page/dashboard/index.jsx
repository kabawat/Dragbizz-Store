"use client";
import React, { useState, useEffect, Suspense, lazy } from "react";
import logger from "@/utils/logger";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  IndianRupee,
  Users,
  Package,
  Building2,
  TrendingUp,
  TrendingDown,
  FileText,
  UserPlus,
  PackagePlus,
  Building,
  GripVertical,
  Loader2,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Warehouse,
  Receipt,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { dashboardService } from "@/service/retailer";
import { useAppSelector } from "@/store/hooks";
import { useTranslation } from "@/hooks/useTranslation";

// Lazy load components
const Sidebar = lazy(() => import("@/components/dashboard/Sidebar"));
const Header = lazy(() => import("@/components/dashboard/Header"));

const getQuickActions = (t) => [
  {
    title: t("dashboard.addCustomer"),
    icon: UserPlus,
    path: "/dashboard/customers/add",
  },
  {
    title: t("dashboard.addProduct"),
    icon: PackagePlus,
    path: "/dashboard/products/add",
  },
  { title: t("dashboard.newInvoice"), icon: FileText, path: "" },
  {
    title: t("dashboard.addSupplier"),
    icon: Building,
    path: "/dashboard/suppliers/add",
  },
];

const SortableSection = ({ id, children, isVisible, onToggleVisibility }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group mb-6 break-inside-avoid break-inside-avoid-column"
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <div className="w-6 h-6 bg-[rgb(var(--color-bg-primary))] rounded border border-[rgb(var(--color-border-primary))] flex items-center justify-center shadow-sm">
          <GripVertical className="w-3 h-3 text-[rgb(var(--color-text-secondary))]" />
        </div>
      </div>

      {/* Section Content */}
      <div
        className={`transition-all duration-300 ${!isVisible ? "opacity-50 pointer-events-none" : ""}`}
      >
        {children}
      </div>
    </div>
  );
};

const SortableMetricCard = ({
  id,
  title,
  value,
  change,
  changeType,
  icon: Icon,
  iconColor,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const ChangeIcon = changeType === "up" ? TrendingUp : TrendingDown;
  const changeColor = changeType === "up" ? "text-green-600" : "text-red-600";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-[rgb(var(--color-bg-primary))]/20 backdrop-blur-md rounded-lg border border-[rgb(var(--color-border-primary))]/50 p-6 hover:shadow-lg transition-all duration-300 hover:bg-[rgb(var(--color-bg-primary))]/30 relative group"
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <div className="w-6 h-6 bg-[rgb(var(--color-bg-primary))] rounded border border-[rgb(var(--color-border-primary))] flex items-center justify-center shadow-sm">
          <GripVertical className="w-3 h-3 text-[rgb(var(--color-text-secondary))]" />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">
            {value}
          </p>
          <div className={`flex items-center mt-2 ${changeColor}`}>
            <ChangeIcon className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">{change}</span>
          </div>
        </div>
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconColor}`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  iconColor,
}) => {
  const ChangeIcon = changeType === "up" ? TrendingUp : TrendingDown;
  const changeColor = changeType === "up" ? "text-green-600" : "text-red-600";

  return (
    <div className="bg-[rgb(var(--color-bg-primary))]/20 backdrop-blur-md rounded-lg border border-[rgb(var(--color-border-primary))]/50 p-6 hover:shadow-lg transition-all duration-300 hover:bg-[rgb(var(--color-bg-primary))]/30">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">
            {value}
          </p>
          <div className={`flex items-center mt-2 ${changeColor}`}>
            <ChangeIcon className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">{change}</span>
          </div>
        </div>
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconColor}`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

const formatPercentChange = (value) => {
  const numericValue = Number(value);
  const safeValue = Number.isFinite(numericValue) ? numericValue : 0;
  return `${safeValue >= 0 ? "+" : ""}${safeValue.toFixed(1)}%`;
};

const QuickActionButton = ({ title, icon: Icon, onClick }) => (
  <button
    onClick={onClick}
    className="cursor-pointer flex flex-col items-center justify-center p-6 bg-[rgb(var(--color-bg-primary))]/20 backdrop-blur-sm border-2 border-dashed border-[rgb(var(--color-border-secondary))]/60 rounded-lg hover:border-[rgb(var(--color-primary))]/80 hover:bg-[rgb(var(--color-primary))]/10 transition-all duration-300 group"
  >
    <div className="w-12 h-12 bg-[rgb(var(--color-bg-tertiary))] rounded-lg flex items-center justify-center mb-3 group-hover:bg-[rgb(var(--color-primary))]/10 transition-colors">
      <Icon className="w-6 h-6 text-[rgb(var(--color-text-tertiary))] group-hover:text-[rgb(var(--color-primary))]" />
    </div>
    <span className="text-sm font-medium text-[rgb(var(--color-text-secondary))] group-hover:text-[rgb(var(--color-primary))]">
      {title}
    </span>
  </button>
);

const AnalyticsCard = ({ title, icon: Icon, iconColor, children, linkTo }) => (
  <div className="bg-[rgb(var(--color-bg-primary))]/20 backdrop-blur-md rounded-lg border border-[rgb(var(--color-border-primary))]/50 p-6 shadow-xs">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div
          className={`w-10 h-10 ${iconColor} rounded-lg flex items-center justify-center`}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
          {title}
        </h2>
      </div>
      {linkTo && (
        <Link
          href={linkTo}
          className="flex items-center text-sm text-[rgb(var(--color-primary))] hover:underline"
        >
          View Details
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      )}
    </div>
    {children}
  </div>
);

const SortableAnalyticsCard = ({
  id,
  title,
  icon: Icon,
  iconColor,
  children,
  isVisible,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getLinkTo = () => {
    const linkMap = {
      revenueAnalytics: "/dashboard/analytics/revenue",
      salesAnalytics: "/dashboard/analytics/sales",
      stockAnalytics: "/dashboard/analytics/stock",
      productAnalytics: "/dashboard/analytics/products",
      customerAnalytics: "/dashboard/analytics/customers",
      supplierAnalytics: "/dashboard/analytics/suppliers",
      billAnalytics: "/dashboard/analytics/bills",
    };
    return linkMap[id] || null;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group mb-6 break-inside-avoid break-inside-avoid-column"
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <div className="w-6 h-6 bg-[rgb(var(--color-bg-primary))] rounded border border-[rgb(var(--color-border-primary))] flex items-center justify-center shadow-sm">
          <GripVertical className="w-3 h-3 text-[rgb(var(--color-text-secondary))]" />
        </div>
      </div>

      {/* Card Content */}
      <div
        className={`transition-all duration-300 ${!isVisible ? "opacity-50 pointer-events-none" : ""}`}
      >
        <AnalyticsCard
          title={title}
          icon={Icon}
          iconColor={iconColor}
          linkTo={getLinkTo()}
        >
          {children}
        </AnalyticsCard>
      </div>
    </div>
  );
};

// Individual Analytics Components - Simplified for Dashboard (only totals and charts)
const RevenueAnalytics = ({ t }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <span className="text-sm text-[rgb(var(--color-text-secondary))]">
        Total Revenue
      </span>
      <span className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
        ₹0
      </span>
    </div>
    <div className="h-48 bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg flex items-center justify-center border border-[rgb(var(--color-border-primary))]/30">
      <p className="text-sm text-[rgb(var(--color-text-tertiary))]">
        Chart will be displayed here
      </p>
    </div>
  </div>
);

const SalesAnalytics = ({ t }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <span className="text-sm text-[rgb(var(--color-text-secondary))]">
        Total Sales
      </span>
      <span className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
        0
      </span>
    </div>
    <div className="h-48 bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg flex items-center justify-center border border-[rgb(var(--color-border-primary))]/30">
      <p className="text-sm text-[rgb(var(--color-text-tertiary))]">
        Chart will be displayed here
      </p>
    </div>
  </div>
);

const StockAnalytics = ({ t }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <span className="text-sm text-[rgb(var(--color-text-secondary))]">
        Total Stock Value
      </span>
      <span className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
        ₹0
      </span>
    </div>
    <div className="h-48 bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg flex items-center justify-center border border-[rgb(var(--color-border-primary))]/30">
      <p className="text-sm text-[rgb(var(--color-text-tertiary))]">
        Chart will be displayed here
      </p>
    </div>
  </div>
);

const ProductAnalytics = ({ t }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <span className="text-sm text-[rgb(var(--color-text-secondary))]">
        Total Products
      </span>
      <span className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
        0
      </span>
    </div>
    <div className="h-48 bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg flex items-center justify-center border border-[rgb(var(--color-border-primary))]/30">
      <p className="text-sm text-[rgb(var(--color-text-tertiary))]">
        Chart will be displayed here
      </p>
    </div>
  </div>
);

const CustomerAnalytics = ({ t }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <span className="text-sm text-[rgb(var(--color-text-secondary))]">
        Total Customers
      </span>
      <span className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
        0
      </span>
    </div>
    <div className="h-48 bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg flex items-center justify-center border border-[rgb(var(--color-border-primary))]/30">
      <p className="text-sm text-[rgb(var(--color-text-tertiary))]">
        Chart will be displayed here
      </p>
    </div>
  </div>
);

const SupplierAnalytics = ({ t }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <span className="text-sm text-[rgb(var(--color-text-secondary))]">
        Total Suppliers
      </span>
      <span className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
        0
      </span>
    </div>
    <div className="h-48 bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg flex items-center justify-center border border-[rgb(var(--color-border-primary))]/30">
      <p className="text-sm text-[rgb(var(--color-text-tertiary))]">
        Chart will be displayed here
      </p>
    </div>
  </div>
);

const BillAnalytics = ({ t }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <span className="text-sm text-[rgb(var(--color-text-secondary))]">
        Total Bills
      </span>
      <span className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
        ₹0
      </span>
    </div>
    <div className="h-48 bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg flex items-center justify-center border border-[rgb(var(--color-border-primary))]/30">
      <p className="text-sm text-[rgb(var(--color-text-tertiary))]">
        Chart will be displayed here
      </p>
    </div>
  </div>
);

export default function Dashboard() {
  const { t } = useTranslation();
  const [selectedStore, setSelectedStore] = useState(null);
  const router = useRouter();
  const { selectedStore: storeFromRedux } = useAppSelector(
    (state) => state.profile,
  );
  const [loading, setLoading] = useState(true);
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
      title: t("dashboard.productsInStock"),
      value: "0",
      change: "0%",
      changeType: "up",
      icon: Package,
      iconColor: "bg-purple-500",
    },
    {
      id: "suppliers",
      title: t("dashboard.suppliers"),
      value: "0",
      change: "0%",
      changeType: "up",
      icon: Building2,
      iconColor: "bg-orange-500",
    },
  ]);

  const [sections, setSections] = useState([
    { id: "quickActions", visible: true },
    { id: "revenueAnalytics", visible: true },
    { id: "salesAnalytics", visible: true },
    { id: "stockAnalytics", visible: true },
    { id: "productAnalytics", visible: true },
    { id: "customerAnalytics", visible: true },
    { id: "supplierAnalytics", visible: true },
    { id: "billAnalytics", visible: true },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const loadDashboardMetrics = async (storeId) => {
    const response = await dashboardService.getDashboard({
      period: 30,
      storeId,
    });

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
      setMetrics(updatedMetrics);
    }
  };

  // Fetch dashboard data
  useEffect(() => {
    const storeId =
      storeFromRedux?._id || storeFromRedux?.id || storeFromRedux?.storeId;

    if (!storeId) {
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        await loadDashboardMetrics(storeId);
      } catch (error) {
        logger.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [storeFromRedux?._id, storeFromRedux?.id, storeFromRedux?.storeId]);

  // Load saved layout from localStorage
  useEffect(() => {
    const savedMetrics = localStorage.getItem("dashboard-metrics-order");
    const savedSections = localStorage.getItem("dashboard-sections-order");

    if (savedMetrics && !loading) {
      try {
        const savedOrder = JSON.parse(savedMetrics);
        setMetrics((prevMetrics) => {
          const reorderedMetrics = savedOrder
            .map((id) => prevMetrics.find((metric) => metric.id === id))
            .filter(Boolean);
          return reorderedMetrics.length === prevMetrics.length
            ? reorderedMetrics
            : prevMetrics;
        });
      } catch (error) {
        logger.error("Failed to load saved metrics order:", error);
      }
    }

    if (savedSections) {
      try {
        const savedOrder = JSON.parse(savedSections);
        setSections((prevSections) => {
          const reorderedSections = savedOrder
            .map((id) => prevSections.find((section) => section.id === id))
            .filter(Boolean);
          // Ensure all default sections are present
          const defaultIds = [
            "quickActions",
            "revenueAnalytics",
            "salesAnalytics",
            "stockAnalytics",
            "productAnalytics",
            "customerAnalytics",
            "supplierAnalytics",
            "billAnalytics",
          ];
          const missingIds = defaultIds.filter(
            (id) => !reorderedSections.find((s) => s.id === id),
          );
          missingIds.forEach((id) => {
            const defaultSection = prevSections.find((s) => s.id === id);
            if (defaultSection) reorderedSections.push(defaultSection);
          });
          return reorderedSections.length === prevSections.length
            ? reorderedSections
            : prevSections;
        });
      } catch (error) {
        logger.error("Failed to load saved sections order:", error);
      }
    }
  }, [loading]);

  // Save layout to localStorage
  const saveMetricsOrder = (newMetrics) => {
    const order = newMetrics.map((metric) => metric.id);
    localStorage.setItem("dashboard-metrics-order", JSON.stringify(order));
  };

  const saveSectionsOrder = (newSections) => {
    const order = newSections.map((section) => section.id);
    localStorage.setItem("dashboard-sections-order", JSON.stringify(order));
  };

  const handleMetricsDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setMetrics((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newMetrics = arrayMove(items, oldIndex, newIndex);
        saveMetricsOrder(newMetrics);
        return newMetrics;
      });
    }
  };

  const handleSectionsDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newSections = arrayMove(items, oldIndex, newIndex);
        saveSectionsOrder(newSections);
        return newSections;
      });
    }
  };

  const handleStoreChange = (storeObject) => {
    setSelectedStore(storeObject);
  };

  const handleRedirect = (path) => {
    router.push(path);
  };

  const renderSectionContent = (section) => {
    if (section.id === "quickActions") {
      return (
        <div className="bg-[rgb(var(--color-bg-primary))]/20 backdrop-blur-md rounded-lg border border-[rgb(var(--color-border-primary))]/50 p-6 shadow-xs">
          <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-4">
            {t("dashboard.quickActions")}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {getQuickActions(t).map((action, index) => (
              <QuickActionButton
                key={index}
                {...action}
                onClick={() => handleRedirect(action.path)}
              />
            ))}
          </div>
        </div>
      );
    }

    if (section.id === "revenueAnalytics") {
      return (
        <SortableAnalyticsCard
          id={section.id}
          title={t("dashboard.revenueAnalytics") || "Revenue Analytics"}
          icon={LineChart}
          iconColor="bg-green-500"
          isVisible={section.visible}
        >
          <RevenueAnalytics t={t} />
        </SortableAnalyticsCard>
      );
    }

    if (section.id === "salesAnalytics") {
      return (
        <SortableAnalyticsCard
          id={section.id}
          title={t("dashboard.salesAnalytics") || "Sales Analytics"}
          icon={BarChart3}
          iconColor="bg-blue-500"
          isVisible={section.visible}
        >
          <SalesAnalytics t={t} />
        </SortableAnalyticsCard>
      );
    }

    if (section.id === "stockAnalytics") {
      return (
        <SortableAnalyticsCard
          id={section.id}
          title={t("dashboard.stockAnalytics") || "Stock Analytics"}
          icon={Warehouse}
          iconColor="bg-indigo-500"
          isVisible={section.visible}
        >
          <StockAnalytics t={t} />
        </SortableAnalyticsCard>
      );
    }

    if (section.id === "productAnalytics") {
      return (
        <SortableAnalyticsCard
          id={section.id}
          title={t("dashboard.productAnalytics") || "Product Analytics"}
          icon={PieChart}
          iconColor="bg-purple-500"
          isVisible={section.visible}
        >
          <ProductAnalytics t={t} />
        </SortableAnalyticsCard>
      );
    }

    if (section.id === "customerAnalytics") {
      return (
        <SortableAnalyticsCard
          id={section.id}
          title={t("dashboard.customerAnalytics") || "Customer Analytics"}
          icon={Activity}
          iconColor="bg-orange-500"
          isVisible={section.visible}
        >
          <CustomerAnalytics t={t} />
        </SortableAnalyticsCard>
      );
    }

    if (section.id === "supplierAnalytics") {
      return (
        <SortableAnalyticsCard
          id={section.id}
          title={t("dashboard.supplierAnalytics") || "Supplier Analytics"}
          icon={Building2}
          iconColor="bg-teal-500"
          isVisible={section.visible}
        >
          <SupplierAnalytics t={t} />
        </SortableAnalyticsCard>
      );
    }

    if (section.id === "billAnalytics") {
      return (
        <SortableAnalyticsCard
          id={section.id}
          title={t("dashboard.billAnalytics") || "Bill Analytics"}
          icon={Receipt}
          iconColor="bg-red-500"
          isVisible={section.visible}
        >
          <BillAnalytics t={t} />
        </SortableAnalyticsCard>
      );
    }

    return null;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[rgb(var(--color-bg-secondary))] relative">
      <Suspense
        fallback={
          <div className="w-64 bg-[rgb(var(--color-bg-primary))] border-r border-[rgb(var(--color-border-primary))]" />
        }
      >
        <Sidebar onStoreChange={handleStoreChange} />
      </Suspense>

      {/* Main Content Area */}
      <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col overflow-hidden">
        {/* Header */}
        <Suspense
          fallback={
            <div className="h-20 bg-[rgb(var(--color-bg-primary))] border-b border-[rgb(var(--color-border-primary))] flex items-center px-6">
              <div className="h-6 bg-[rgb(var(--color-bg-secondary))] rounded w-48 animate-pulse" />
            </div>
          }
        >
          <Header
            title={t("dashboard.title")}
            description={t("dashboard.description")}
          />
        </Suspense>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Metrics Cards - Sortable */}
          <div className="mb-8">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-[rgb(var(--color-bg-primary))]/20 backdrop-blur-md rounded-lg border border-[rgb(var(--color-border-primary))]/50 p-6 animate-pulse"
                  >
                    <div className="h-4 bg-[rgb(var(--color-bg-secondary))] rounded w-24 mb-2"></div>
                    <div className="h-8 bg-[rgb(var(--color-bg-secondary))] rounded w-32 mb-2"></div>
                    <div className="h-4 bg-[rgb(var(--color-bg-secondary))] rounded w-20"></div>
                  </div>
                ))}
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleMetricsDragEnd}
              >
                <SortableContext
                  items={metrics.map((m) => m.id)}
                  strategy={rectSortingStrategy}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {metrics.map((metric) => (
                      <SortableMetricCard key={metric.id} {...metric} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>

          {/* Content Grid - Sortable Sections */}
          <div className="mb-8">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleSectionsDragEnd}
            >
              <SortableContext
                items={sections.map((s) => s.id)}
                strategy={rectSortingStrategy}
              >
                <div className="columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6">
                  {sections.map((section) => {
                    // For individual analytics cards, render them directly without SortableSection wrapper
                    if (
                      [
                        "revenueAnalytics",
                        "salesAnalytics",
                        "stockAnalytics",
                        "productAnalytics",
                        "customerAnalytics",
                        "supplierAnalytics",
                        "billAnalytics",
                      ].includes(section.id)
                    ) {
                      return (
                        <div key={section.id} className="inline-block w-full">
                          {renderSectionContent(section)}
                        </div>
                      );
                    }
                    // For other sections, use SortableSection wrapper
                    return (
                      <SortableSection
                        key={section.id}
                        id={section.id}
                        isVisible={section.visible}
                        onToggleVisibility={() => {}}
                      >
                        <div className="inline-block w-full">
                          {renderSectionContent(section)}
                        </div>
                      </SortableSection>
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>
      </div>
    </div>
  );
}
