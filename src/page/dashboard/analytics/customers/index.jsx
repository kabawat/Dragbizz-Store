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
  Download,
  FileSpreadsheet,
  FileText,
  UserPlus,
  Users,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import CustomersChart from "@/components/analytics/customers/CustomersChart";
import CustomersReportTemplate from "@/components/templates/analytics/customers/CustomersReportTemplate";
import { SortableCard, SortableMetricCard } from "@/components/templates/analytics/SortableComponents";
import { Button, Card } from "@/components/ui";
import { useAnalyticsReportPrint } from "@/hooks/print/useAnalyticsReportPrint";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getCustomerAnalytics } from "@/store/slices/customers/analyticsSlice";

const formatNumber = (num) => (num || 0).toLocaleString("en-IN");

const CustomerAnalytics = () => {
  const { t } = useTranslation();
  useDashboardHeader(t("dashboard.customerAnalytics") || "Customer Analytics", "View detailed customer analytics and insights");

  const dispatch = useAppDispatch();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const { analytics, isLoading } = useAppSelector((state) => state.customerAnalytics);

  const storeId = selectedStore?.storeId || selectedStore?.id || selectedStore?._id;
  const fetchedStoreId = useRef(null);

  useEffect(() => {
    if (storeId && fetchedStoreId.current !== storeId) {
      fetchedStoreId.current = storeId;
      dispatch(getCustomerAnalytics(storeId));
    }
  }, [storeId, dispatch]);

  const newCustomers = useMemo(() => analytics?.newCustomers || {
    last1Day: 0,
    last7Days: 0,
    last15Days: 0,
    last30Days: 0,
    last3Months: 0,
    last6Months: 0,
    last12Months: 0,
  }, [analytics?.newCustomers]);

  const { handleDownloadPDF, handleDownloadXLSX } = useAnalyticsReportPrint(
    isLoading,
    analytics,
    "customers-report-area",
    "customers-analytics-report"
  );

  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef(null);

  const [metrics, setMetrics] = useState([
    { id: "totalCustomers", title: "Total Customers", value: "0", change: "0 today", icon: Users, iconColor: "from-orange-100 to-orange-200", textColor: "text-[rgb(var(--color-text-primary))]" },
    { id: "todayCustomers", title: "Today's Customers", value: "0", change: "New today", icon: Calendar, iconColor: "from-blue-100 to-blue-200", textColor: "text-[rgb(var(--color-text-primary))]" },
    { id: "last7Days", title: "Last 7 Days", value: "0", change: "New customers", icon: UserPlus, iconColor: "from-green-100 to-green-200", textColor: "text-[rgb(var(--color-text-primary))]" },
    { id: "last30Days", title: "Last 30 Days", value: "0", change: "New customers", icon: UserPlus, iconColor: "from-purple-100 to-purple-200", textColor: "text-[rgb(var(--color-text-primary))]" },
  ]);

  useEffect(() => {
    if (analytics) {
      setMetrics(prev => prev.map(m => {
        if (m.id === "totalCustomers") return { ...m, value: formatNumber(analytics.totalCustomers || 0), change: `${formatNumber(analytics.todayCustomers || 0)} today` };
        if (m.id === "todayCustomers") return { ...m, value: formatNumber(analytics.todayCustomers || 0) };
        if (m.id === "last7Days") return { ...m, value: formatNumber(newCustomers.last7Days) };
        if (m.id === "last30Days") return { ...m, value: formatNumber(newCustomers.last30Days) };
        return m;
      }));
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
      return () => document.removeEventListener("mousedown", handleClickOutside);
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

  return (
    <>
      <div id="customers-report-area" className="absolute -left-[9999px] -top-[9999px] w-[850px]" >
        {analytics && (
          <CustomersReportTemplate
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
                                <CustomersChart type={card.id === "chart1" ? "area" : "line"} />
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
                                  <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">Last 7 Days</p>
                                  <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">{formatNumber(newCustomers.last7Days)}</p>
                                </div>
                                <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 border-[var(--color-border-primary-light)] text-center">
                                  <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">Last 30 Days</p>
                                  <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">{formatNumber(newCustomers.last30Days)}</p>
                                </div>
                                <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 border-[var(--color-border-primary-light)] text-center">
                                  <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">Last 3 Months</p>
                                  <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">{formatNumber(newCustomers.last3Months)}</p>
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
                  handleDownloadXLSX(analytics, selectedStore, "customers-analytics-report", getCustomersXLSXConfig());
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

export default CustomerAnalytics;
