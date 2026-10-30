"use client";

import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { RevenueAnalyticsScreen } from "@dragorbit/features/analytics";
import { Calendar, DollarSign, IndianRupee, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import RevenueChart from "@/components/analytics/revenue/RevenueChart";
import RevenueReportTemplate from "@/components/templates/analytics/revenue/RevenueReportTemplate";
import {
  SortableCard,
  SortableMetricCard,
} from "@/components/templates/analytics/SortableComponents";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getRevenueAnalytics } from "@/store/slices/analyticsSlice";
import { pickStoreId } from "@/utils/store.util";
import { useRevenueReportPrint } from "./hooks/useRevenueReportPrint";

const formatCurrency = (amount) =>
  `₹${(amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const formatNumber = (num) => (num || 0).toLocaleString("en-IN");
const formatPercent = (num) => `${(num || 0).toFixed(2)}%`;

const RevenueAnalytics = () => {
  const { t } = useTranslation();
  useDashboardHeader(
    t("dashboard.revenueAnalytics") || "Revenue Analytics",
    t("analytics.revenueDescription") ||
      "View detailed revenue analytics and insights"
  );

  const dispatch = useAppDispatch();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const { revenue: analytics, isLoading } = useAppSelector(
    (state) => state.analytics
  );

  const storeId = pickStoreId(selectedStore);
  const fetchedStoreId = useRef(null);

  useEffect(() => {
    if (storeId && fetchedStoreId.current !== storeId) {
      fetchedStoreId.current = storeId;
      dispatch(getRevenueAnalytics(storeId));
    }
  }, [storeId, dispatch]);

  const summary = useMemo(
    () =>
      analytics?.summary || {
        totalRevenue: 0,
        totalProfit: 0,
        totalDiscount: 0,
        totalGst: 0,
        profitMargin: 0,
      },
    [analytics?.summary]
  );

  const today = useMemo(
    () =>
      analytics?.today || {
        revenue: 0,
        profit: 0,
        sales: 0,
      },
    [analytics?.today]
  );

  const change = useMemo(
    () =>
      analytics?.change || {
        revenue: 0,
        profit: 0,
        sales: 0,
        changeType: { revenue: "up", profit: "up", sales: "up" },
      },
    [analytics?.change]
  );

  const { handleDownloadPDF, handleDownloadXLSX } = useRevenueReportPrint(
    isLoading,
    analytics
  );
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef(null);

  const [metrics, setMetrics] = useState([
    {
      id: "totalRevenue",
      title: "Total Revenue",
      value: "₹0.00",
      change: "+0.00% from last period",
      icon: IndianRupee,
      iconColor: "from-green-100 to-green-200",
      textColor: "text-[rgb(var(--color-text-primary))]",
    },
    {
      id: "totalProfit",
      title: "Total Profit",
      value: "₹0.00",
      change: "+0.00% from last period",
      icon: DollarSign,
      iconColor: "from-blue-100 to-blue-200",
      textColor: "text-[rgb(var(--color-text-primary))]",
    },
    {
      id: "profitMargin",
      title: "Profit Margin",
      value: "0.00%",
      change: "Overall margin",
      icon: TrendingUp,
      iconColor: "from-purple-100 to-purple-200",
      textColor: "text-[rgb(var(--color-text-primary))]",
    },
    {
      id: "todayRevenue",
      title: "Today's Revenue",
      value: "₹0.00",
      change: "0 sales",
      icon: Calendar,
      iconColor: "from-orange-100 to-orange-200",
      textColor: "text-[rgb(var(--color-text-primary))]",
    },
  ]);

  useEffect(() => {
    if (analytics && summary && change && today) {
      setMetrics((prev) =>
        prev.map((m) => {
          if (m.id === "totalRevenue")
            return {
              ...m,
              value: formatCurrency(summary.totalRevenue),
              change: `${change.changeType?.revenue === "up" ? "+" : "-"}${formatPercent(change.revenue)} from last period`,
            };
          if (m.id === "totalProfit")
            return {
              ...m,
              value: formatCurrency(summary.totalProfit),
              change: `${change.changeType?.profit === "up" ? "+" : "-"}${formatPercent(change.profit)} from last period`,
            };
          if (m.id === "profitMargin")
            return { ...m, value: formatPercent(summary.profitMargin) };
          if (m.id === "todayRevenue")
            return {
              ...m,
              value: formatCurrency(today.revenue),
              change: `${formatNumber(today.sales)} sales`,
            };
          return m;
        })
      );
    }
  }, [analytics, summary, change, today]);

  const [cards, setCards] = useState([
    { id: "chart1", type: "chart", title: "Revenue Trend" },
    { id: "chart2", type: "chart", title: "Revenue by Source" },
    { id: "breakdown", type: "breakdown", title: "Revenue Breakdown" },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
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

  return (
    <RevenueAnalyticsScreen
      model={{
        analytics,
        RevenueReportTemplate,
        selectedStore,
        isLoading,
        sensors,
        handleMetricsDragEnd,
        metrics,
        SortableMetricCard,
        handleCardsDragEnd,
        cards,
        SortableCard,
        RevenueChart,
        formatCurrency,
        today,
        formatNumber,
        summary,
        exportMenuRef,
        setShowExportMenu,
        showExportMenu,
        handleDownloadPDF,
        handleDownloadXLSX,
      }}
    />
  );
};

export default RevenueAnalytics;
