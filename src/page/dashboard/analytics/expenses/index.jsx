"use client";
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, } from "@dnd-kit/core";
import { arrayMove, rectSortingStrategy, SortableContext, sortableKeyboardCoordinates, } from "@dnd-kit/sortable";
import { AlertTriangle, Calendar, CheckCircle, ChevronDown, DollarSign, Download, FileSpreadsheet, FileText, } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { SortableCard, SortableMetricCard } from "@/components/templates/analytics/SortableComponents";
import { Button, Card } from "@/components/ui";
import { useAnalyticsReportPrint } from "@/hooks/print/useAnalyticsReportPrint";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getExpenseAnalytics } from "@/store/slices/analyticsSlice";
import ExpensesReportTemplate from "@/components/templates/analytics/expenses/ExpensesReportTemplate";

const formatCurrency = (amount) => `₹${(amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const formatNumber = (num) => (num || 0).toLocaleString("en-IN");

const ExpenseAnalytics = () => {
  const { t } = useTranslation();
  useDashboardHeader(t("dashboard.expenseAnalytics") || "Expense Analytics", t("expenses.reports.description"));

  const dispatch = useAppDispatch();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const { expense: analytics, isLoadingExpense: isLoading } = useAppSelector((state) => state.analytics);

  const storeId = selectedStore?.storeId || selectedStore?.id || selectedStore?._id;
  const fetchedStoreId = useRef(null);

  useEffect(() => {
    if (storeId && fetchedStoreId.current !== storeId) {
      fetchedStoreId.current = storeId;
      dispatch(getExpenseAnalytics(storeId));
    }
  }, [storeId, dispatch]);

  const counts = useMemo(() => analytics?.counts || {}, [analytics?.counts]);
  const amounts = useMemo(() => analytics?.amounts || {}, [analytics?.amounts]);

  const categoryData = useMemo(() => {
    const byCategory = analytics?.byCategory || {};
    return byCategory instanceof Map ? Object.fromEntries(byCategory) : byCategory;
  }, [analytics?.byCategory]);

  const paymentMethodData = useMemo(() => {
    const byPaymentMethod = analytics?.byPaymentMethod || {};
    return byPaymentMethod instanceof Map ? Object.fromEntries(byPaymentMethod) : byPaymentMethod;
  }, [analytics?.byPaymentMethod]);

  const { handleDownloadPDF, handleDownloadXLSX } = useAnalyticsReportPrint(
    isLoading,
    analytics,
    "expenses-report-area",
    "expenses-analytics-report"
  );

  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef(null);

  const [metrics, setMetrics] = useState([
    { id: "totalExpenses", title: t("expenses.analytics.totalExpenses"), value: "0", change: "0 paid, 0 pending", icon: DollarSign, iconColor: "from-red-100 to-red-200", textColor: "text-[rgb(var(--color-text-primary))]" },
    { id: "todayExpenses", title: t("expenses.analytics.todayExpenses"), value: "0", change: "₹0.00", icon: Calendar, iconColor: "from-blue-100 to-blue-200", textColor: "text-[rgb(var(--color-text-primary))]" },
    { id: "paidExpenses", title: t("expenses.analytics.paidExpenses"), value: "0", change: "₹0.00", icon: CheckCircle, iconColor: "from-green-100 to-green-200", textColor: "text-[rgb(var(--color-text-primary))]" },
    { id: "pendingExpenses", title: t("expenses.analytics.pendingExpenses"), value: "0", change: "₹0.00", icon: AlertTriangle, iconColor: "from-yellow-100 to-yellow-200", textColor: "text-[rgb(var(--color-text-primary))]" },
  ]);

  const [amountCards, setAmountCards] = useState([
    { id: "amount1", title: t("expenses.analytics.totalAmount"), value: "₹0.00", label: t("expenses.analytics.totalExpensesAmount"), color: "text-red-600 dark:text-red-400" },
    { id: "amount2", title: t("expenses.analytics.netAmount"), value: "₹0.00", label: t("expenses.analytics.netAmountExclGst"), color: "text-indigo-600 dark:text-indigo-400" },
    { id: "amount3", title: t("expenses.analytics.gstAmount"), value: "₹0.00", label: t("expenses.analytics.totalGstAmount"), color: "text-teal-600 dark:text-teal-400" },
  ]);

  useEffect(() => {
    if (analytics && counts && amounts) {
      setMetrics(prev => prev.map(m => {
        if (m.id === "totalExpenses") return { ...m, value: formatNumber(counts.totalExpenses), change: `${formatNumber(counts.paidExpenses)} ${t("common.paid")}, ${formatNumber(counts.pendingExpenses)} ${t("common.pending")}` };
        if (m.id === "todayExpenses") return { ...m, value: formatNumber(counts.todayExpenses), change: formatCurrency(amounts.todayAmount) };
        if (m.id === "paidExpenses") return { ...m, value: formatNumber(counts.paidExpenses), change: formatCurrency(amounts.paidAmount) };
        if (m.id === "pendingExpenses") return { ...m, value: formatNumber(counts.pendingExpenses), change: formatCurrency(amounts.pendingAmount) };
        return m;
      }));

      setAmountCards(prev => prev.map(c => {
        if (c.id === "amount1") return { ...c, value: formatCurrency(amounts.totalAmount) };
        if (c.id === "amount2") return { ...c, value: formatCurrency(amounts.totalNetAmount) };
        if (c.id === "amount3") return { ...c, value: formatCurrency(amounts.totalGstAmount) };
        return c;
      }));
    }
  }, [analytics, counts, amounts, t]);

  const [cards, setCards] = useState([
    { id: "chart1", type: "chart", title: t("expenses.analytics.byCategory") },
    { id: "chart2", type: "chart", title: t("expenses.analytics.byPaymentMethod") },
    { id: "breakdown", type: "breakdown", title: t("expenses.analytics.breakdown") },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleMetricsDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setMetrics(items => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleCardsDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setCards(items => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) setShowExportMenu(false);
    };
    if (showExportMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showExportMenu]);

  const getExpensesXLSXConfig = () => ({
    title: t("expenses.analytics.reportTitle"),
    columns: 2,
    sections: [
      {
        title: t("expenses.analytics.summary"),
        headers: [t("expenses.analytics.metric"), t("expenses.analytics.value")],
        columns: 2,
        data: [
          [t("expenses.analytics.totalExpenses"), formatNumber(counts.totalExpenses)],
          [t("expenses.analytics.paidExpenses"), formatNumber(counts.paidExpenses)],
          [t("expenses.analytics.pendingExpenses"), formatNumber(counts.pendingExpenses)],
          [t("expenses.analytics.totalAmount"), formatCurrency(amounts.totalAmount)],
        ],
      },
      {
        title: t("expenses.analytics.financialBreakdown"),
        headers: [t("expenses.category"), t("expenses.amount")],
        columns: 2,
        data: [
          [t("expenses.analytics.totalAmount"), formatCurrency(amounts.totalAmount)],
          [t("expenses.analytics.netAmount"), formatCurrency(amounts.netAmount)],
          [t("expenses.analytics.gstAmount"), formatCurrency(amounts.gstAmount)],
          [t("expenses.analytics.paidExpenses"), formatNumber(counts.paidExpenses)],
          [t("expenses.analytics.pendingExpenses"), formatNumber(counts.pendingExpenses)],
        ],
        amountColumns: [1],
      },
    ],
  });

  return (
    <>
      <div id="expenses-report-area" className="absolute -left-[9999px] -top-[9999px] w-[850px]">
        {analytics && <ExpensesReportTemplate analyticsData={analytics} selectedStore={selectedStore} />}
      </div>

      <div className="p-5">
        <div className="max-w-8xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-sm text-[rgb(var(--color-text-tertiary))]">{t("expenses.analytics.loading")}</p>
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

              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => {
                const { active, over } = e;
                if (active.id !== over.id) {
                  setAmountCards(items => {
                    const oldIndex = items.findIndex(i => i.id === active.id);
                    const newIndex = items.findIndex(i => i.id === over.id);
                    return arrayMove(items, oldIndex, newIndex);
                  });
                }
              }}>
                <SortableContext items={amountCards.map((c) => c.id)} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {amountCards.map((card) => (
                      <SortableCard key={card.id} id={card.id}>
                        <Card>
                          <div className="p-4 text-center">
                            <h3 className="text-sm font-semibold text-[rgb(var(--color-text-primary))] mb-2">{card.title}</h3>
                            <p className={`text-2xl font-bold ${card.color} mb-1`}>{card.value}</p>
                            <p className="text-xs text-[rgb(var(--color-text-secondary))]">{card.label}</p>
                          </div>
                        </Card>
                      </SortableCard>
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
                              <div className="space-y-3">
                                {Object.entries(card.id === "chart1" ? categoryData : paymentMethodData).map(([key, data]) => (
                                  <div key={key} className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-3 border-[var(--color-border-primary-light)]">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="text-sm font-medium text-[rgb(var(--color-text-primary))]">{key}</span>
                                      <span className={`text-sm font-semibold ${card.id === "chart1" ? "text-purple-600 dark:text-purple-400" : "text-indigo-600 dark:text-indigo-400"}`}>
                                        {formatCurrency(data.amount)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-xs text-[rgb(var(--color-text-secondary))]">
                                      <span>{formatNumber(data.count)} {t("common.expenses").toLowerCase()}</span>
                                      <span>{amounts.totalAmount > 0 ? ((data.amount / amounts.totalAmount) * 100).toFixed(1) : 0}%</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </Card>
                        )}
                        {card.type === "breakdown" && (
                          <Card>
                            <div className="p-6">
                              <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-4">{card.title}</h3>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 text-center">
                                  <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">{t("expenses.analytics.paidAmount")}</p>
                                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">{formatCurrency(amounts.paidAmount)}</p>
                                  <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-1">{formatNumber(counts.paidExpenses)} {t("common.expenses").toLowerCase()}</p>
                                </div>
                                <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 text-center">
                                  <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">{t("expenses.analytics.pendingAmount")}</p>
                                  <p className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">{formatCurrency(amounts.pendingAmount)}</p>
                                  <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-1">{formatNumber(counts.pendingExpenses)} {t("common.expenses").toLowerCase()}</p>
                                </div>
                                <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 text-center">
                                  <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">{t("expenses.analytics.todayAmount")}</p>
                                  <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">{formatCurrency(amounts.todayAmount)}</p>
                                  <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-1">{formatNumber(counts.todayExpenses)} {t("common.expenses").toLowerCase()}</p>
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
          <Button variant="primary" leftIcon={Download} rightIcon={ChevronDown} onClick={() => setShowExportMenu(!showExportMenu)} disabled={isLoading || !analytics}>
            {t("expenses.analytics.downloadReport")}
          </Button>

          {showExportMenu && (
            <div className="absolute bottom-full right-0 mb-2 w-48 bg-[rgb(var(--color-bg-primary))] rounded-lg shadow-lg border border-[rgb(var(--color-border-primary))] py-1 z-50">
              <button onClick={() => { handleDownloadPDF(analytics); setShowExportMenu(false); }} className="w-full px-4 py-2 text-left text-sm flex items-center gap-3 hover:bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-text-primary))]">
                <FileText className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                {t("expenses.analytics.downloadAsPDF")}
              </button>
              <button onClick={() => { handleDownloadXLSX(analytics, selectedStore, "expenses-analytics-report", getExpensesXLSXConfig()); setShowExportMenu(false); }} className="w-full px-4 py-2 text-left text-sm flex items-center gap-3 hover:bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-text-primary))]">
                <FileSpreadsheet className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                {t("expenses.analytics.downloadAsXLSX")}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ExpenseAnalytics;
