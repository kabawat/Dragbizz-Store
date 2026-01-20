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
  Building2,
  CheckCircle,
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";
import {
  SortableCard,
  SortableMetricCard,
} from "@/components/templates/analytics/SortableComponents";
import SuppliersReportTemplate from "@/components/templates/analytics/suppliers/SuppliersReportTemplate";
import { Button, Card } from "@/components/ui";
import { useAnalyticsReportPrint } from "@/hooks/useAnalyticsReportPrint";
import { useTranslation } from "@/hooks/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getSupplierAnalytics } from "@/store/slices/suppliersSlice";

const SupplierAnalytics = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const { analytics, isLoading } = useAppSelector((state) => state.suppliers);
  const hasFetchedRef = useRef({ storeId: null, fetched: false });

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
    [analytics?.totals]
  );

  const formatNumber = (num) => (num || 0).toLocaleString("en-IN");

  const { handleDownloadPDF, handleDownloadXLSX } = useAnalyticsReportPrint(
    isLoading,
    analytics,
    "suppliers-report-area",
    "suppliers-analytics-report"
  );
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef(null);

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
  }, [analytics, totals, formatNumber]);

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

  return (
    <>
      <style jsx global>{`
        @media print {
          .no-print,
          nav,
          header,
          .sidebar,
          .header,
          button,
          .btn,
          .action-buttons {
            display: none !important;
          }
          
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          
          @page {
            margin: 1cm;
            size: A4;
          }
        }
      `}</style>

      <div
        id="suppliers-report-area"
        style={{
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
          width: "850px",
        }}
      >
        {analytics && (
          <SuppliersReportTemplate
            analyticsData={analytics}
            selectedStore={selectedStore}
          />
        )}
      </div>

      <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative">
        <Sidebar />

        <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
          <Header
            title={t("dashboard.supplierAnalytics") || "Supplier Analytics"}
            description="View detailed supplier analytics and insights"
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
                                <div className="h-64 bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg flex items-center justify-center border-[var(--color-border-primary-light)]">
                                  <p className="text-sm text-[rgb(var(--color-text-tertiary))]">
                                    Chart will be displayed here
                                  </p>
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
                                      Total Suppliers
                                    </p>
                                    <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                      {formatNumber(totals.totalSuppliers)}
                                    </p>
                                  </div>
                                  <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 border-[var(--color-border-primary-light)] text-center">
                                    <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">
                                      Active Suppliers
                                    </p>
                                    <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                                      {formatNumber(totals.activeSuppliers)}
                                    </p>
                                  </div>
                                  <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 border-[var(--color-border-primary-light)] text-center">
                                    <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">
                                      Inactive Suppliers
                                    </p>
                                    <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                                      {formatNumber(totals.inactiveSuppliers)}
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

        <div
          className="no-print fixed bottom-6 right-6 z-50"
          ref={exportMenuRef}
        >
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
                      "suppliers-analytics-report",
                      getSuppliersXLSXConfig()
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
      </div>
    </>
  );
};

export default SupplierAnalytics;
