"use client";
import { StockAnalyticsScreen } from "@dragorbit/features/analytics";

import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { AlertTriangle, Package, Warehouse, XCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import StockChart from "@/components/analytics/stock/StockChart";
import {
  SortableCard,
  SortableMetricCard,
} from "@/components/templates/analytics/SortableComponents";
import StockReportTemplate from "@/components/templates/analytics/stock/StockReportTemplate";

import { useAnalyticsReportPrint } from "@/hooks/print/useAnalyticsReportPrint";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getStockAnalytics } from "@/store/slices/products/analyticsSlice";

const formatNumber = (num) => (num || 0).toLocaleString("en-IN");
const formatCurrency = (amount) =>
  `₹${(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const StockAnalytics = () => {
  const { t } = useTranslation();
  useDashboardHeader(
    t("dashboard.stockAnalytics") || "Stock Analytics",
    t("analytics.stockDescription") ||
      "View detailed stock analytics and insights",
  );

  const dispatch = useAppDispatch();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const { analytics, isLoading } = useAppSelector(
    (state) => state.productAnalytics,
  );

  const storeId =
    selectedStore?.storeId || selectedStore?.id || selectedStore?._id;
  const fetchedStoreId = useRef(null);

  useEffect(() => {
    if (storeId && fetchedStoreId.current !== storeId) {
      fetchedStoreId.current = storeId;
      dispatch(getStockAnalytics(storeId));
    }
  }, [storeId, dispatch]);

  const totals = useMemo(
    () =>
      analytics?.totals || {
        totalSkus: 0,
        totalQuantity: 0,
        availableQuantity: 0,
        reservedQuantity: 0,
        soldQuantity: 0,
        lowStockItems: 0,
        outOfStockItems: 0,
      },
    [analytics?.totals],
  );

  const valueSummary = useMemo(
    () =>
      analytics?.valueSummary || {
        averageCost: 0,
        totalStockValue: 0,
      },
    [analytics?.valueSummary],
  );

  const { handleDownloadPDF, handleDownloadXLSX } = useAnalyticsReportPrint(
    isLoading,
    analytics,
    "stock-report-area",
    "stock-analytics-report",
  );

  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef(null);

  const [metrics, setMetrics] = useState([
    {
      id: "totalSKUs",
      title: "Total SKUs",
      value: "0",
      change: "0 available",
      icon: Package,
      iconColor: "from-indigo-100 to-indigo-200",
      textColor: "text-[rgb(var(--color-text-primary))]",
    },
    {
      id: "totalQuantity",
      title: "Total Quantity",
      value: "0",
      change: "0 available",
      icon: Warehouse,
      iconColor: "from-green-100 to-green-200",
      textColor: "text-[rgb(var(--color-text-primary))]",
    },
    {
      id: "lowStock",
      title: "Low Stock Items",
      value: "0",
      change: "Needs attention",
      icon: AlertTriangle,
      iconColor: "from-yellow-100 to-yellow-200",
      textColor: "text-[rgb(var(--color-text-primary))]",
    },
    {
      id: "outOfStock",
      title: "Out of Stock",
      value: "0",
      change: "Urgent action needed",
      icon: XCircle,
      iconColor: "from-red-100 to-red-200",
      textColor: "text-[rgb(var(--color-text-primary))]",
    },
  ]);

  const [statusCards, setStatusCards] = useState([
    {
      id: "available",
      title: "Available Stock",
      value: "0",
      label: "Items in stock",
      color: "text-green-600 dark:text-green-400",
    },
    {
      id: "reserved",
      title: "Reserved Stock",
      value: "0",
      label: "Items reserved",
      color: "text-yellow-600 dark:text-yellow-400",
    },
    {
      id: "sold",
      title: "Sold Stock",
      value: "0",
      label: "Items sold",
      color: "text-blue-600 dark:text-blue-400",
    },
  ]);

  const [cards, setCards] = useState([
    { id: "chart1", type: "chart", title: "Stock Trend" },
    { id: "chart2", type: "chart", title: "Stock by Category" },
    { id: "breakdown", type: "breakdown", title: "Stock Value Breakdown" },
  ]);

  useEffect(() => {
    if (analytics && totals && valueSummary) {
      setMetrics((prev) =>
        prev.map((m) => {
          if (m.id === "totalSKUs")
            return {
              ...m,
              value: formatNumber(totals.totalSkus),
              change: `${formatNumber(totals.availableQuantity)} available`,
            };
          if (m.id === "totalQuantity")
            return {
              ...m,
              value: formatNumber(totals.totalQuantity),
              change: `${formatNumber(totals.availableQuantity)} available`,
            };
          if (m.id === "lowStock")
            return { ...m, value: formatNumber(totals.lowStockItems) };
          if (m.id === "outOfStock")
            return { ...m, value: formatNumber(totals.outOfStockItems) };
          return m;
        }),
      );

      setStatusCards((prev) =>
        prev.map((c) => {
          if (c.id === "available")
            return { ...c, value: formatNumber(totals.availableQuantity) };
          if (c.id === "reserved")
            return { ...c, value: formatNumber(totals.reservedQuantity) };
          if (c.id === "sold")
            return { ...c, value: formatNumber(totals.soldQuantity) };
          return c;
        }),
      );
    }
  }, [analytics, totals, valueSummary]);

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

  const getStockXLSXConfig = () => ({
    title: "STOCK ANALYTICS REPORT",
    columns: 2,
    sections: [
      {
        title: "SUMMARY",
        headers: ["Metric", "Value"],
        columns: 2,
        data: [
          ["Total SKUs", formatNumber(totals.totalSkus)],
          ["Total Quantity", formatNumber(totals.totalQuantity)],
          ["Low Stock Items", formatNumber(totals.lowStockItems)],
          ["Out of Stock", formatNumber(totals.outOfStockItems)],
        ],
      },
      {
        title: "STOCK BREAKDOWN",
        headers: ["Category", "Value"],
        columns: 2,
        data: [
          ["Total SKUs", formatNumber(totals.totalSkus)],
          ["Total Quantity", formatNumber(totals.totalQuantity)],
          ["Available Quantity", formatNumber(totals.availableQuantity)],
          ["Reserved Quantity", formatNumber(totals.reservedQuantity)],
          ["Sold Quantity", formatNumber(totals.soldQuantity)],
          ["Total Stock Value", formatCurrency(valueSummary.totalStockValue)],
          ["Average Cost", formatCurrency(valueSummary.averageCost)],
        ],
        amountColumns: [1],
      },
    ],
  });

  return (
    <StockAnalyticsScreen
      model={{
        analytics,
        StockReportTemplate,
        selectedStore,
        isLoading,
        sensors,
        handleMetricsDragEnd,
        metrics,
        SortableMetricCard,
        handleCardsDragEnd,
        statusCards,
        cards,
        SortableCard,
        StockChart,
        formatCurrency,
        valueSummary,
        exportMenuRef,
        setShowExportMenu,
        showExportMenu,
        handleDownloadPDF,
        handleDownloadXLSX,
        getStockXLSXConfig,
      }}
    />
  );
};

export default StockAnalytics;
