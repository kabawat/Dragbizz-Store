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
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";
import { SortableCard, SortableMetricCard } from "@/components/templates/analytics/SortableComponents";
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
  syncGstStats,
} from "@/store/slices/gstSlice";
import { gstService } from "@/service/retailer";
import GstGuard from "@/components/auth/GstGuard";

const formatCurrency = (amount) =>
  `₹${(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const GstAnalyticsContent = () => {
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
    isSyncing,
  } = useAppSelector((state) => state.gst);

  const [period, setPeriod] = useState({
    month: String(new Date().getMonth() + 1),
    quarter: "",
    year: new Date().getFullYear(),
  });
  const [showExportDrawer, setShowExportDrawer] = useState(false);
  const lastFetchedParamsRef = useRef(null);

  const [metrics, setMetrics] = useState([
    { id: "netGst", titleKey: "gst.netGst", icon: TrendingUp, iconColor: "from-amber-100 to-amber-200" },
    { id: "totalGst", titleKey: "gst.totalGst", subtextKey: "invoices", icon: IndianRupee, iconColor: "from-green-100 to-green-200" },
    { id: "totalItc", titleKey: "gst.totalItc", subtextKey: "bills", icon: IndianRupee, iconColor: "from-blue-100 to-blue-200" },
    { id: "taxableValue", titleKey: "gst.taxableValue", icon: IndianRupee, iconColor: "from-teal-100 to-teal-200" },
  ]);

  const [cards, setCards] = useState([
    { id: "outwardSupplies", title: "Outward Supplies (Sales)", type: "breakdown" },
    { id: "inwardSupplies", title: "Inward Supplies (Purchases)", type: "breakdown" },
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

  const handleExport = async (exportPeriod) => {
    const result = await gstService.getGstExport(storeId, exportPeriod);
    return result;
  };

  const handleSync = () => {
    if (!storeId || !period.year || !period.month) return;
    dispatch(syncGstStats({
      storeId,
      params: { year: period.year, month: period.month }
    }));
  };

  const outward = summary?.outward ?? {};
  const inward = summary?.inward ?? {};
  const netPosition = summary?.summary ?? {};

  const StatRow = ({ label, value, color = "text-[rgb(var(--color-text-primary))]", icon: Icon }) => (
    <div className="flex items-center justify-between py-2 border-b border-[var(--color-border-primary-light)] last:border-0 px-1 hover:bg-[rgb(var(--color-bg-secondary))]/50 transition-colors">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-3.5 h-3.5 text-[rgb(var(--color-text-tertiary))]" />}
        <span className="text-sm text-[rgb(var(--color-text-secondary))]">{label}</span>
      </div>
      <span className={`text-sm font-bold ${color}`}>{value}</span>
    </div>
  );

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
                  options={[2023, 2024, 2025, 2026].map(y => ({ label: String(y), value: String(y) }))}
                  value={String(period.year)}
                  onChange={(val) => setPeriod(p => ({ ...p, year: parseInt(val) }))}
                  placeholder="Year"
                  clearable={false}
                />
              </div>
              <div className="w-40">
                <Select
                  options={[
                    { label: "All months", value: "" },
                    ...Array.from({ length: 12 }, (_, i) => ({
                      label: new Date(2000, i).toLocaleString("default", { month: "long" }),
                      value: String(i + 1),
                    })),
                  ]}
                  value={period.month}
                  onChange={(val) => setPeriod(p => ({ ...p, month: val }))}
                  placeholder="Month"
                  clearable={false}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {period.month && (
                <Button variant="secondary" onClick={handleSync} size="sm" isLoading={isSyncing}>
                  <RefreshCw className={`w-3.5 h-3.5 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
                  Sync Data
                </Button>
              )}
              <Button variant="primary" leftIcon={Download} onClick={() => setShowExportDrawer(true)} size="sm">
                {t("gst.exportForCA") || "Export for CA"}
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-sm text-[rgb(var(--color-text-tertiary))]">Loading analytics data...</p>
            </div>
          ) : (
            <>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleMetricsDragEnd}>
                <SortableContext items={metrics.map(m => m.id)} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {metrics.map((metric) => {
                      const valueMap = {
                        netGst: formatCurrency(Math.abs(netPosition.totalGst)),
                        totalGst: formatCurrency(Math.abs(outward.totalGst)),
                        totalItc: formatCurrency(Math.abs(inward.totalItc)),
                        taxableValue: formatCurrency(Math.abs(outward.taxableAmount)),
                      };
                      const subtextMap = {
                        netGst: (netPosition.totalGst || 0) < 0 ? "Tax Credit Available" : "Tax Payable",
                        totalGst: `${outward.invoiceCount ?? 0} invoices`,
                        totalItc: `${inward.billCount ?? 0} bills`,
                        taxableValue: "Total Sales Base"
                      };
                      return (
                        <SortableMetricCard
                          key={metric.id}
                          id={metric.id}
                          title={t(metric.titleKey) || metric.titleKey}
                          value={valueMap[metric.id]}
                          subtext={subtextMap[metric.id]}
                          icon={metric.icon}
                          iconColor={metric.iconColor}
                        />
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>

              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCardsDragEnd}>
                <SortableContext items={cards.map(c => c.id)} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
                    {cards.map((card) => (
                      <SortableCard key={card.id} id={card.id}>
                        {card.id === "outwardSupplies" && (
                          <Card className="border-[var(--color-border-primary-light)] overflow-hidden bg-[rgb(var(--color-bg-primary))]">
                            <div className="p-0">
                              <div className="p-4 bg-[rgb(var(--color-bg-secondary))]/30 border-b border-[var(--color-border-primary-light)] flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400">
                                    <TrendingUp className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <h3 className="text-sm font-bold text-[rgb(var(--color-text-primary))]">{card.title}</h3>
                                    <p className="text-[10px] text-[rgb(var(--color-text-tertiary))] uppercase tracking-wider font-semibold">GSTR-1 Section</p>
                                  </div>
                                </div>
                                <span className="text-[10px] font-bold px-2 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-md border border-green-500/20">Invoices ({outward.invoiceCount || 0})</span>
                              </div>
                              <div className="p-5 space-y-1">
                                <StatRow label="Gross Taxable Value" value={formatCurrency(outward.taxableAmount)} icon={Receipt} />
                                <div className="grid grid-cols-2 gap-3 py-3">
                                  <div className="p-3 bg-[rgb(var(--color-bg-secondary))]/40 rounded-xl border border-[var(--color-border-primary-light)]">
                                    <p className="text-[10px] text-[rgb(var(--color-text-tertiary))] uppercase font-bold mb-1">B2B Sales</p>
                                    <p className="text-sm font-bold text-[rgb(var(--color-text-primary))]">{formatCurrency(outward.b2bTaxable)}</p>
                                  </div>
                                  <div className="p-3 bg-[rgb(var(--color-bg-secondary))]/40 rounded-xl border border-[var(--color-border-primary-light)]">
                                    <p className="text-[10px] text-[rgb(var(--color-text-tertiary))] uppercase font-bold mb-1">B2C Sales</p>
                                    <p className="text-sm font-bold text-[rgb(var(--color-text-primary))]">{formatCurrency(outward.b2cTaxable)}</p>
                                  </div>
                                </div>
                                <div className="pt-2 space-y-1">
                                  <p className="text-[10px] font-bold text-[rgb(var(--color-text-tertiary))] uppercase mb-2 tracking-wide">GST Distribution</p>
                                  <StatRow label="CGST" value={formatCurrency(outward.cgst)} color="text-green-600 dark:text-green-400" />
                                  <StatRow label="SGST" value={formatCurrency(outward.sgst)} color="text-green-600 dark:text-green-400" />
                                  <StatRow label="IGST" value={formatCurrency(outward.igst)} color="text-green-600 dark:text-green-400" />
                                </div>
                              </div>
                              <div className="p-4 bg-[rgb(var(--color-primary))]/5 border-t border-[var(--color-border-primary-light)] flex justify-between items-center group hover:bg-[rgb(var(--color-primary))]/10 transition-colors cursor-default">
                                <span className="text-sm font-bold text-[rgb(var(--color-text-secondary))]">Total Output Tax</span>
                                <span className="text-lg font-black text-green-600 dark:text-green-400 tabular-nums">{formatCurrency(outward.totalGst)}</span>
                              </div>
                            </div>
                          </Card>
                        )}
                        {card.id === "inwardSupplies" && (
                          <Card className="border-[var(--color-border-primary-light)] overflow-hidden bg-[rgb(var(--color-bg-primary))]">
                            <div className="p-0">
                              <div className="p-4 bg-[rgb(var(--color-bg-secondary))]/30 border-b border-[var(--color-border-primary-light)] flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                    <IndianRupee className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <h3 className="text-sm font-bold text-[rgb(var(--color-text-primary))]">{card.title}</h3>
                                    <p className="text-[10px] text-[rgb(var(--color-text-tertiary))] uppercase tracking-wider font-semibold">GSTR-2B Section</p>
                                  </div>
                                </div>
                                <span className="text-[10px] font-bold px-2 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md border border-blue-500/20">Bills ({inward.billCount || 0})</span>
                              </div>
                              <div className="p-5 space-y-1">
                                <StatRow label="Total Purchase Value" value={formatCurrency(inward.taxableAmount)} icon={Receipt} />
                                <div className="grid grid-cols-2 gap-3 py-3">
                                  <div className="p-3 bg-[rgb(var(--color-bg-secondary))]/40 rounded-xl border border-[var(--color-border-primary-light)]">
                                    <p className="text-[10px] text-[rgb(var(--color-text-tertiary))] uppercase font-bold mb-1">ITC Eligible</p>
                                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{formatCurrency(inward.b2bTaxable)}</p>
                                  </div>
                                  <div className="p-3 bg-[rgb(var(--color-bg-secondary))]/40 rounded-xl border border-[var(--color-border-primary-light)]">
                                    <p className="text-[10px] text-[rgb(var(--color-text-tertiary))] uppercase font-bold mb-1">Non-ITC Purchase</p>
                                    <p className="text-sm font-bold text-[rgb(var(--color-text-primary))]">{formatCurrency(inward.b2cTaxable)}</p>
                                  </div>
                                </div>
                                <div className="pt-2 space-y-1">
                                  <p className="text-[10px] font-bold text-[rgb(var(--color-text-tertiary))] uppercase mb-2 tracking-wide">ITC Breakdown</p>
                                  <StatRow label="Input CGST" value={formatCurrency(inward.cgst)} color="text-blue-600 dark:text-blue-400" />
                                  <StatRow label="Input SGST" value={formatCurrency(inward.sgst)} color="text-blue-600 dark:text-blue-400" />
                                  <StatRow label="Input IGST" value={formatCurrency(inward.igst)} color="text-blue-600 dark:text-blue-400" />
                                </div>
                              </div>
                              <div className="p-4 bg-[rgb(var(--color-primary))]/5 border-t border-[var(--color-border-primary-light)] flex justify-between items-center group hover:bg-[rgb(var(--color-primary))]/10 transition-colors cursor-default">
                                <span className="text-sm font-bold text-[rgb(var(--color-text-secondary))]">Net Available ITC</span>
                                <span className="text-lg font-black text-blue-600 dark:text-blue-400 tabular-nums">{formatCurrency(inward.totalItc)}</span>
                              </div>
                            </div>
                          </Card>
                        )}
                      </SortableCard>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pb-10">
                <div className="lg:col-span-1">
                  <GstHealthScoreWidget healthScore={healthScore} isLoading={isLoadingHealthScore} />
                </div>
                <div className="lg:col-span-3">
                  <GstMismatchList mismatches={mismatches?.mismatches ?? []} isLoading={isLoadingMismatches} />
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

const GstAnalytics = () => {
  return (
    <GstGuard>
      <GstAnalyticsContent />
    </GstGuard>
  );
};

export default GstAnalytics;
