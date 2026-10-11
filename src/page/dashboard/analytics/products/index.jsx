"use client";
import { ProductAnalyticsScreen } from "@dragorbit/features/analytics";

import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { CheckCircle, Package, XCircle } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import ProductsChart from "@/components/analytics/products/ProductsChart";
import ProductsReportTemplate from "@/components/templates/analytics/products/ProductsReportTemplate";
import {
  SortableCard,
  SortableMetricCard,
} from "@/components/templates/analytics/SortableComponents";

import { useAnalyticsReportPrint } from "@/hooks/print/useAnalyticsReportPrint";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getProductAnalytics } from "@/store/slices/analyticsSlice";
import { normalizeProductAnalytics } from "@/utils/analytics/productAnalytics.util";

const formatNumber = (num) => (num || 0).toLocaleString("en-IN");

const ProductAnalytics = () => {
  const { t } = useTranslation();

  useDashboardHeader(
    t("dashboard.productAnalytics") || "Product Analytics",
    "View detailed product analytics and insights",
  );
  const dispatch = useAppDispatch();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;
  const { product: reduxAnalytics, isLoadingProduct: isLoading } =
    useAppSelector((state) => state.analytics);

  const analytics = useMemo(
    () => normalizeProductAnalytics(reduxAnalytics),
    [reduxAnalytics],
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
    "products-analytics-report",
  );
  const [showExportMenu, setShowExportMenu] = useState(false);
  const hasFetchedRef = React.useRef({ storeId: null, fetched: false });
  const exportMenuRef = React.useRef(null);

  const buildMetrics = useCallback(
    (totals) => [
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
    ],
    [],
  );

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
    <ProductAnalyticsScreen
      model={{
        analytics,
        ProductsReportTemplate,
        selectedStore,
        sensors,
        handleMetricsDragEnd,
        metrics,
        SortableMetricCard,
        handleCardsDragEnd,
        cards,
        SortableCard,
        ProductsChart,
        formatNumber,
        exportMenuRef,
        setShowExportMenu,
        showExportMenu,
        handleDownloadPDF,
        handleDownloadXLSX,
        getProductsXLSXConfig,
      }}
    />
  );
};

export default ProductAnalytics;
