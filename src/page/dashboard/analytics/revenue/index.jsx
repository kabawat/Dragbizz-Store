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
  Calendar,
  ChevronDown,
  DollarSign,
  Download,
  FileSpreadsheet,
  FileText,
  IndianRupee,
  TrendingUp,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import RevenueChart from "@/components/analytics/revenue/RevenueChart";
import RevenueReportTemplate from "@/components/templates/analytics/revenue/RevenueReportTemplate";
import { SortableCard, SortableMetricCard } from "@/components/templates/analytics/SortableComponents";
import { Button, Card } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getRevenueAnalytics } from "@/store/slices/analyticsSlice";
import { useRevenueReportPrint } from "./hooks/useRevenueReportPrint";

const formatCurrency = (amount) =>
  `₹${(amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const formatNumber = (num) => (num || 0).toLocaleString("en-IN");
const formatPercent = (num) => `${(num || 0).toFixed(2)}%`;

const RevenueAnalytics = () => {
  const { t } = useTranslation();
  useDashboardHeader(t("dashboard.revenueAnalytics") || "Revenue Analytics", t("analytics.revenueDescription") || "View detailed revenue analytics and insights");

  const dispatch = useAppDispatch();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const { revenue: analytics, isLoading } = useAppSelector((state) => state.analytics);

  const storeId = selectedStore?.storeId || selectedStore?.id || selectedStore?._id;
  const fetchedStoreId = useRef(null);

  useEffect(() => {
    if (storeId && fetchedStoreId.current !== storeId) {
      fetchedStoreId.current = storeId;
      dispatch(getRevenueAnalytics(storeId));
    }
  }, [storeId, dispatch]);

  const summary = useMemo(() => analytics?.summary || {
    totalRevenue: 0,
    totalProfit: 0,
    totalDiscount: 0,
    totalGst: 0,
    profitMargin: 0,
  }, [analytics?.summary]);

  const today = useMemo(() => analytics?.today || {
    revenue: 0,
    profit: 0,
    sales: 0,
  }, [analytics?.today]);

  const change = useMemo(() => analytics?.change || {
    revenue: 0,
    profit: 0,
    sales: 0,
    changeType: { revenue: "up", profit: "up", sales: "up" },
  }, [analytics?.change]);

  const { handleDownloadPDF, handleDownloadXLSX } = useRevenueReportPrint(isLoading, analytics);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef(null);

  const [metrics, setMetrics] = useState([
    { id: "totalRevenue", title: "Total Revenue", value: "₹0.00", change: "+0.00% from last period", icon: IndianRupee, iconColor: "from-green-100 to-green-200", textColor: "text-[rgb(var(--color-text-primary))]" },
    { id: "totalProfit", title: "Total Profit", value: "₹0.00", change: "+0.00% from last period", icon: DollarSign, iconColor: "from-blue-100 to-blue-200", textColor: "text-[rgb(var(--color-text-primary))]" },
    { id: "profitMargin", title: "Profit Margin", value: "0.00%", change: "Overall margin", icon: TrendingUp, iconColor: "from-purple-100 to-purple-200", textColor: "text-[rgb(var(--color-text-primary))]" },
    { id: "todayRevenue", title: "Today's Revenue", value: "₹0.00", change: "0 sales", icon: Calendar, iconColor: "from-orange-100 to-orange-200", textColor: "text-[rgb(var(--color-text-primary))]" },
  ]);

  useEffect(() => {
    if (analytics && summary && change && today) {
      setMetrics(prev => prev.map(m => {
        if (m.id === "totalRevenue") return { ...m, value: formatCurrency(summary.totalRevenue), change: `${change.changeType?.revenue === "up" ? "+" : "-"}${formatPercent(change.revenue)} from last period` };
        if (m.id === "totalProfit") return { ...m, value: formatCurrency(summary.totalProfit), change: `${change.changeType?.profit === "up" ? "+" : "-"}${formatPercent(change.profit)} from last period` };
        if (m.id === "profitMargin") return { ...m, value: formatPercent(summary.profitMargin) };
        if (m.id === "todayRevenue") return { ...m, value: formatCurrency(today.revenue), change: `${formatNumber(today.sales)} sales` };
        return m;
      }));
    }
  }, [analytics, summary, change, today]);

  const [cards, setCards] = useState([
    { id: "chart1", type: "chart", title: "Revenue Trend" },
    { id: "chart2", type: "chart", title: "Revenue by Source" },
    { id: "breakdown", type: "breakdown", title: "Revenue Breakdown" },
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

  return (
    <>
      <div id="revenue-report-area" className="absolute -left-[9999px] -top-[9999px] w-[850px]">
        {analytics && (
          <RevenueReportTemplate
            analyticsData={analytics}
            selectedStore={selectedStore}
            hideGst={!selectedStore?.gst}
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
                                <RevenueChart type={card.id === "chart1" ? "area" : "line"} />
                              </div>
                            </div>
                          </Card>
                        )}
                        {card.type === "breakdown" && (
                          <Card>
                            <div className="p-6">
                              <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-4">{card.title}</h3>
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 text-center">
                                    <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">Today Revenue</p>
                                    <p className="text-lg font-semibold text-green-600 dark:text-green-400">{formatCurrency(today.revenue)}</p>
                                    <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-1">{formatNumber(today.sales)} sales</p>
                                  </div>
                                  <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 text-center">
                                    <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">Today Profit</p>
                                    <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">{formatCurrency(today.profit)}</p>
                                  </div>
                                  <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 text-center">
                                    <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">Total Revenue</p>
                                    <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">{formatCurrency(summary.totalRevenue)}</p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 text-center">
                                    <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">Total Profit</p>
                                    <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">{formatCurrency(summary.totalProfit)}</p>
                                  </div>
                                  <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 text-center">
                                    <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">Total Discount</p>
                                    <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">{formatCurrency(summary.totalDiscount)}</p>
                                  </div>
                                  <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 text-center">
                                    <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">Total GST</p>
                                    <p className="text-lg font-semibold text-teal-600 dark:text-teal-400">{formatCurrency(summary.totalGst)}</p>
                                  </div>
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
                  handleDownloadXLSX(analytics, selectedStore);
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

export default RevenueAnalytics;
