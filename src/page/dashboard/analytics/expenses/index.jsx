"use client";
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, } from "@dnd-kit/core";
import { arrayMove, rectSortingStrategy, SortableContext, sortableKeyboardCoordinates, } from "@dnd-kit/sortable";
import { AlertTriangle, Calendar, CheckCircle, ChevronDown, DollarSign, Download, FileSpreadsheet, FileText, } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { SortableCard, SortableMetricCard, } from "@/components/templates/analytics/SortableComponents";
import { Button, Card } from "@/components/ui";
import { useAnalyticsReportPrint } from "@/hooks/useAnalyticsReportPrint";
import { useTranslation } from "@/hooks/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getExpenseAnalytics } from "@/store/slices/analyticsSlice";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import ExpensesReportTemplate from "@/components/templates/analytics/expenses/ExpensesReportTemplate";

const formatCurrency = (amount) => {
  return `₹${(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatNumber = (num) => {
  return (num || 0).toLocaleString("en-IN");
};

const ExpenseAnalytics = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const { expense: analytics, isLoadingExpense: isLoading } = useAppSelector((state) => state.analytics);
  const hasFetchedRef = useRef({ storeId: null, fetched: false });

  const { handleDownloadPDF, handleDownloadXLSX } = useAnalyticsReportPrint(
    isLoading,
    analytics,
    "expenses-report-area",
    "expenses-analytics-report"
  );
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef(null);

  useEffect(() => {
    const storeId =
      selectedStore?._id || selectedStore?.id || selectedStore?.storeId;
    if (!storeId) return;

    const lastFetched = hasFetchedRef.current;
    if (lastFetched.fetched && lastFetched.storeId === storeId) {
      return;
    }

    hasFetchedRef.current = { storeId, fetched: true };
    dispatch(getExpenseAnalytics(storeId));
  }, [dispatch, selectedStore?._id, selectedStore?.id, selectedStore?.storeId]);

  useEffect(() => {
    const storeId =
      selectedStore?._id || selectedStore?.id || selectedStore?.storeId;
    if (storeId && hasFetchedRef.current.storeId !== storeId) {
      hasFetchedRef.current = { storeId: null, fetched: false };
    }
  }, [selectedStore?._id, selectedStore?.id, selectedStore?.storeId]);

  // Memoize derived values to prevent infinite loops
  const counts = useMemo(() => analytics?.counts || {}, [analytics?.counts]);
  const amounts = useMemo(() => analytics?.amounts || {}, [analytics?.amounts]);

  // Convert Map to Object if needed
  const categoryData = useMemo(() => {
    const byCategory = analytics?.byCategory || {};
    return byCategory instanceof Map
      ? Object.fromEntries(byCategory)
      : byCategory;
  }, [analytics?.byCategory]);

  const paymentMethodData = useMemo(() => {
    const byPaymentMethod = analytics?.byPaymentMethod || {};
    return byPaymentMethod instanceof Map
      ? Object.fromEntries(byPaymentMethod)
      : byPaymentMethod;
  }, [analytics?.byPaymentMethod]);

  // State for drag-and-drop functionality - initialize with default values
  const [metrics, setMetrics] = useState([
    {
      id: "totalExpenses",
      title: t("expenses.analytics.totalExpenses"),
      value: "0",
      change: `0 ${t("common.paid").toLowerCase()}, 0 ${t("common.pending").toLowerCase()}`,
      icon: DollarSign,
      iconColor: "from-red-100 to-red-200",
      textColor: "text-[rgb(var(--color-text-primary))]",
    },
    {
      id: "todayExpenses",
      title: t("expenses.analytics.todayExpenses"),
      value: "0",
      change: "₹0.00",
      icon: Calendar,
      iconColor: "from-blue-100 to-blue-200",
      textColor: "text-[rgb(var(--color-text-primary))]",
    },
    {
      id: "paidExpenses",
      title: t("expenses.analytics.paidExpenses"),
      value: "0",
      change: "₹0.00",
      icon: CheckCircle,
      iconColor: "from-green-100 to-green-200",
      textColor: "text-[rgb(var(--color-text-primary))]",
    },
    {
      id: "pendingExpenses",
      title: t("expenses.analytics.pendingExpenses"),
      value: "0",
      change: "₹0.00",
      icon: AlertTriangle,
      iconColor: "from-yellow-100 to-yellow-200",
      textColor: "text-[rgb(var(--color-text-primary))]",
    },
  ]);

  const [amountCards, setAmountCards] = useState([
    {
      id: "amount1",
      type: "amount",
      title: t("expenses.analytics.totalAmount"),
      value: "₹0.00",
      label: t("expenses.analytics.totalExpensesAmount"),
      color: "text-red-600 dark:text-red-400",
    },
    {
      id: "amount2",
      type: "amount",
      title: t("expenses.analytics.netAmount"),
      value: "₹0.00",
      label: t("expenses.analytics.netAmountExclGst"),
      color: "text-indigo-600 dark:text-indigo-400",
    },
    {
      id: "amount3",
      type: "amount",
      title: t("expenses.analytics.gstAmount"),
      value: "₹0.00",
      label: t("expenses.analytics.totalGstAmount"),
      color: "text-teal-600 dark:text-teal-400",
    },
  ]);

  // Update metrics when analytics data changes (only update values, preserve order for drag)
  useEffect(() => {
    if (analytics && counts && amounts) {
      setMetrics((prevMetrics) => {
        const metricsMap = new Map(prevMetrics.map((m) => [m.id, m]));

        // Update values while preserving order
        if (metricsMap.has("totalExpenses")) {
          metricsMap.set("totalExpenses", {
            ...metricsMap.get("totalExpenses"),
            value: formatNumber(counts.totalExpenses),
            change: `${formatNumber(counts.paidExpenses)} ${t("common.paid").toLowerCase()}, ${formatNumber(counts.pendingExpenses)} ${t("common.pending").toLowerCase()}`,
          });
        }
        if (metricsMap.has("todayExpenses")) {
          metricsMap.set("todayExpenses", {
            ...metricsMap.get("todayExpenses"),
            value: formatNumber(counts.todayExpenses),
            change: formatCurrency(amounts.todayAmount),
          });
        }
        if (metricsMap.has("paidExpenses")) {
          metricsMap.set("paidExpenses", {
            ...metricsMap.get("paidExpenses"),
            value: formatNumber(counts.paidExpenses),
            change: formatCurrency(amounts.paidAmount),
          });
        }
        if (metricsMap.has("pendingExpenses")) {
          metricsMap.set("pendingExpenses", {
            ...metricsMap.get("pendingExpenses"),
            value: formatNumber(counts.pendingExpenses),
            change: formatCurrency(amounts.pendingAmount),
          });
        }

        return Array.from(metricsMap.values());
      });

      setAmountCards((prevCards) => {
        const cardsMap = new Map(prevCards.map((c) => [c.id, c]));

        if (cardsMap.has("amount1")) {
          cardsMap.set("amount1", {
            ...cardsMap.get("amount1"),
            value: formatCurrency(amounts.totalAmount),
          });
        }
        if (cardsMap.has("amount2")) {
          cardsMap.set("amount2", {
            ...cardsMap.get("amount2"),
            value: formatCurrency(amounts.totalNetAmount),
          });
        }
        if (cardsMap.has("amount3")) {
          cardsMap.set("amount3", {
            ...cardsMap.get("amount3"),
            value: formatCurrency(amounts.totalGstAmount),
          });
        }

        return Array.from(cardsMap.values());
      });
    }
  }, [analytics, counts, amounts]);

  const [cards, setCards] = useState([
    { id: "chart1", type: "chart", title: t("expenses.analytics.byCategory") },
    { id: "chart2", type: "chart", title: t("expenses.analytics.byPaymentMethod") },
    { id: "breakdown", type: "breakdown", title: t("expenses.analytics.breakdown") },
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

  const handleAmountCardsDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setAmountCards((items) => {
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

  const getExpensesXLSXConfig = () => {
    const counts = analytics?.counts || {
      totalExpenses: 0,
      paidExpenses: 0,
      pendingExpenses: 0,
    };
    const amounts = analytics?.amounts || {
      totalAmount: 0,
      netAmount: 0,
      gstAmount: 0,
    };
    return {
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
    };
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
        id="expenses-report-area"
        style={{
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
          width: "850px",
        }}
      >
        {analytics && (
          <ExpensesReportTemplate
            analyticsData={analytics}
            selectedStore={selectedStore}
          />
        )}
      </div>

      <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative">
        <Sidebar />

        <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
          <Header
            title={t("dashboard.expenseAnalytics") || "Expense Analytics"}
            description={t("expenses.reports.description")}
          />

          <div className="flex-1 p-6 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-sm text-[rgb(var(--color-text-tertiary))]">
                  {t("expenses.analytics.loading")}
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

                {/* Amount Cards - Single Row */}
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleAmountCardsDragEnd}
                >
                  <SortableContext
                    items={amountCards.map((c) => c.id)}
                    strategy={rectSortingStrategy}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      {amountCards.map((card) => (
                        <SortableCard key={card.id} id={card.id}>
                          <Card>
                            <div className="p-4">
                              <h3 className="text-sm font-semibold text-[rgb(var(--color-text-primary))] mb-2 text-center">
                                {card.title}
                              </h3>
                              <div className="text-center">
                                <p
                                  className={`text-2xl font-bold ${card.color} mb-1`}
                                >
                                  {card.value}
                                </p>
                                <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                                  {card.label}
                                </p>
                              </div>
                            </div>
                          </Card>
                        </SortableCard>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>

                {/* Other Cards */}
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
                          {card.type === "chart" && card.id === "chart1" && (
                            <Card>
                              <div className="p-6">
                                <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-4">
                                  {card.title}
                                </h3>
                                {categoryData &&
                                  Object.keys(categoryData).length > 0 ? (
                                  <div className="space-y-3">
                                    {Object.entries(categoryData).map(
                                      ([category, data]) => (
                                        <div
                                          key={category}
                                          className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-3 border-[var(--color-border-primary-light)]"
                                        >
                                          <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                                              {category}
                                            </span>
                                            <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                                              {formatCurrency(data.amount)}
                                            </span>
                                          </div>
                                          <div className="flex justify-between text-xs text-[rgb(var(--color-text-secondary))]">
                                            <span>
                                              {formatNumber(data.count)}{" "}
                                              {t("common.expenses").toLowerCase()}
                                            </span>
                                            <span>
                                              {amounts.totalAmount > 0
                                                ? (
                                                  (data.amount /
                                                    amounts.totalAmount) *
                                                  100
                                                ).toFixed(1)
                                                : 0}
                                              %
                                            </span>
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                ) : (
                                  <div className="h-64 bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg flex items-center justify-center border-[var(--color-border-primary-light)]">
                                    <p className="text-sm text-[rgb(var(--color-text-tertiary))]">
                                      {t("expenses.analytics.noCategoryData")}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </Card>
                          )}
                          {card.type === "chart" && card.id === "chart2" && (
                            <Card>
                              <div className="p-6">
                                <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-4">
                                  {card.title}
                                </h3>
                                {paymentMethodData &&
                                  Object.keys(paymentMethodData).length > 0 ? (
                                  <div className="space-y-3">
                                    {Object.entries(paymentMethodData).map(
                                      ([method, data]) => (
                                        <div
                                          key={method}
                                          className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-3 border-[var(--color-border-primary-light)]"
                                        >
                                          <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                                              {method}
                                            </span>
                                            <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                                              {formatCurrency(data.amount)}
                                            </span>
                                          </div>
                                          <div className="flex justify-between text-xs text-[rgb(var(--color-text-secondary))]">
                                            <span>
                                              {formatNumber(data.count)}{" "}
                                              {t("common.expenses").toLowerCase()}
                                            </span>
                                            <span>
                                              {amounts.totalAmount > 0
                                                ? (
                                                  (data.amount /
                                                    amounts.totalAmount) *
                                                  100
                                                ).toFixed(1)
                                                : 0}
                                              %
                                            </span>
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                ) : (
                                  <div className="h-64 bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg flex items-center justify-center border-[var(--color-border-primary-light)]">
                                    <p className="text-sm text-[rgb(var(--color-text-tertiary))]">
                                      {t("expenses.analytics.noPaymentMethodData")}
                                    </p>
                                  </div>
                                )}
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
                                      {t("expenses.analytics.paidAmount")}
                                    </p>
                                    <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                                      {formatCurrency(amounts.paidAmount)}
                                    </p>
                                    <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-1">
                                      {formatNumber(counts.paidExpenses)}{" "}
                                      {t("common.expenses").toLowerCase()}
                                    </p>
                                  </div>
                                  <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 border-[var(--color-border-primary-light)] text-center">
                                    <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">
                                      {t("expenses.analytics.pendingAmount")}
                                    </p>
                                    <p className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                                      {formatCurrency(amounts.pendingAmount)}
                                    </p>
                                    <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-1">
                                      {formatNumber(counts.pendingExpenses)}{" "}
                                      {t("common.expenses").toLowerCase()}
                                    </p>
                                  </div>
                                  <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 border-[var(--color-border-primary-light)] text-center">
                                    <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">
                                      {t("expenses.analytics.todayAmount")}
                                    </p>
                                    <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                      {formatCurrency(amounts.todayAmount)}
                                    </p>
                                    <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-1">
                                      {formatNumber(counts.todayExpenses)}{" "}
                                      {t("common.expenses").toLowerCase()}
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
              {t("expenses.analytics.downloadReport")}
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
                  {t("expenses.analytics.downloadAsPDF")}
                </button>
                <button
                  onClick={() => {
                    handleDownloadXLSX(
                      analytics,
                      selectedStore,
                      "expenses-analytics-report",
                      getExpensesXLSXConfig()
                    );
                    setShowExportMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm flex items-center gap-3 transition-colors duration-200 cursor-pointer hover:bg-[rgb(var(--color-bg-secondary))] focus:outline-none text-[rgb(var(--color-text-primary))]"
                >
                  <FileSpreadsheet className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                  {t("expenses.analytics.downloadAsXLSX")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ExpenseAnalytics;
