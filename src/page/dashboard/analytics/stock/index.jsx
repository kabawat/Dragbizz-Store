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
  AlertTriangle,
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  Package,
  Warehouse,
  XCircle,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import StockChart from "@/components/analytics/stock/StockChart";
import { SortableCard, SortableMetricCard } from "@/components/templates/analytics/SortableComponents";
import StockReportTemplate from "@/components/templates/analytics/stock/StockReportTemplate";
import { Button, Card } from "@/components/ui";
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
  useDashboardHeader(t("dashboard.stockAnalytics") || "Stock Analytics", t("analytics.stockDescription") || "View detailed stock analytics and insights");

  const dispatch = useAppDispatch();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const { analytics, isLoading } = useAppSelector((state) => state.productAnalytics);

  const storeId = selectedStore?.storeId || selectedStore?.id || selectedStore?._id;
  const fetchedStoreId = useRef(null);

  useEffect(() => {
    if (storeId && fetchedStoreId.current !== storeId) {
      fetchedStoreId.current = storeId;
      dispatch(getStockAnalytics(storeId));
    }
  }, [storeId, dispatch]);

  const totals = useMemo(() => analytics?.totals || {
    totalSkus: 0,
    totalQuantity: 0,
    availableQuantity: 0,
    reservedQuantity: 0,
    soldQuantity: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
  }, [analytics?.totals]);

  const valueSummary = useMemo(() => analytics?.valueSummary || {
    averageCost: 0,
    totalStockValue: 0,
  }, [analytics?.valueSummary]);

  const { handleDownloadPDF, handleDownloadXLSX } = useAnalyticsReportPrint(
    isLoading,
    analytics,
    "stock-report-area",
    "stock-analytics-report"
  );

  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef(null);

  const [metrics, setMetrics] = useState([
    { id: "totalSKUs", title: "Total SKUs", value: "0", change: "0 available", icon: Package, iconColor: "from-indigo-100 to-indigo-200", textColor: "text-[rgb(var(--color-text-primary))]" },
    { id: "totalQuantity", title: "Total Quantity", value: "0", change: "0 available", icon: Warehouse, iconColor: "from-green-100 to-green-200", textColor: "text-[rgb(var(--color-text-primary))]" },
    { id: "lowStock", title: "Low Stock Items", value: "0", change: "Needs attention", icon: AlertTriangle, iconColor: "from-yellow-100 to-yellow-200", textColor: "text-[rgb(var(--color-text-primary))]" },
    { id: "outOfStock", title: "Out of Stock", value: "0", change: "Urgent action needed", icon: XCircle, iconColor: "from-red-100 to-red-200", textColor: "text-[rgb(var(--color-text-primary))]" },
  ]);

  const [statusCards, setStatusCards] = useState([
    { id: "available", title: "Available Stock", value: "0", label: "Items in stock", color: "text-green-600 dark:text-green-400" },
    { id: "reserved", title: "Reserved Stock", value: "0", label: "Items reserved", color: "text-yellow-600 dark:text-yellow-400" },
    { id: "sold", title: "Sold Stock", value: "0", label: "Items sold", color: "text-blue-600 dark:text-blue-400" },
  ]);

  const [cards, setCards] = useState([
    { id: "chart1", type: "chart", title: "Stock Trend" },
    { id: "chart2", type: "chart", title: "Stock by Category" },
    { id: "breakdown", type: "breakdown", title: "Stock Value Breakdown" },
  ]);

  useEffect(() => {
    if (analytics && totals && valueSummary) {
      setMetrics(prev => prev.map(m => {
        if (m.id === "totalSKUs") return { ...m, value: formatNumber(totals.totalSkus), change: `${formatNumber(totals.availableQuantity)} available` };
        if (m.id === "totalQuantity") return { ...m, value: formatNumber(totals.totalQuantity), change: `${formatNumber(totals.availableQuantity)} available` };
        if (m.id === "lowStock") return { ...m, value: formatNumber(totals.lowStockItems) };
        if (m.id === "outOfStock") return { ...m, value: formatNumber(totals.outOfStockItems) };
        return m;
      }));

      setStatusCards(prev => prev.map(c => {
        if (c.id === "available") return { ...c, value: formatNumber(totals.availableQuantity) };
        if (c.id === "reserved") return { ...c, value: formatNumber(totals.reservedQuantity) };
        if (c.id === "sold") return { ...c, value: formatNumber(totals.soldQuantity) };
        return c;
      }));
    }
  }, [analytics, totals, valueSummary]);

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
    <>
      <div id="stock-report-area" className="absolute -left-[9999px] -top-[9999px] w-[850px]" >
        {analytics && (
          <StockReportTemplate
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
                <SortableContext items={[...statusCards.map(c => c.id), ...cards.map(c => c.id)]} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {statusCards.map((card) => (
                      <SortableCard key={card.id} id={card.id}>
                        <Card>
                          <div className="p-4 text-center">
                            <h3 className="text-sm font-semibold text-[rgb(var(--color-text-primary))] mb-3">{card.title}</h3>
                            <p className={`text-2xl font-bold ${card.color} mb-1`}>{card.value}</p>
                            <p className="text-xs text-[rgb(var(--color-text-secondary))]">{card.label}</p>
                          </div>
                        </Card>
                      </SortableCard>
                    ))}
                    {cards.map((card) => (
                      <SortableCard key={card.id} id={card.id}>
                        {card.type === "chart" && (
                          <Card>
                            <div className="p-6">
                              <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-4">{card.title}</h3>
                              <div className="h-64 overflow-hidden">
                                <StockChart type={card.id === "chart1" ? "line" : "area"} />
                              </div>
                            </div>
                          </Card>
                        )}
                        {card.type === "breakdown" && (
                          <Card>
                            <div className="p-6">
                              <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-4">{card.title}</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 text-center">
                                  <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">Total Stock Value</p>
                                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">{formatCurrency(valueSummary.totalStockValue)}</p>
                                </div>
                                <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 text-center">
                                  <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">Average Cost</p>
                                  <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">{formatCurrency(valueSummary.averageCost)}</p>
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
                  handleDownloadXLSX(analytics, selectedStore, "stock-analytics-report", getStockXLSXConfig());
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

export default StockAnalytics;
