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
import {
  SortableCard,
  SortableMetricCard,
} from "@/components/templates/analytics/SortableComponents";
import SalesReportTemplate from "@/components/templates/analytics/sales/SalesReportTemplate";
import { Button, Card } from "@/components/ui";
import { useAnalyticsReportPrint } from "@/hooks/print/useAnalyticsReportPrint";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getInvoiceAnalytics } from "@/store/slices/analyticsSlice";

const formatNumber = (num) => (num || 0).toLocaleString("en-IN");
const formatCurrency = (amount) =>
  `₹${(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const SalesAnalytics = () => {
  const { t } = useTranslation();
  useDashboardHeader(t("dashboard.salesAnalytics") || "Sales Analytics", "View detailed sales analytics and insights");

  const dispatch = useAppDispatch();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const { invoice: analytics, isLoadingInvoice: isLoading } = useAppSelector((state) => state.analytics);

  const storeId = selectedStore?.storeId || selectedStore?.id || selectedStore?._id;
  const fetchedStoreId = useRef(null);

  useEffect(() => {
    if (storeId && fetchedStoreId.current !== storeId) {
      fetchedStoreId.current = storeId;
      dispatch(getInvoiceAnalytics(storeId));
    }
  }, [storeId, dispatch]);

  const counts = useMemo(() => analytics?.counts || {
    totalInvoices: 0,
    releasedInvoices: 0,
    draftInvoices: 0,
    cancelledInvoices: 0,
  }, [analytics?.counts]);

  const amounts = useMemo(() => analytics?.amounts || {
    totalAmount: 0,
    averageOrderValue: 0,
  }, [analytics?.amounts]);

  const today = useMemo(() => analytics?.today || {
    totalInvoices: 0,
    releasedInvoices: 0,
  }, [analytics?.today]);

  const { handleDownloadPDF, handleDownloadXLSX } = useAnalyticsReportPrint(
    isLoading,
    analytics,
    "sales-report-area",
    "sales-analytics-report"
  );

  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef(null);

  const [metrics, setMetrics] = useState([
    { id: "totalInvoices", title: "Total Invoices", value: "0", change: "0 released, 0 draft", icon: FileText, iconColor: "from-blue-100 to-blue-200", textColor: "text-[rgb(var(--color-text-primary))]" },
    { id: "releasedInvoices", title: "Released Invoices", value: "0", change: "₹0.00", icon: CheckCircle, iconColor: "from-green-100 to-green-200", textColor: "text-[rgb(var(--color-text-primary))]" },
    { id: "draftInvoices", title: "Draft Invoices", value: "0", change: "Pending release", icon: FileText, iconColor: "from-yellow-100 to-yellow-200", textColor: "text-[rgb(var(--color-text-primary))]" },
    { id: "cancelledInvoices", title: "Cancelled Invoices", value: "0", change: "Cancelled", icon: XCircle, iconColor: "from-red-100 to-red-200", textColor: "text-[rgb(var(--color-text-primary))]" },
  ]);

  useEffect(() => {
    if (analytics && counts && amounts) {
      setMetrics(prev => prev.map(m => {
        if (m.id === "totalInvoices") return { ...m, value: formatNumber(counts.totalInvoices), change: `${formatNumber(counts.releasedInvoices)} released, ${formatNumber(counts.draftInvoices)} draft` };
        if (m.id === "releasedInvoices") return { ...m, value: formatNumber(counts.releasedInvoices), change: formatCurrency(amounts.totalAmount) };
        if (m.id === "draftInvoices") return { ...m, value: formatNumber(counts.draftInvoices) };
        if (m.id === "cancelledInvoices") return { ...m, value: formatNumber(counts.cancelledInvoices) };
        return m;
      }));
    }
  }, [analytics, counts, amounts]);

  const [cards, setCards] = useState([
    { id: "chart1", type: "chart", title: "Sales Trend" },
    { id: "chart2", type: "chart", title: "Sales by Product" },
    { id: "breakdown", type: "breakdown", title: "Sales Breakdown" },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
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
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showExportMenu]);

  const getSalesXLSXConfig = () => ({
    title: "SALES ANALYTICS REPORT",
    columns: 3,
    sections: [
      {
        title: "SUMMARY",
        headers: ["Metric", "Value", "Details"],
        columns: 3,
        data: [
          ["Total Invoices", formatNumber(counts.totalInvoices), `${formatNumber(counts.releasedInvoices)} released, ${formatNumber(counts.draftInvoices)} draft`],
          ["Released Invoices", formatNumber(counts.releasedInvoices), formatCurrency(amounts.totalAmount)],
          ["Draft Invoices", formatNumber(counts.draftInvoices), "Pending release"],
          ["Cancelled Invoices", formatNumber(counts.cancelledInvoices), "Cancelled"],
        ],
      },
      {
        title: "TODAY'S PERFORMANCE",
        headers: ["Metric", "Value", "Details"],
        columns: 3,
        data: [
          ["Today's Invoices", formatNumber(today.totalInvoices), `${formatNumber(today.releasedInvoices)} released`],
          ["Average Order Value", formatCurrency(amounts.averageOrderValue), "Per invoice"],
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
  });

  return (
    <>
      <div id="sales-report-area" className="absolute -left-[9999px] -top-[9999px] w-[850px]" >
        {analytics && (
          <SalesReportTemplate
            analyticsData={analytics}
            selectedStore={selectedStore}
          />
        )}
      </div>

      <div className="p-5">
        <div className="max-w-8xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-sm text-[rgb(var(--color-text-tertiary))]">Loading analytics data...</p>
            </div>
          ) : (
            <>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleMetricsDragEnd}>
                <SortableContext items={metrics.map((m) => m.id)} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {metrics.map((metric) => (
                      <SortableMetricCard key={metric.id} {...metric} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCardsDragEnd}>
                <SortableContext items={cards.map((c) => c.id)} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cards.map((card) => (
                      <SortableCard key={card.id} id={card.id}>
                        {card.type === "chart" && (
                          <Card>
                            <div className="p-6">
                              <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-4">{card.title}</h3>
                              <div className="h-64 overflow-hidden">
                                <SalesChart type={card.id === "chart1" ? "bar" : "line"} />
                              </div>
                            </div>
                          </Card>
                        )}
                        {card.type === "breakdown" && (
                          <Card>
                            <div className="p-6">
                              <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-4">{card.title}</h3>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 border-[var(--color-border-primary-light)] text-center">
                                  <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">Today's Invoices</p>
                                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">{formatNumber(today.totalInvoices)}</p>
                                  <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-1">{formatNumber(today.releasedInvoices)} released</p>
                                </div>
                                <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 border-[var(--color-border-primary-light)] text-center">
                                  <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">Total Amount</p>
                                  <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">{formatCurrency(amounts.totalAmount)}</p>
                                </div>
                                <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 border-[var(--color-border-primary-light)] text-center">
                                  <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">Avg Order Value</p>
                                  <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">{formatCurrency(amounts.averageOrderValue)}</p>
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
                  handleDownloadXLSX(analytics, selectedStore, "sales-analytics-report", getSalesXLSXConfig());
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
