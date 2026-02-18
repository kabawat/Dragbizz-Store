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
  CheckCircle,
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  XCircle,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import SalesChart from "@/components/analytics/sales/SalesChart";
import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";
import {
  SortableCard,
  SortableMetricCard,
} from "@/components/templates/analytics/SortableComponents";
import SalesReportTemplate from "@/components/templates/analytics/sales/SalesReportTemplate";
import { Button, Card } from "@/components/ui";
import { useAnalyticsReportPrint } from "@/hooks/useAnalyticsReportPrint";
import { useTranslation } from "@/hooks/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getInvoiceAnalytics } from "@/store/slices/analyticsSlice";
import { formatCurrency, formatNumber } from "@/utils/currencyFormatter";

const SalesAnalytics = ({ titleOverride, descriptionOverride }) => {

  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const { invoices: analytics, loading } = useAppSelector(
    (state) => state.analytics
  );
  const isLoading = loading?.invoices;
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
    dispatch(getInvoiceAnalytics(storeId));
  }, [dispatch, selectedStore?._id, selectedStore?.id, selectedStore?.storeId]);

  useEffect(() => {
    const storeId =
      selectedStore?._id || selectedStore?.id || selectedStore?.storeId;
    if (storeId && hasFetchedRef.current.storeId !== storeId) {
      hasFetchedRef.current = { storeId: null, fetched: false };
    }
  }, [selectedStore?._id, selectedStore?.id, selectedStore?.storeId]);

  // Memoize derived values
  const counts = useMemo(
    () =>
      analytics?.counts || {
        totalInvoices: 0,
        releasedInvoices: 0,
        draftInvoices: 0,
        cancelledInvoices: 0,
      },
    [analytics?.counts]
  );

  const amounts = useMemo(
    () =>
      analytics?.amounts || {
        totalAmount: 0,
        averageOrderValue: 0,
      },
    [analytics?.amounts]
  );

  const today = useMemo(
    () =>
      analytics?.today || {
        totalInvoices: 0,
        releasedInvoices: 0,
      },
    [analytics?.today]
  );


  const { handleDownloadPDF, handleDownloadXLSX, isPreparing } = useAnalyticsReportPrint(
    isLoading,
    analytics,
    "sales-report-area",
    "sales-analytics-report"
  );
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = React.useRef(null);

  const [metrics, setMetrics] = useState([
    {
      id: "totalInvoices",
      title: "Total Invoices",
      value: "0",
      change: "0 released, 0 draft",
      icon: FileText,
      iconColor: "from-blue-100 to-blue-200",
      textColor: "text-[rgb(var(--color-text-primary))]",
    },
    {
      id: "releasedInvoices",
      title: "Released Invoices",
      value: "0",
      change: "₹0.00",
      icon: CheckCircle,
      iconColor: "from-green-100 to-green-200",
      textColor: "text-[rgb(var(--color-text-primary))]",
    },
    {
      id: "draftInvoices",
      title: "Draft Invoices",
      value: "0",
      change: "Pending release",
      icon: FileText,
      iconColor: "from-yellow-100 to-yellow-200",
      textColor: "text-[rgb(var(--color-text-primary))]",
    },
    {
      id: "cancelledInvoices",
      title: "Cancelled Invoices",
      value: "0",
      change: "Cancelled",
      icon: XCircle,
      iconColor: "from-red-100 to-red-200",
      textColor: "text-[rgb(var(--color-text-primary))]",
    },
  ]);

  // Update metrics when analytics data changes
  useEffect(() => {
    if (analytics && counts && amounts) {
      setMetrics((prevMetrics) => {
        const metricsMap = new Map(prevMetrics.map((m) => [m.id, m]));

        if (metricsMap.has("totalInvoices")) {
          metricsMap.set("totalInvoices", {
            ...metricsMap.get("totalInvoices"),
            value: formatNumber(counts.totalInvoices),
            change: `${formatNumber(counts.releasedInvoices)} released, ${formatNumber(counts.draftInvoices)} draft`,
          });
        }
        if (metricsMap.has("releasedInvoices")) {
          metricsMap.set("releasedInvoices", {
            ...metricsMap.get("releasedInvoices"),
            value: formatNumber(counts.releasedInvoices),
            change: formatCurrency(amounts.totalAmount),
          });
        }
        if (metricsMap.has("draftInvoices")) {
          metricsMap.set("draftInvoices", {
            ...metricsMap.get("draftInvoices"),
            value: formatNumber(counts.draftInvoices),
            change: "Pending release",
          });
        }
        if (metricsMap.has("cancelledInvoices")) {
          metricsMap.set("cancelledInvoices", {
            ...metricsMap.get("cancelledInvoices"),
            value: formatNumber(counts.cancelledInvoices),
            change: "Cancelled",
          });
        }

        return Array.from(metricsMap.values());
      });
    }
  }, [analytics, counts, amounts]);

  const [cards, setCards] = useState([
    { id: "chart1", type: "chart", title: "Sales Trend" },
    { id: "chart2", type: "chart", title: "Sales by Product" },
    { id: "breakdown", type: "breakdown", title: "Sales Breakdown" },
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

  const getSalesXLSXConfig = () => {

    return {
      title: "SALES ANALYTICS REPORT",
      columns: 3,
      sections: [
        {
          title: "SUMMARY",
          headers: ["Metric", "Value", "Details"],
          columns: 3,
          data: [
            [
              "Total Invoices",
              formatNumber(counts.totalInvoices),
              `${formatNumber(counts.releasedInvoices)} released, ${formatNumber(counts.draftInvoices)} draft`,
            ],
            [
              "Released Invoices",
              formatNumber(counts.releasedInvoices),
              formatCurrency(amounts.totalAmount),
            ],
            [
              "Draft Invoices",
              formatNumber(counts.draftInvoices),
              "Pending release",
            ],
            [
              "Cancelled Invoices",
              formatNumber(counts.cancelledInvoices),
              "Cancelled",
            ],
          ],
        },
        {
          title: "TODAY'S PERFORMANCE",
          headers: ["Metric", "Value", "Details"],
          columns: 3,
          data: [
            [
              "Today's Invoices",
              formatNumber(today.totalInvoices),
              `${formatNumber(today.releasedInvoices)} released`,
            ],
            [
              "Average Order Value",
              formatCurrency(amounts.averageOrderValue),
              "Per invoice",
            ],
          ],
        },
        {
          title: "INVOICE BREAKDOWN",
          headers: ["Category", "Count"],
          columns: 2,
          data: [
            ["Total Invoices", formatNumber(counts.totalInvoices)],
            ["Released Invoices", formatNumber(counts.releasedInvoices)],
            ["Draft Invoices", formatNumber(counts.draftInvoices)],
            ["Cancelled Invoices", formatNumber(counts.cancelledInvoices)],
            ["Total Amount", formatCurrency(amounts.totalAmount)],
          ],
          amountColumns: [1],
        },
      ],
    };
  };

  return (
    <>
      {isPreparing && (
        <div
          id="sales-report-area"
          style={{
            position: "absolute",
            left: "-9999px",
            top: "-9999px",
            width: "850px",
          }}
        >
          {analytics && (
            <SalesReportTemplate
              analyticsData={analytics}
              selectedStore={selectedStore}
            />
          )}
        </div>
      )}

      <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative">
        <Sidebar />

        <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
          <Header
            title={t("dashboard.salesAnalytics") || titleOverride}
            description={descriptionOverride || "View detailed sales analytics and insights"}
          />

          <div className="flex-1 p-6 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-sm text-[rgb(var(--color-text-tertiary))]">
                  Loading analytics data...
                </p>
              </div>
            ) : (
              <>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleMetricsDragEnd}
                >
                  <SortableContext
                    items={metrics.map((m) => m.id)}
                    strategy={rectSortingStrategy}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      {metrics.map((metric) => (
                        <SortableMetricCard key={metric.id} {...metric} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleCardsDragEnd}
                >
                  <SortableContext
                    items={cards.map((c) => c.id)}
                    strategy={rectSortingStrategy}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {cards.map((card) => (
                        <SortableCard key={card.id} id={card.id}>
                          {card.type === "chart" && (
                            <Card>
                              <div className="p-6">
                                <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-4">
                                  {card.title}
                                </h3>
                                <div className="h-64 overflow-hidden">
                                  <SalesChart type={card.id === "chart1" ? "bar" : "line"} />
                                </div>
                              </div>
                            </Card>
                          )}
                          {card.type === "breakdown" && (
                            <Card>
                              <div className="p-6">
                                <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-4">
                                  {card.title}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 border-[var(--color-border-primary-light)] text-center">
                                    <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">
                                      Today's Invoices
                                    </p>
                                    <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                                      {formatNumber(today.totalInvoices)}
                                    </p>
                                    <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-1">
                                      {formatNumber(today.releasedInvoices)}{" "}
                                      released
                                    </p>
                                  </div>
                                  <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 border-[var(--color-border-primary-light)] text-center">
                                    <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">
                                      Total Amount
                                    </p>
                                    <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                      {formatCurrency(amounts.totalAmount)}
                                    </p>
                                  </div>
                                  <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 border-[var(--color-border-primary-light)] text-center">
                                    <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">
                                      Avg Order Value
                                    </p>
                                    <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                                      {formatCurrency(
                                        amounts.averageOrderValue
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          )}
                        </SortableCard>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="no-print fixed bottom-6 right-6 z-50" ref={exportMenuRef}>
        <div className="relative">
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
            <div className="absolute bottom-full right-0 mb-2 w-48 bg-[rgb(var(--color-bg-primary))] rounded-lg shadow-lg border border-[rgb(var(--color-border-primary))] py-1 z-50">
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
                    "sales-analytics-report",
                    getSalesXLSXConfig()
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
    </>
  );
};

export default SalesAnalytics;
