"use client";
import {
  AlertTriangle,
  Building2,
  CheckCircle,
  ChevronDown,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Receipt,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import StatsGrid from "@/components/analytics/StatsGrid";
import PerformanceCard from "@/components/analytics/cards/PerformanceCard";
import AnalyticsListCard from "@/components/analytics/cards/AnalyticsListCard";
import AnalyticsChartCard from "@/components/analytics/cards/AnalyticsChartCard";
import AnalyticsBreakdownCard from "@/components/analytics/cards/AnalyticsBreakdownCard";
import BillsChart from "@/components/analytics/bills/BillsChart";
import BillsReportTemplate from "@/components/templates/analytics/bills/BillsReportTemplate";
import { SortableCard } from "@/components/templates/analytics/SortableComponents";
import { Button, Card, Select } from "@/components/ui";
import { useAnalyticsReportPrint } from "@/hooks/useAnalyticsReportPrint";
import { useTranslation } from "@/hooks/useTranslation";
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
  const dispatch = useAppDispatch();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const { bill: analytics, isLoadingBill: isLoading } = useAppSelector((state) => state.analytics);
  const { suppliers } = useAppSelector((state) => state.suppliers || { suppliers: [] });

  const [dateRange, setDateRange] = useState("month");
  const [supplierId, setSupplierId] = useState("all");

  const fetchAnalytics = () => {
    const storeId = selectedStore?.storeId

    if (!storeId) return;

    dispatch(getBillAnalytics({
      store: `${storeId}`,
      dateRange,
      supplier: supplierId !== "all" ? supplierId : undefined
    }));
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dispatch, selectedStore?._id, selectedStore?.id, selectedStore?.storeId, dateRange, supplierId]);


  const { handleDownloadPDF, handleDownloadXLSX } = useAnalyticsReportPrint(
    isLoading,
    analytics,
    "bills-report-area",
    "bills-analytics-report"
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
    [analytics?.counts]
  );

  const amounts = useMemo(
    () =>
      analytics?.amounts || {
        totalPayable: 0,
        totalPaid: 0,
        totalDue: 0,
        totalGst: 0,
      },
    [analytics?.amounts]
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
            change: counts.overdueBills > 0 ? "Urgent action needed" : "No overdue bills",
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
    { id: "supplierAnalysis", type: "list", title: "Top Suppliers", key: "topSuppliers" },
    { id: "monthlyTrends", type: "list", title: "Monthly Bill Trends", key: "trends" },
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
    <>

      <div
        id="bills-report-area"
        style={{
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
          width: "850px",
        }}
      >
        {analytics && (
          <BillsReportTemplate
            analyticsData={analytics}
            selectedStore={selectedStore}
          />
        )}
      </div>

      <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative">
        <Sidebar />

        <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
          <Header
            title={t("dashboard.billAnalytics") || "Bill Analytics"}
            description="View detailed bill analytics and insights"
          />

          <div className="flex-1 p-6 overflow-y-auto">
            {/* Filters Section */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 max-w-xs">
                <Select
                  placeholder="Date Range"
                  value={dateRange}
                  onChange={(val) => setDateRange(val)}
                  options={DATE_RANGE_OPTIONS}
                  size="sm"
                />
              </div>

              <div className="flex-1 max-w-xs">
                <Select
                  placeholder="Select Supplier"
                  value={supplierId}
                  onChange={(val) => setSupplierId(val)}
                  options={[
                    { value: "all", label: "All Suppliers" },
                    ...(suppliers?.map((s) => ({
                      value: s.id || s._id,
                      label: s.name,
                    })) || []),
                  ]}
                  size="sm"
                  searchable
                />
              </div>

              <div className="ml-auto no-print relative" ref={exportMenuRef}>
                <Button
                  variant="primary"
                  leftIcon={Download}
                  rightIcon={ChevronDown}
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  disabled={isLoading || !analytics}
                >
                  Download Report
                </Button>

                {showExportMenu && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-[rgb(var(--color-bg-primary))] rounded-lg shadow-lg border border-[rgb(var(--color-border-primary))] py-1 z-50">
                    <button
                      onClick={() => {
                        handleDownloadPDF(analytics);
                        setShowExportMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm flex items-center gap-3 transition-colors duration-200 cursor-pointer hover:bg-[rgb(var(--color-bg-secondary))] focus:outline-none text-[rgb(var(--color-text-primary))]"
                    >
                      <FileText className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                      Download as PDF
                    </button>
                    <button
                      onClick={() => {
                        handleDownloadXLSX(
                          analytics,
                          selectedStore,
                          "bills-analytics-report",
                          getBillsXLSXConfig()
                        );
                        setShowExportMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm flex items-center gap-3 transition-colors duration-200 cursor-pointer hover:bg-[rgb(var(--color-bg-secondary))] focus:outline-none text-[rgb(var(--color-text-primary))]"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                      Download as XLSX
                    </button>
                  </div>
                )}
              </div>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-sm text-[rgb(var(--color-text-tertiary))]">
                  Loading analytics data...
                </p>
              </div>
            ) : (
              <>
                <StatsGrid
                  items={metrics}
                  onItemsChange={handleMetricsDragEnd}
                />

                {/* Amount Cards - Single Row */}
                <StatsGrid
                  items={amountCards}
                  onItemsChange={handleAmountCardsDragEnd}
                  columns={3}
                  renderItem={(card) => (
                    <SortableCard key={card.id} id={card.id}>
                      <Card className="hover:shadow-md transition-shadow">
                        <div className="p-5">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                              {card.title}
                            </h3>
                            <div className={`p-1.5 rounded-md bg-[rgb(var(--color-bg-secondary))] ${card.color}`}>
                              <Filter className="w-4 h-4" />
                            </div>
                          </div>
                          <div>
                            <p className={`text-2xl font-bold ${card.color} mb-1`}>
                              {card.value}
                            </p>
                            <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                              {card.label}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </SortableCard>
                  )}
                />

                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {performanceMetrics.map((pm, idx) => (
                    <PerformanceCard
                      key={idx}
                      title={pm.title}
                      value={pm.value}
                      label={pm.label}
                      icon={pm.icon}
                      color={pm.color}
                    />
                  ))}
                </div>

                {/* Other Cards */}
                <StatsGrid
                  items={cards}
                  onItemsChange={handleCardsDragEnd}
                  columns={3}
                  renderItem={(card) => (
                    <SortableCard key={card.id} id={card.id}>
                      {card.type === "list" && (
                        <AnalyticsListCard
                          title={card.title}
                          icon={card.id === "supplierAnalysis" ? Building2 : TrendingUp}
                          items={analytics?.[card.key]}
                          formatItemValue={(item) =>
                            item.value ? formatCurrency(item.value) : (item.percentage ? `${item.percentage}%` : "")
                          }
                        />
                      )}
                      {card.type === "chart" && (
                        <AnalyticsChartCard title={card.title}>
                          <BillsChart type={card.id === "chart1" ? "line" : "area"} />
                        </AnalyticsChartCard>
                      )}
                      {card.type === "breakdown" && (
                        <AnalyticsBreakdownCard
                          title={card.title}
                          items={[
                            {
                              label: "Paid Bills",
                              value: formatNumber(counts.paidBills),
                              subValue: formatCurrency(amounts.totalPaid),
                              colorClass: "text-green-600 dark:text-green-400"
                            },
                            {
                              label: "Pending Bills",
                              value: formatNumber(counts.pendingBills),
                              subValue: formatCurrency(amounts.totalDue),
                              colorClass: "text-yellow-600 dark:text-yellow-400"
                            },
                            {
                              label: "Overdue Bills",
                              value: formatNumber(counts.overdueBills),
                              colorClass: "text-red-600 dark:text-red-400"
                            }
                          ]}
                        />
                      )}
                    </SortableCard>
                  )}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BillAnalytics;
