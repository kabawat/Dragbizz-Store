"use client";
import { GstAnalyticsScreen } from "@dragorbit/features/analytics";

import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { IndianRupee, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import GstExportDrawer from "@/components/analytics/gst/GstExportDrawer";
import GstHealthScoreWidget from "@/components/analytics/gst/GstHealthScoreWidget";
import GstMismatchList from "@/components/analytics/gst/GstMismatchList";
import TallyExportDrawer from "@/components/analytics/tally/TallyExportDrawer";
import GstGuard from "@/components/auth/GstGuard";
import {
  SortableCard,
  SortableMetricCard,
} from "@/components/templates/analytics/SortableComponents";

import { useGlobalToast } from "@/contexts/ToastContext";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useApiResponse } from "@/hooks/useApiResponse";
import { gstService, tallyService } from "@/service/retailer";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getGstHealthScore,
  getGstMismatches,
  getGstSummary,
} from "@/store/slices/gstSlice";

const formatCurrency = (amount) =>
  `₹${(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const GstAnalyticsContent = () => {
  const { t } = useTranslation();

  useDashboardHeader(
    t("gst.gstAnalytics") || "GST Analytics",
    t("gst.gstAnalyticsDesc") ||
      "GST summary, mismatches, and export for CA filing",
  );
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { showError } = useGlobalToast();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const {
    summary,
    mismatches,
    healthScore,
    isLoading,
    isLoadingMismatches,
    isLoadingHealthScore,
  } = useAppSelector((state) => state.gst);

  const [period, setPeriod] = useState({
    month: String(new Date().getMonth() + 1),
    quarter: "",
    year: new Date().getFullYear(),
  });
  const [showExportDrawer, setShowExportDrawer] = useState(false);
  const [showTallyExportDrawer, setShowTallyExportDrawer] = useState(false);
  const lastFetchedParamsRef = useRef(null);

  const [metrics, setMetrics] = useState([
    {
      id: "netGst",
      titleKey: "gst.netGst",
      icon: TrendingUp,
      iconColor: "from-amber-100 to-amber-200",
    },
    {
      id: "totalGst",
      titleKey: "gst.totalGst",
      subtextKey: "invoices",
      icon: IndianRupee,
      iconColor: "from-green-100 to-green-200",
    },
    {
      id: "totalItc",
      titleKey: "gst.totalItc",
      subtextKey: "bills",
      icon: IndianRupee,
      iconColor: "from-blue-100 to-blue-200",
    },
    {
      id: "taxableValue",
      titleKey: "gst.taxableValue",
      icon: IndianRupee,
      iconColor: "from-teal-100 to-teal-200",
    },
  ]);

  const [cards, setCards] = useState([
    {
      id: "outwardSupplies",
      title: "Outward Supplies (Sales)",
      type: "breakdown",
    },
    {
      id: "inwardSupplies",
      title: "Inward Supplies (Purchases)",
      type: "breakdown",
    },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleMetricsDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
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

  const storeId =
    selectedStore?._id || selectedStore?.id || selectedStore?.storeId;

  useEffect(() => {
    if (!storeId) return;

    // Prevent duplicate calls with the same parameters
    const currentParams = {
      storeId,
      month: period.month,
      quarter: period.quarter,
      year: period.year,
    };
    const paramsKey = JSON.stringify(currentParams);
    if (lastFetchedParamsRef.current === paramsKey) return;
    lastFetchedParamsRef.current = paramsKey;

    const params = {};
    if (period.month) params.month = period.month;
    if (period.quarter) params.quarter = period.quarter;
    if (period.year) params.year = period.year;

    dispatch(getGstSummary({ storeId, params }));
    dispatch(getGstMismatches({ storeId, params: { limit: 20 } }));
    dispatch(getGstHealthScore({ storeId, params: { year: period.year } }));
  }, [dispatch, storeId, period.month, period.quarter, period.year]);

  const { execute: executeExport } = useApiResponse();

  const handleExport = async (exportPeriod) => {
    return await executeExport(gstService.getGstExport(storeId, exportPeriod), {
      showToast: false,
    });
  };

  const handleTallyExport = async (params) => {
    return await executeExport(tallyService.getTallyExport(storeId, params), {
      showToast: false,
    });
  };

  const openTallyExport = () => {
    if (!selectedStore?.tallyIntegration?.enabled) {
      showError(t("integrations.enableFirst"));
      router.push("/dashboard/integrations/tally");
      return;
    }
    setShowTallyExportDrawer(true);
  };

  const { execute: executeSync, loading: isSyncing } = useApiResponse();

  const handleSync = async () => {
    if (!storeId || !period.year || !period.month) return;
    const params = { year: period.year, month: period.month };

    const result = await executeSync(gstService.syncGstStats(storeId, params));

    if (result?.success) {
      // Re-fetch data upon successful sync
      dispatch(getGstSummary({ storeId, params }));
      dispatch(getGstHealthScore({ storeId, params: { year: period.year } }));
      dispatch(getGstMismatches({ storeId, params: { limit: 20 } }));
    }
  };

  const outward = summary?.outward ?? {};
  const inward = summary?.inward ?? {};
  const netPosition = summary?.summary ?? {};

  const StatRow = ({
    label,
    value,
    color = "text-[rgb(var(--color-text-primary))]",
    icon: Icon,
  }) => (
    <div className="flex items-center justify-between py-2 border-b border-[var(--color-border-primary-light)] last:border-0 px-1 hover:bg-[rgb(var(--color-bg-secondary))]/50 transition-colors">
      <div className="flex items-center gap-2">
        {Icon && (
          <Icon className="w-3.5 h-3.5 text-[rgb(var(--color-text-tertiary))]" />
        )}
        <span className="text-sm text-[rgb(var(--color-text-secondary))]">
          {label}
        </span>
      </div>
      <span className={`text-sm font-bold ${color}`}>{value}</span>
    </div>
  );

  return (
    <GstAnalyticsScreen
      model={{
        period,
        setPeriod,
        handleSync,
        isSyncing,
        openTallyExport,
        t,
        setShowExportDrawer,
        isLoading,
        sensors,
        handleMetricsDragEnd,
        metrics,
        formatCurrency,
        netPosition,
        outward,
        inward,
        SortableMetricCard,
        handleCardsDragEnd,
        cards,
        SortableCard,
        StatRow,
        GstHealthScoreWidget,
        healthScore,
        isLoadingHealthScore,
        GstMismatchList,
        mismatches,
        isLoadingMismatches,
        GstExportDrawer,
        showExportDrawer,
        handleExport,
        TallyExportDrawer,
        showTallyExportDrawer,
        setShowTallyExportDrawer,
        handleTallyExport,
      }}
    />
  );
};

const GstAnalytics = () => {
  return (
    <GstGuard>
      <GstAnalyticsContent />
    </GstGuard>
  );
};

export default GstAnalytics;
