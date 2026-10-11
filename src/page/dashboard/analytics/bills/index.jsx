"use client";
import { BillAnalyticsScreen } from "@dragorbit/features/analytics";

import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Receipt,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import StatsGrid from "@/components/analytics/StatsGrid";
import PerformanceCard from "@/components/analytics/cards/PerformanceCard";
import AnalyticsListCard from "@/components/analytics/cards/AnalyticsListCard";
import AnalyticsChartCard from "@/components/analytics/cards/AnalyticsChartCard";
import AnalyticsBreakdownCard from "@/components/analytics/cards/AnalyticsBreakdownCard";
import BillsChart from "@/components/analytics/bills/BillsChart";
import BillsReportTemplate from "@/components/templates/analytics/bills/BillsReportTemplate";
import { SortableCard } from "@/components/templates/analytics/SortableComponents";

import { useAnalyticsReportPrint } from "@/hooks/print/useAnalyticsReportPrint";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getBillAnalytics } from "@/store/slices/analyticsSlice";

const formatNumber = (num) => (num || 0).toLocaleString("en-IN");
const formatCurrency = (amount) =>
  `₹${(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const DATE_RANGE_OPTIONS = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "quarter", label: "This Quarter" },
  { value: "year", label: "This Year" },
];

const BillAnalytics = () => {
  const { t } = useTranslation();

  useDashboardHeader(
    t("dashboard.billAnalytics") || "Bill Analytics",
    "View detailed bill analytics and insights",
  );
  const dispatch = useAppDispatch();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const { bill: analytics, isLoadingBill: isLoading } = useAppSelector(
    (state) => state.analytics,
  );
  const { suppliers } = useAppSelector(
    (state) => state.suppliers || { suppliers: [] },
  );

  const storeId =
    selectedStore?.storeId || selectedStore?._id || selectedStore?.id;

  const [dateRange, setDateRange] = useState("month");
  const [supplierId, setSupplierId] = useState("all");
  const lastFetchParams = useRef(null);

  const fetchAnalytics = () => {
    if (!storeId) return;

    const params = JSON.stringify({ store: storeId, dateRange, supplierId });
    if (lastFetchParams.current === params) return;
    lastFetchParams.current = params;

    dispatch(
      getBillAnalytics({
        store: `${storeId}`,
        dateRange,
        supplier: supplierId !== "all" ? supplierId : undefined,
      }),
    );
  };

  useEffect(() => {
    fetchAnalytics();
  }, [storeId, dateRange, supplierId]);

  const { handleDownloadPDF, handleDownloadXLSX } = useAnalyticsReportPrint(
    isLoading,
    analytics,
    "bills-report-area",
    "bills-analytics-report",
  );
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef(null);

  // Memoize derived values
  const counts = useMemo(
    () =>
      analytics?.counts || {
        totalBills: 0,
        paidBills: 0,
        pendingBills: 0,
        overdueBills: 0,
      },
    [analytics?.counts],
  );

  const amounts = useMemo(
    () =>
      analytics?.amounts || {
        totalPayable: 0,
        totalPaid: 0,
        totalDue: 0,
        totalGst: 0,
      },
    [analytics?.amounts],
  );

  const [metrics, setMetrics] = useState([
    {
      id: "totalBills",
      title: "Total Bills",
      value: "0",
      change: "0 paid, 0 pending",
      icon: Receipt,
      iconColor: "from-red-100 to-red-200",
      textColor: "text-[rgb(var(--color-text-primary))]",
    },
    {
      id: "paidBills",
      title: "Paid Bills",
      value: "0",
      change: "₹0.00",
      icon: CheckCircle,
      iconColor: "from-green-100 to-green-200",
      textColor: "text-[rgb(var(--color-text-primary))]",
    },
    {
      id: "pendingBills",
      title: "Pending Bills",
      value: "0",
      change: "₹0.00",
      icon: AlertTriangle,
      iconColor: "from-yellow-100 to-yellow-200",
      textColor: "text-[rgb(var(--color-text-primary))]",
    },
    {
      id: "overdueBills",
      title: "Overdue Bills",
      value: "0",
      change: "Urgent action needed",
      icon: XCircle,
      iconColor: "from-orange-100 to-orange-200",
      textColor: "text-[rgb(var(--color-text-primary))]",
    },
  ]);

  const [amountCards, setAmountCards] = useState([
    {
      id: "amount1",
      type: "amount",
      title: "Total Payable",
      value: "₹0.00",
      label: "Total purchase value",
      color: "text-red-600 dark:text-red-400",
    },
    {
      id: "amountGst",
      type: "amount",
      title: "Total GST Paid",
      value: "₹0.00",
      label: "Total Input Tax Credit",
      color: "text-blue-600 dark:text-blue-400",
      icon: Receipt,
    },
    {
      id: "amount2",
      type: "amount",
      title: "Total Paid",
      value: "₹0.00",
      label: "Total amount paid",
      color: "text-green-600 dark:text-green-400",
    },
    {
      id: "amount3",
      type: "amount",
      title: "Total Due",
      value: "₹0.00",
      label: "Outstanding amount",
      color: "text-orange-600 dark:text-orange-400",
    },
  ]);

  // Update metrics when analytics data changes
  useEffect(() => {
    if (analytics && counts && amounts) {
      setMetrics((prevMetrics) => {
        const metricsMap = new Map(prevMetrics.map((m) => [m.id, m]));

        if (metricsMap.has("totalBills")) {
          metricsMap.set("totalBills", {
            ...metricsMap.get("totalBills"),
            value: formatNumber(counts.totalBills),
            change: `${formatNumber(counts.paidBills)} paid, ${formatNumber(counts.pendingBills)} pending`,
          });
        }
        if (metricsMap.has("paidBills")) {
          metricsMap.set("paidBills", {
            ...metricsMap.get("paidBills"),
            value: formatNumber(counts.paidBills),
            change: formatCurrency(amounts.totalPaid),
          });
        }
        if (metricsMap.has("pendingBills")) {
          metricsMap.set("pendingBills", {
            ...metricsMap.get("pendingBills"),
            value: formatNumber(counts.pendingBills),
            change: formatCurrency(amounts.totalDue),
          });
        }
        if (metricsMap.has("overdueBills")) {
          metricsMap.set("overdueBills", {
            ...metricsMap.get("overdueBills"),
            value: formatNumber(counts.overdueBills),
            change:
              counts.overdueBills > 0
                ? "Urgent action needed"
                : "No overdue bills",
          });
        }

        return Array.from(metricsMap.values());
      });

      setAmountCards((prevCards) => {
        const cardsMap = new Map(prevCards.map((c) => [c.id, c]));

        if (cardsMap.has("amount1")) {
          cardsMap.set("amount1", {
            ...cardsMap.get("amount1"),
            value: formatCurrency(amounts.totalPayable),
          });
        }
        if (cardsMap.has("amountGst")) {
          cardsMap.set("amountGst", {
            ...cardsMap.get("amountGst"),
            value: formatCurrency(amounts.totalGst),
          });
        }
        if (cardsMap.has("amount2")) {
          cardsMap.set("amount2", {
            ...cardsMap.get("amount2"),
            value: formatCurrency(amounts.totalPaid),
          });
        }
        if (cardsMap.has("amount3")) {
          cardsMap.set("amount3", {
            ...cardsMap.get("amount3"),
            value: formatCurrency(amounts.totalDue),
          });
        }

        return Array.from(cardsMap.values());
      });
    }
  }, [analytics, counts, amounts]);

  const performanceMetrics = useMemo(() => {
    return [
      {
        title: "Avg Payment Time",
        value: `${analytics?.performance?.avgPaymentDays || 0} days`,
        label: "Time to pay bills",
        icon: Clock,
        color: "text-blue-600",
      },
      {
        title: "On-Time Rate",
        value: `${analytics?.performance?.onTimeRate || 0}%`,
        label: "Bills paid by due date",
        icon: CheckCircle,
        color: "text-green-600",
      },
      {
        title: "Supplier Reliability",
        value: `${analytics?.performance?.reliability || 0}%`,
        label: "Delivery & billing accuracy",
        icon: Users,
        color: "text-purple-600",
      },
    ];
  }, [analytics]);

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

  const getBillsXLSXConfig = () => {
    return {
      title: "BILLS ANALYTICS REPORT",
      columns: 2,
      sections: [
        {
          title: "SUMMARY",
          headers: ["Metric", "Value"],
          columns: 2,
          data: [
            ["Total Bills", formatNumber(counts.totalBills)],
            ["Paid Bills", formatNumber(counts.paidBills)],
            ["Pending Bills", formatNumber(counts.pendingBills)],
            ["Overdue Bills", formatNumber(counts.overdueBills)],
          ],
        },
        {
          title: "FINANCIAL BREAKDOWN",
          headers: ["Category", "Amount"],
          columns: 2,
          data: [
            ["Total Payable", formatCurrency(amounts.totalPayable)],
            ["Total Paid", formatCurrency(amounts.totalPaid)],
            ["Total Due", formatCurrency(amounts.totalDue)],
            ["Paid Bills", formatNumber(counts.paidBills)],
            ["Pending Bills", formatNumber(counts.pendingBills)],
          ],
          amountColumns: [1],
        },
      ],
    };
  };

  const [cards, setCards] = useState([
    {
      id: "supplierAnalysis",
      type: "list",
      title: "Top Suppliers",
      key: "topSuppliers",
    },
    {
      id: "monthlyTrends",
      type: "list",
      title: "Monthly Bill Trends",
      key: "trends",
    },
    { id: "breakdown", type: "breakdown", title: "Bill Statistics" },
  ]);

  const handleMetricsDragEnd = (items) => {
    setMetrics(items);
  };

  const handleAmountCardsDragEnd = (items) => {
    setAmountCards(items);
  };

  const handleCardsDragEnd = (items) => {
    setCards(items);
  };

  return (
    <BillAnalyticsScreen
      model={{
        analytics,
        BillsReportTemplate,
        selectedStore,
        dateRange,
        setDateRange,
        DATE_RANGE_OPTIONS,
        supplierId,
        setSupplierId,
        suppliers,
        exportMenuRef,
        setShowExportMenu,
        showExportMenu,
        isLoading,
        handleDownloadPDF,
        handleDownloadXLSX,
        getBillsXLSXConfig,
        StatsGrid,
        metrics,
        handleMetricsDragEnd,
        amountCards,
        handleAmountCardsDragEnd,
        SortableCard,
        performanceMetrics,
        PerformanceCard,
        cards,
        handleCardsDragEnd,
        AnalyticsListCard,
        formatCurrency,
        AnalyticsChartCard,
        BillsChart,
        AnalyticsBreakdownCard,
        formatNumber,
        counts,
        amounts,
      }}
    />
  );
};

export default BillAnalytics;
