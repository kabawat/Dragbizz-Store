"use client";
import {
  closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, } from "@dnd-kit/core";
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
import { SortableCard, SortableMetricCard } from "@/components/templates/analytics/SortableComponents";
import GstMismatchList from "@/components/analytics/gst/GstMismatchList";
import GstHealthScoreWidget from "@/components/analytics/gst/GstHealthScoreWidget";
import GstExportDrawer from "@/components/analytics/gst/GstExportDrawer";
import TallyExportDrawer from "@/components/analytics/tally/TallyExportDrawer";
import { Button, Card, Select } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getGstSummary,
  getGstMismatches,
  getGstExport,
  getGstHealthScore,
} from "@/store/slices/gstSlice";
import { tallyService, gstService } from "@/service/retailer";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useRouter } from "next/navigation";
import { useApiResponse } from "@/hooks/useApiResponse";
import GstGuard from "@/components/auth/GstGuard";

const formatCurrency = (amount) =>
  `₹${(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const GstAnalyticsContent = () => {
  const { t } = useTranslation();

  useDashboardHeader(t("gst.gstAnalytics") || "GST Analytics", t("gst.gstAnalyticsDesc") || "GST summary, mismatches, and export for CA filing");
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

  const { execute: executeExport } = useApiResponse();

  const handleExport = async (exportPeriod) => {
    return await executeExport(gstService.getGstExport(storeId, exportPeriod), { showToast: false });
  };

  const handleTallyExport = async (params) => {
    return await executeExport(tallyService.getTallyExport(storeId, params), { showToast: false });
  };

  const openTallyExport = () => {
    if (!selectedStore?.tallyIntegration?.enabled) {
      showError(t("integrations.enableFirst"));
      router.push("/dashboard/settings?tab=integrations");
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
            <Button variant="secondary" onClick={openTallyExport} size="sm">
              <Download className="w-3.5 h-3.5 mr-2" />
              {t("integrations.exportTally")}
            </Button>
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
                                  <p className="text-[0.625rem] text-[rgb(var(--color-text-tertiary))] uppercase tracking-wider font-semibold">GSTR-1 Section</p>
                                </div>
                              </div>
                              <span className="text-[0.625rem] font-bold px-2 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-md border border-green-500/20">Invoices ({outward.invoiceCount || 0})</span>
                            </div>
                            <div className="p-5 space-y-1">
                              <StatRow label={t("gst.taxableValue")} value={formatCurrency(outward.taxableAmount)} icon={Receipt} />
                              <div className="grid grid-cols-2 gap-3 py-3">
                                <div className="p-3 bg-[rgb(var(--color-bg-secondary))]/40 rounded-xl border border-[var(--color-border-primary-light)]">
                                  <p className="text-[0.625rem] text-[rgb(var(--color-text-tertiary))] uppercase font-bold mb-1">{t("gst.b2bSales")}</p>
                                  <p className="text-sm font-bold text-[rgb(var(--color-text-primary))]">{formatCurrency(outward.b2bTaxable)}</p>
                                </div>
                                <div className="p-3 bg-[rgb(var(--color-bg-secondary))]/40 rounded-xl border border-[var(--color-border-primary-light)]">
                                  <p className="text-[0.625rem] text-[rgb(var(--color-text-tertiary))] uppercase font-bold mb-1">{t("gst.b2cSales")}</p>
                                  <p className="text-sm font-bold text-[rgb(var(--color-text-primary))]">{formatCurrency(outward.b2cTaxable)}</p>
                                </div>
                              </div>
                              <div className="pt-2 space-y-1">
                                <p className="text-[0.625rem] font-bold text-[rgb(var(--color-text-tertiary))] uppercase mb-2 tracking-wide">GST Distribution</p>
                                <StatRow label={t("gst.cgst")} value={formatCurrency(outward.cgst)} color="text-green-600 dark:text-green-400" />
                                <StatRow label={t("gst.sgst")} value={formatCurrency(outward.sgst)} color="text-green-600 dark:text-green-400" />
                                <StatRow label={t("gst.igst")} value={formatCurrency(outward.igst)} color="text-green-600 dark:text-green-400" />
                                {(outward.utgst > 0 || outward.cess > 0) && (
                                  <>
                                    {outward.utgst > 0 && <StatRow label={t("gst.utgst")} value={formatCurrency(outward.utgst)} color="text-green-600 dark:text-green-400" />}
                                    {outward.cess > 0 && <StatRow label={t("gst.cess")} value={formatCurrency(outward.cess)} color="text-green-600 dark:text-green-400" />}
                                  </>
                                )}
                              </div>
                              {outward.totalItemsWithGst > 0 && (
                                <div className="mt-4 p-2 bg-[rgb(var(--color-bg-secondary))]/30 rounded-lg flex items-center justify-between">
                                  <span className="text-[0.625rem] font-bold text-[rgb(var(--color-text-tertiary))] uppercase">{t("gst.hsnCoverage")}</span>
                                  <span className="text-xs font-bold text-[rgb(var(--color-text-primary))]">
                                    {Math.round((outward.itemsWithHsn / outward.totalItemsWithGst) * 100)}%
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="p-4 bg-[rgb(var(--color-primary))]/5 border-t border-[var(--color-border-primary-light)] flex justify-between items-center group hover:bg-[rgb(var(--color-primary))]/10 transition-colors cursor-default">
                              <span className="text-sm font-bold text-[rgb(var(--color-text-secondary))]">{t("gst.totalOutputTax")}</span>
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
                                  <p className="text-[0.625rem] text-[rgb(var(--color-text-tertiary))] uppercase tracking-wider font-semibold">GSTR-2B Section</p>
                                </div>
                              </div>
                              <span className="text-[0.625rem] font-bold px-2 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md border border-blue-500/20">Bills ({inward.billCount || 0})</span>
                            </div>
                            <div className="p-5 space-y-1">
                              <StatRow label={t("gst.taxableValueInward")} value={formatCurrency(inward.taxableAmount)} icon={Receipt} />
                              <div className="grid grid-cols-2 gap-3 py-3">
                                <div className="p-3 bg-[rgb(var(--color-bg-secondary))]/40 rounded-xl border border-[var(--color-border-primary-light)]">
                                  <p className="text-[0.625rem] text-[rgb(var(--color-text-tertiary))] uppercase font-bold mb-1">{t("gst.itcEligible")}</p>
                                  <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{formatCurrency(inward.b2bTaxable)}</p>
                                </div>
                                <div className="p-3 bg-[rgb(var(--color-bg-secondary))]/40 rounded-xl border border-[var(--color-border-primary-light)]">
                                  <p className="text-[0.625rem] text-[rgb(var(--color-text-tertiary))] uppercase font-bold mb-1">{t("gst.nonItcPurchase")}</p>
                                  <p className="text-sm font-bold text-[rgb(var(--color-text-primary))]">{formatCurrency(inward.b2cTaxable)}</p>
                                </div>
                              </div>
                              <div className="pt-2 space-y-1">
                                <p className="text-[0.625rem] font-bold text-[rgb(var(--color-text-tertiary))] uppercase mb-2 tracking-wide">ITC Breakdown</p>
                                <StatRow label={t("gst.cgstInward")} value={formatCurrency(inward.cgst)} color="text-blue-600 dark:text-blue-400" />
                                <StatRow label={t("gst.sgstInward")} value={formatCurrency(inward.sgst)} color="text-blue-600 dark:text-blue-400" />
                                <StatRow label={t("gst.igstInward")} value={formatCurrency(inward.igst)} color="text-blue-600 dark:text-blue-400" />
                                {(inward.utgst > 0 || inward.cess > 0) && (
                                  <>
                                    {inward.utgst > 0 && <StatRow label={t("gst.utgstInward")} value={formatCurrency(inward.utgst)} color="text-blue-600 dark:text-blue-400" />}
                                    {inward.cess > 0 && <StatRow label={t("gst.cess")} value={formatCurrency(inward.cess)} color="text-blue-600 dark:text-blue-400" />}
                                  </>
                                )}
                              </div>
                              {inward.totalItemsWithGst > 0 && (
                                <div className="mt-4 p-2 bg-[rgb(var(--color-bg-secondary))]/30 rounded-lg flex items-center justify-between">
                                  <span className="text-[0.625rem] font-bold text-[rgb(var(--color-text-tertiary))] uppercase">{t("gst.compliance")}</span>
                                  <span className="text-xs font-bold text-[rgb(var(--color-text-primary))]">
                                    {Math.round((inward.itemsWithHsn / inward.totalItemsWithGst) * 100)}% HSN
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="p-4 bg-[rgb(var(--color-primary))]/5 border-t border-[var(--color-border-primary-light)] flex justify-between items-center group hover:bg-[rgb(var(--color-primary))]/10 transition-colors cursor-default">
                              <span className="text-sm font-bold text-[rgb(var(--color-text-secondary))]">{t("gst.totalItc")}</span>
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

      <GstExportDrawer
        isOpen={showExportDrawer}
        onClose={() => setShowExportDrawer(false)}
        onExport={handleExport}
        isLoading={isLoading}
      />
      <TallyExportDrawer
        isOpen={showTallyExportDrawer}
        onClose={() => setShowTallyExportDrawer(false)}
        onExport={handleTallyExport}
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
