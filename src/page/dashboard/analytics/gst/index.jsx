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
import { useEffect, useRef, useState } from "react";
import {
  Download,
  IndianRupee,
  Receipt,
  TrendingUp,
} from "lucide-react";
import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";
import { SortableMetricCard } from "@/components/templates/analytics/SortableComponents";
import GstMismatchList from "@/components/analytics/gst/GstMismatchList";
import GstHealthScoreWidget from "@/components/analytics/gst/GstHealthScoreWidget";
import GstExportDrawer from "@/components/analytics/gst/GstExportDrawer";
import { Button, Card, Select } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getGstSummary,
  getGstMismatches,
  getGstExport,
  getGstHealthScore,
} from "@/store/slices/gstSlice";
import { gstService } from "@/service/retailer";

const formatCurrency = (amount) =>
  `₹${(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const GstAnalytics = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
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
    month: "",
    quarter: "",
    year: new Date().getFullYear(),
  });
  const [showExportDrawer, setShowExportDrawer] = useState(false);
  const hasFetchedRef = useRef({ storeId: null, fetched: false });

  const [metrics, setMetrics] = useState([
    { id: "totalGst", titleKey: "gst.totalGst", subtextKey: "invoices", icon: IndianRupee, iconColor: "from-green-100 to-green-200" },
    { id: "cgst", titleKey: "gst.cgst", icon: Receipt, iconColor: "from-blue-100 to-blue-200" },
    { id: "sgst", titleKey: "gst.sgst", icon: Receipt, iconColor: "from-purple-100 to-purple-200" },
    { id: "igst", titleKey: "gst.igst", icon: TrendingUp, iconColor: "from-amber-100 to-amber-200" },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
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

  const storeId =
    selectedStore?._id || selectedStore?.id || selectedStore?.storeId;

  useEffect(() => {
    if (!storeId) return;
    hasFetchedRef.current = { storeId, fetched: true };
    const params = {};
    if (period.month) params.month = period.month;
    if (period.quarter) params.quarter = period.quarter;
    if (period.year) params.year = period.year;

    dispatch(getGstSummary({ storeId, params }));
    dispatch(getGstMismatches({ storeId, params: { limit: 20 } }));
    dispatch(getGstHealthScore({ storeId, params: { year: period.year } }));
  }, [dispatch, storeId, period.month, period.quarter, period.year]);

  useEffect(() => {
    if (storeId && hasFetchedRef.current.storeId !== storeId) {
      hasFetchedRef.current = { storeId: null, fetched: false };
    }
  }, [storeId]);

  const handleExport = async (exportPeriod) => {
    const params = { store: storeId, ...exportPeriod };
    const result = await gstService.getGstExport(storeId, exportPeriod);
    return result;
  };

  const outward = summary?.outward ?? {};
  const inward = summary?.inward ?? {};

  const yearOptions = [2023, 2024, 2025, 2026].map((y) => ({
    label: String(y),
    value: String(y),
  }));
  const monthOptions = [
    { label: "All months", value: "" },
    ...Array.from({ length: 12 }, (_, i) => ({
      label: new Date(2000, i).toLocaleString("default", { month: "long" }),
      value: String(i + 1),
    })),
  ];
  const quarterOptions = [
    { label: "All quarters", value: "" },
    { label: "Q1", value: "1" },
    { label: "Q2", value: "2" },
    { label: "Q3", value: "3" },
    { label: "Q4", value: "4" },
  ];

  return (
    <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative">
      <Sidebar />
      <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
        <Header
          title={t("gst.gstAnalytics") || "GST Analytics"}
          description={t("gst.gstAnalyticsDesc") || "GST summary, mismatches, and export for CA filing"}
        />

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-2">
              <div className="w-24">
                <Select
                  options={yearOptions}
                  value={String(period.year)}
                  onChange={(val) =>
                    setPeriod((p) => ({
                      ...p,
                      year: parseInt(val, 10) || new Date().getFullYear(),
                    }))
                  }
                  placeholder="Year"
                  clearable={false}
                />
              </div>
              <div className="w-36">
                <Select
                  options={monthOptions}
                  value={period.month}
                  onChange={(val) => setPeriod((p) => ({ ...p, month: val }))}
                  placeholder="Month"
                  clearable={false}
                />
              </div>
              <div className="w-28">
                <Select
                  options={quarterOptions}
                  value={period.quarter}
                  onChange={(val) => setPeriod((p) => ({ ...p, quarter: val }))}
                  placeholder="Quarter"
                  clearable={false}
                />
              </div>
            </div>
            <Button
              variant="primary"
              leftIcon={Download}
              onClick={() => setShowExportDrawer(true)}
              size="sm"
            >
              {t("gst.exportForCA") || "Export for CA"}
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center h-64 items-center">
              <p className="text-sm text-[rgb(var(--color-text-tertiary))]">
                {t("common.loadingData") || "Loading GST data..."}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 items-stretch">
                    {metrics.map((metric) => {
                      const valueMap = {
                        totalGst: formatCurrency(outward.totalGst),
                        cgst: formatCurrency(outward.cgst),
                        sgst: formatCurrency(outward.sgst),
                        igst: formatCurrency(outward.igst),
                      };
                      const subtextMap = {
                        totalGst: `${outward.invoiceCount ?? 0} invoices`,
                      };
                      return (
                        <SortableMetricCard
                          key={metric.id}
                          id={metric.id}
                          title={t(metric.titleKey) || metric.titleKey}
                          value={valueMap[metric.id] ?? "₹0.00"}
                          subtext={subtextMap[metric.id]}
                          icon={metric.icon}
                          iconColor={metric.iconColor}
                        />
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>

              {/* Left: 1 card width (Health Score + Taxable Value) | Right: 3 cards width (Mismatches) - matches top row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="md:col-span-1 flex flex-col gap-4">
                  <GstHealthScoreWidget
                    healthScore={healthScore}
                    isLoading={isLoadingHealthScore}
                  />
                  <Card className="backdrop-blur-md border-[var(--color-border-primary-light)] transition-all duration-300 relative overflow-hidden" style={{ background: "var(--gradient-teal)" }}>
                    <div className="absolute right-0 top-0 bottom-0 flex items-center justify-end pr-3 opacity-10">
                      <IndianRupee className="w-13 h-13 text-[rgb(var(--color-text-primary))]" />
                    </div>
                    <div className="relative z-10 p-4">
                      <p className="text-[rgb(var(--color-text-secondary))] text-xs font-medium truncate uppercase tracking-wide">
                        {t("gst.taxableValue") || "Taxable Value (Outward)"}
                      </p>
                      <p className="text-[rgb(var(--color-text-primary))] text-xl font-bold mt-1">
                        {formatCurrency(outward.taxableAmount)}
                      </p>
                    </div>
                  </Card>
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <GstMismatchList
                    mismatches={mismatches?.mismatches ?? []}
                    isLoading={isLoadingMismatches}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <GstExportDrawer
        isOpen={showExportDrawer}
        onClose={() => setShowExportDrawer(false)}
        onExport={handleExport}
        isLoading={isLoading}
      />
    </div>
  );
};

export default GstAnalytics;
