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
  Package,
  XCircle,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ProductsChart from "@/components/analytics/products/ProductsChart";
import ProductsReportTemplate from "@/components/templates/analytics/products/ProductsReportTemplate";
import { SortableCard, SortableMetricCard, } from "@/components/templates/analytics/SortableComponents";
import { Button, Card } from "@/components/ui";
import { useAnalyticsReportPrint } from "@/hooks/print/useAnalyticsReportPrint";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getProductAnalytics } from "@/store/slices/analyticsSlice";
import { normalizeProductAnalytics } from "@/utils/analytics/productAnalytics.util";

const formatNumber = (num) => (num || 0).toLocaleString("en-IN");

const ProductAnalytics = () => {
  const { t } = useTranslation();

  useDashboardHeader(t("dashboard.productAnalytics") || "Product Analytics", "View detailed product analytics and insights");
  const dispatch = useAppDispatch();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;
  const { product: reduxAnalytics, isLoadingProduct: isLoading } = useAppSelector(
    (state) => state.analytics
  );

  const analytics = useMemo(
    () => normalizeProductAnalytics(reduxAnalytics),
    [reduxAnalytics]
  );

  // Fetch once per store
  useEffect(() => {
    if (storeId && !hasFetchedRef.current.fetched) {
      hasFetchedRef.current = { storeId, fetched: true };
      dispatch(getProductAnalytics(storeId));
    }
  }, [storeId, dispatch]);

  // Reset ref if store changes
  useEffect(() => {
    if (storeId && hasFetchedRef.current.storeId !== storeId) {
      hasFetchedRef.current = { storeId: null, fetched: false };
    }
  }, [storeId]);

  const { handleDownloadPDF, handleDownloadXLSX } = useAnalyticsReportPrint(
    false,
    analytics,
    "products-report-area",
    "products-analytics-report"
  );
  const [showExportMenu, setShowExportMenu] = useState(false);
  const hasFetchedRef = React.useRef({ storeId: null, fetched: false });
  const exportMenuRef = React.useRef(null);

  const buildMetrics = useCallback((totals) => [
    {
      id: "totalProducts",
      title: "Total Products",
      value: formatNumber(totals.totalProducts),
      change: `${formatNumber(totals.activeProducts)} active, ${formatNumber(totals.inactiveProducts)} inactive`,
      icon: Package,
      iconColor: "from-purple-100 to-purple-200",
      textColor: "text-[rgb(var(--color-text-primary))]",
    },
    {
      id: "activeProducts",
      title: "Active Products",
      value: formatNumber(totals.activeProducts),
      change: "Currently active",
      icon: CheckCircle,
      iconColor: "from-green-100 to-green-200",
      textColor: "text-[rgb(var(--color-text-primary))]",
    },
    {
      id: "inactiveProducts",
      title: "Inactive Products",
      value: formatNumber(totals.inactiveProducts),
      change: "Not active",
      icon: XCircle,
      iconColor: "from-gray-100 to-gray-200",
      textColor: "text-[rgb(var(--color-text-primary))]",
    },
    {
      id: "totalCount",
      title: "Total Count",
      value: formatNumber(totals.totalProducts),
      change: "All products",
      icon: Package,
      iconColor: "from-blue-100 to-blue-200",
      textColor: "text-[rgb(var(--color-text-primary))]",
    },
  ], []);

  const [metrics, setMetrics] = useState(() => buildMetrics(analytics.totals));

  const [cards, setCards] = useState([
    { id: "chart1", type: "chart", title: "Products by Category" },
    { id: "chart2", type: "chart", title: "Top Selling Products" },
    { id: "breakdown", type: "breakdown", title: "Product Statistics" },
  ]);

  useEffect(() => {
    setMetrics(buildMetrics(analytics.totals));
  }, [analytics.totals, buildMetrics]);

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

  const getProductsXLSXConfig = () => {
    return {
      title: "PRODUCTS ANALYTICS REPORT",
      columns: 2,
      sections: [
        {
          title: "SUMMARY",
          headers: ["Metric", "Value"],
          columns: 2,
          data: [
            ["Total Products", formatNumber(analytics.totals.totalProducts)],
            ["Active Products", formatNumber(analytics.totals.activeProducts)],
            [
              "Inactive Products",
              formatNumber(analytics.totals.inactiveProducts),
            ],
            ["Total Count", formatNumber(analytics.totals.totalProducts)],
          ],
        },
        {
          title: "PRODUCTS BREAKDOWN",
          headers: ["Category", "Count"],
          columns: 2,
          data: [
            ["Total Products", formatNumber(analytics.totals.totalProducts)],
            ["Active Products", formatNumber(analytics.totals.activeProducts)],
            [
              "Inactive Products",
              formatNumber(analytics.totals.inactiveProducts),
            ],
          ],
        },
      ],
    };
  };

  return (
    <>
      <div id="products-report-area" className="absolute -left-[9999px] -top-[9999px] w-[850px]" >
        {analytics && (
          <ProductsReportTemplate
            analyticsData={analytics}
            selectedStore={selectedStore}
          />
        )}
      </div>

      <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative">
        <div className="flex-1 p-6 overflow-y-auto">
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
                            <ProductsChart type={card.id === "chart1" ? "bar" : "area"} />
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
                                Total Products
                              </p>
                              <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                {formatNumber(analytics.totals.totalProducts)}
                              </p>
                            </div>
                            <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 border-[var(--color-border-primary-light)] text-center">
                              <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">
                                Active Products
                              </p>
                              <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                                {formatNumber(
                                  analytics.totals.activeProducts
                                )}
                              </p>
                            </div>
                            <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 border-[var(--color-border-primary-light)] text-center">
                              <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">
                                Inactive Products
                              </p>
                              <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                                {formatNumber(
                                  analytics.totals.inactiveProducts
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
        </div>
      </div>

      <div className="no-print fixed bottom-6 right-6 z-50" ref={exportMenuRef} >
        <div className="relative">
          <Button
            variant="primary"
            leftIcon={Download}
            rightIcon={ChevronDown}
            onClick={() => setShowExportMenu(!showExportMenu)}
            disabled={!analytics}
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
                    "products-analytics-report",
                    getProductsXLSXConfig()
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

export default ProductAnalytics;
