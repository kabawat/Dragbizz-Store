"use client";
import { CustomerAnalyticsScreen } from "@dragorbit/features/analytics";

import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Calendar, UserPlus, Users } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import CustomersChart from "@/components/analytics/customers/CustomersChart";
import CustomersReportTemplate from "@/components/templates/analytics/customers/CustomersReportTemplate";
import {
  SortableCard,
  SortableMetricCard,
} from "@/components/templates/analytics/SortableComponents";

import { useAnalyticsReportPrint } from "@/hooks/print/useAnalyticsReportPrint";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getCustomerAnalytics } from "@/store/slices/customers/analyticsSlice";

const formatNumber = (num) => (num || 0).toLocaleString("en-IN");

const CustomerAnalytics = () => {
  const { t } = useTranslation();
  useDashboardHeader(
    t("dashboard.customerAnalytics") || "Customer Analytics",
    "View detailed customer analytics and insights",
  );

  const dispatch = useAppDispatch();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const { analytics, isLoading } = useAppSelector(
    (state) => state.customerAnalytics,
  );

  const storeId =
    selectedStore?.storeId || selectedStore?.id || selectedStore?._id;
  const fetchedStoreId = useRef(null);

  useEffect(() => {
    if (storeId && fetchedStoreId.current !== storeId) {
      fetchedStoreId.current = storeId;
      dispatch(getCustomerAnalytics(storeId));
    }
  }, [storeId, dispatch]);

  const newCustomers = useMemo(
    () =>
      analytics?.newCustomers || {
        last1Day: 0,
        last7Days: 0,
        last15Days: 0,
        last30Days: 0,
        last3Months: 0,
        last6Months: 0,
        last12Months: 0,
      },
    [analytics?.newCustomers],
  );

  const { handleDownloadPDF, handleDownloadXLSX } = useAnalyticsReportPrint(
    isLoading,
    analytics,
    "customers-report-area",
    "customers-analytics-report",
  );

  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef(null);

  const [metrics, setMetrics] = useState([
    {
      id: "totalCustomers",
      title: "Total Customers",
      value: "0",
      change: "0 today",
      icon: Users,
      iconColor: "from-orange-100 to-orange-200",
      textColor: "text-[rgb(var(--color-text-primary))]",
    },
    {
      id: "todayCustomers",
      title: "Today's Customers",
      value: "0",
      change: "New today",
      icon: Calendar,
      iconColor: "from-blue-100 to-blue-200",
      textColor: "text-[rgb(var(--color-text-primary))]",
    },
    {
      id: "last7Days",
      title: "Last 7 Days",
      value: "0",
      change: "New customers",
      icon: UserPlus,
      iconColor: "from-green-100 to-green-200",
      textColor: "text-[rgb(var(--color-text-primary))]",
    },
    {
      id: "last30Days",
      title: "Last 30 Days",
      value: "0",
      change: "New customers",
      icon: UserPlus,
      iconColor: "from-purple-100 to-purple-200",
      textColor: "text-[rgb(var(--color-text-primary))]",
    },
  ]);

  useEffect(() => {
    if (analytics) {
      setMetrics((prev) =>
        prev.map((m) => {
          if (m.id === "totalCustomers")
            return {
              ...m,
              value: formatNumber(analytics.totalCustomers || 0),
              change: `${formatNumber(analytics.todayCustomers || 0)} today`,
            };
          if (m.id === "todayCustomers")
            return { ...m, value: formatNumber(analytics.todayCustomers || 0) };
          if (m.id === "last7Days")
            return { ...m, value: formatNumber(newCustomers.last7Days) };
          if (m.id === "last30Days")
            return { ...m, value: formatNumber(newCustomers.last30Days) };
          return m;
        }),
      );
    }
  }, [analytics, newCustomers]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setShowExportMenu(false);
      }
    };
    if (showExportMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showExportMenu]);

  const getCustomersXLSXConfig = () => ({
    title: "CUSTOMERS ANALYTICS REPORT",
    columns: 2,
    sections: [
      {
        title: "SUMMARY",
        headers: ["Metric", "Value"],
        columns: 2,
        data: [
          ["Total Customers", formatNumber(analytics?.totalCustomers || 0)],
          ["Today's Customers", formatNumber(newCustomers.last1Day)],
          ["Last 7 Days", formatNumber(newCustomers.last7Days)],
          ["Last 30 Days", formatNumber(newCustomers.last30Days)],
        ],
      },
      {
        title: "CUSTOMER GROWTH BREAKDOWN",
        headers: ["Period", "New Customers"],
        columns: 2,
        data: [
          ["Last 1 Day", formatNumber(newCustomers.last1Day)],
          ["Last 7 Days", formatNumber(newCustomers.last7Days)],
          ["Last 15 Days", formatNumber(newCustomers.last15Days)],
          ["Last 30 Days", formatNumber(newCustomers.last30Days)],
          ["Last 3 Months", formatNumber(newCustomers.last3Months)],
          ["Last 6 Months", formatNumber(newCustomers.last6Months)],
          ["Last 12 Months", formatNumber(newCustomers.last12Months)],
        ],
      },
    ],
  });

  const [cards, setCards] = useState([
    { id: "chart1", type: "chart", title: "Customer Growth Trend" },
    { id: "chart2", type: "chart", title: "Customer Segments" },
    { id: "breakdown", type: "breakdown", title: "Customer Statistics" },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleMetricsDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setMetrics((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleCardsDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setCards((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <CustomerAnalyticsScreen
      model={{
        analytics,
        CustomersReportTemplate,
        selectedStore,
        isLoading,
        sensors,
        handleMetricsDragEnd,
        metrics,
        SortableMetricCard,
        handleCardsDragEnd,
        cards,
        SortableCard,
        CustomersChart,
        formatNumber,
        newCustomers,
        exportMenuRef,
        setShowExportMenu,
        showExportMenu,
        handleDownloadPDF,
        handleDownloadXLSX,
        getCustomersXLSXConfig,
      }}
    />
  );
};

export default CustomerAnalytics;
