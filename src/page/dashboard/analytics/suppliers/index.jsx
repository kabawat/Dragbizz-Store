"use client";
import { SupplierAnalyticsScreen } from "@dragorbit/features/analytics";

import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Building2, CheckCircle, XCircle } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import SuppliersChart from "@/components/analytics/suppliers/SuppliersChart";
import {
  SortableCard,
  SortableMetricCard,
} from "@/components/templates/analytics/SortableComponents";
import SuppliersReportTemplate from "@/components/templates/analytics/suppliers/SuppliersReportTemplate";

import { useAnalyticsReportPrint } from "@/hooks/print/useAnalyticsReportPrint";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getSupplierAnalytics } from "@/store/slices/supplier/analyticsSlice";

const formatNumber = (num) => (num || 0).toLocaleString("en-IN");

const SupplierAnalytics = () => {
  const { t } = useTranslation();

  useDashboardHeader(
    t("dashboard.supplierAnalytics") || "Supplier Analytics",
    "View detailed supplier analytics and insights",
  );
  const dispatch = useAppDispatch();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const { analytics, isLoading } = useAppSelector(
    (state) => state.supplierAnalytics,
  );
  const hasFetchedRef = React.useRef({ storeId: null, fetched: false });

  useEffect(() => {
    const storeId =
      selectedStore?._id || selectedStore?.id || selectedStore?.storeId;
    if (!storeId) return;

    const lastFetched = hasFetchedRef.current;
    if (lastFetched.fetched && lastFetched.storeId === storeId) {
      return;
    }

    hasFetchedRef.current = { storeId, fetched: true };
    dispatch(getSupplierAnalytics(storeId));
  }, [dispatch, selectedStore?._id, selectedStore?.id, selectedStore?.storeId]);

  useEffect(() => {
    const storeId =
      selectedStore?._id || selectedStore?.id || selectedStore?.storeId;
    if (storeId && hasFetchedRef.current.storeId !== storeId) {
      hasFetchedRef.current = { storeId: null, fetched: false };
    }
  }, [selectedStore?._id, selectedStore?.id, selectedStore?.storeId]);

  const totals = useMemo(
    () =>
      analytics?.totals || {
        totalSuppliers: 0,
        activeSuppliers: 0,
        inactiveSuppliers: 0,
      },
    [analytics?.totals],
  );

  const { handleDownloadPDF, handleDownloadXLSX } = useAnalyticsReportPrint(
    isLoading,
    analytics,
    "suppliers-report-area",
    "suppliers-analytics-report",
  );
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = React.useRef(null);

  const [metrics, setMetrics] = useState([
    {
      id: "totalSuppliers",
      title: "Total Suppliers",
      value: "0",
      change: "0 active, 0 inactive",
      icon: Building2,
      iconColor: "from-teal-100 to-teal-200",
      textColor: "text-[rgb(var(--color-text-primary))]",
    },
    {
      id: "activeSuppliers",
      title: "Active Suppliers",
      value: "0",
      change: "Currently active",
      icon: CheckCircle,
      iconColor: "from-green-100 to-green-200",
      textColor: "text-[rgb(var(--color-text-primary))]",
    },
    {
      id: "inactiveSuppliers",
      title: "Inactive Suppliers",
      value: "0",
      change: "Not active",
      icon: XCircle,
      iconColor: "from-gray-100 to-gray-200",
      textColor: "text-[rgb(var(--color-text-primary))]",
    },
    {
      id: "supplierCount",
      title: "Total Count",
      value: "0",
      change: "All suppliers",
      icon: Building2,
      iconColor: "from-blue-100 to-blue-200",
      textColor: "text-[rgb(var(--color-text-primary))]",
    },
  ]);

  useEffect(() => {
    if (analytics && totals) {
      setMetrics((prevMetrics) => {
        const metricsMap = new Map(prevMetrics.map((m) => [m.id, m]));

        if (metricsMap.has("totalSuppliers")) {
          metricsMap.set("totalSuppliers", {
            ...metricsMap.get("totalSuppliers"),
            value: formatNumber(totals.totalSuppliers),
            change: `${formatNumber(totals.activeSuppliers)} active, ${formatNumber(totals.inactiveSuppliers)} inactive`,
          });
        }
        if (metricsMap.has("activeSuppliers")) {
          metricsMap.set("activeSuppliers", {
            ...metricsMap.get("activeSuppliers"),
            value: formatNumber(totals.activeSuppliers),
            change: "Currently active",
          });
        }
        if (metricsMap.has("inactiveSuppliers")) {
          metricsMap.set("inactiveSuppliers", {
            ...metricsMap.get("inactiveSuppliers"),
            value: formatNumber(totals.inactiveSuppliers),
            change: "Not active",
          });
        }
        if (metricsMap.has("supplierCount")) {
          metricsMap.set("supplierCount", {
            ...metricsMap.get("supplierCount"),
            value: formatNumber(totals.totalSuppliers),
            change: "All suppliers",
          });
        }

        return Array.from(metricsMap.values());
      });
    }
  }, [analytics, totals]);

  // Handle click outside export menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        exportMenuRef.current &&
        !exportMenuRef.current.contains(event.target)
      ) {
        setShowExportMenu(false);
      }
    };

    if (showExportMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showExportMenu]);

  const getSuppliersXLSXConfig = () => {
    return {
      title: "SUPPLIERS ANALYTICS REPORT",
      columns: 2,
      sections: [
        {
          title: "SUMMARY",
          headers: ["Metric", "Value"],
          columns: 2,
          data: [
            ["Total Suppliers", formatNumber(totals.totalSuppliers)],
            ["Active Suppliers", formatNumber(totals.activeSuppliers)],
            ["Inactive Suppliers", formatNumber(totals.inactiveSuppliers)],
            ["Total Count", formatNumber(totals.totalSuppliers)],
          ],
        },
        {
          title: "SUPPLIERS BREAKDOWN",
          headers: ["Category", "Count"],
          columns: 2,
          data: [
            ["Total Suppliers", formatNumber(totals.totalSuppliers)],
            ["Active Suppliers", formatNumber(totals.activeSuppliers)],
            ["Inactive Suppliers", formatNumber(totals.inactiveSuppliers)],
          ],
        },
      ],
    };
  };

  const [cards, setCards] = useState([
    { id: "chart1", type: "chart", title: "Supplier Growth Trend" },
    { id: "chart2", type: "chart", title: "Supplier Performance" },
    { id: "breakdown", type: "breakdown", title: "Supplier Statistics" },
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
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleCardsDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setCards((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <SupplierAnalyticsScreen
      model={{
        analytics,
        SuppliersReportTemplate,
        selectedStore,
        isLoading,
        sensors,
        handleMetricsDragEnd,
        metrics,
        SortableMetricCard,
        handleCardsDragEnd,
        cards,
        SortableCard,
        SuppliersChart,
        formatNumber,
        totals,
        exportMenuRef,
        setShowExportMenu,
        showExportMenu,
        handleDownloadPDF,
        handleDownloadXLSX,
        getSuppliersXLSXConfig,
      }}
    />
  );
};

export default SupplierAnalytics;
