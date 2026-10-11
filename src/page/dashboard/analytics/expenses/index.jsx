"use client";
import { ExpenseAnalyticsScreen } from "@dragorbit/features/analytics";

import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { AlertTriangle, Calendar, CheckCircle, DollarSign } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  SortableCard,
  SortableMetricCard,
} from "@/components/templates/analytics/SortableComponents";

import { useAnalyticsReportPrint } from "@/hooks/print/useAnalyticsReportPrint";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getExpenseAnalytics } from "@/store/slices/analyticsSlice";
import ExpensesReportTemplate from "@/components/templates/analytics/expenses/ExpensesReportTemplate";

const formatCurrency = (amount) =>
  `₹${(amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const formatNumber = (num) => (num || 0).toLocaleString("en-IN");

const ExpenseAnalytics = () => {
  const { t } = useTranslation();
  useDashboardHeader(
    t("dashboard.expenseAnalytics") || "Expense Analytics",
    t("expenses.reports.description"),
  );

  const dispatch = useAppDispatch();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const { expense: analytics, isLoadingExpense: isLoading } = useAppSelector(
    (state) => state.analytics,
  );

  const storeId =
    selectedStore?.storeId || selectedStore?.id || selectedStore?._id;
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

  const { handleDownloadPDF, handleDownloadXLSX } = useAnalyticsReportPrint(
    isLoading,
    analytics,
    "expenses-report-area",
    "expenses-analytics-report",
  );

  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef(null);

  const [metrics, setMetrics] = useState([
    {
      id: "totalExpenses",
      title: t("expenses.analytics.totalExpenses"),
      value: "0",
      change: "0 paid, 0 pending",
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
      title: t("expenses.analytics.totalAmount"),
      value: "₹0.00",
      label: t("expenses.analytics.totalExpensesAmount"),
      color: "text-red-600 dark:text-red-400",
    },
    {
      id: "amount2",
      title: t("expenses.analytics.netAmount"),
      value: "₹0.00",
      label: t("expenses.analytics.netAmountExclGst"),
      color: "text-indigo-600 dark:text-indigo-400",
    },
    {
      id: "amount3",
      title: t("expenses.analytics.gstAmount"),
      value: "₹0.00",
      label: t("expenses.analytics.totalGstAmount"),
      color: "text-teal-600 dark:text-teal-400",
    },
  ]);

  useEffect(() => {
    if (analytics && counts && amounts) {
      setMetrics((prev) =>
        prev.map((m) => {
          if (m.id === "totalExpenses")
            return {
              ...m,
              value: formatNumber(counts.totalExpenses),
              change: `${formatNumber(counts.paidExpenses)} ${t("common.paid")}, ${formatNumber(counts.pendingExpenses)} ${t("common.pending")}`,
            };
          if (m.id === "todayExpenses")
            return {
              ...m,
              value: formatNumber(counts.todayExpenses),
              change: formatCurrency(amounts.todayAmount),
            };
          if (m.id === "paidExpenses")
            return {
              ...m,
              value: formatNumber(counts.paidExpenses),
              change: formatCurrency(amounts.paidAmount),
            };
          if (m.id === "pendingExpenses")
            return {
              ...m,
              value: formatNumber(counts.pendingExpenses),
              change: formatCurrency(amounts.pendingAmount),
            };
          return m;
        }),
      );

      setAmountCards((prev) =>
        prev.map((c) => {
          if (c.id === "amount1")
            return { ...c, value: formatCurrency(amounts.totalAmount) };
          if (c.id === "amount2")
            return { ...c, value: formatCurrency(amounts.totalNetAmount) };
          if (c.id === "amount3")
            return { ...c, value: formatCurrency(amounts.totalGstAmount) };
          return c;
        }),
      );
    }
  }, [analytics, counts, amounts, t]);

  const [cards, setCards] = useState([
    { id: "chart1", type: "chart", title: t("expenses.analytics.byCategory") },
    {
      id: "chart2",
      type: "chart",
      title: t("expenses.analytics.byPaymentMethod"),
    },
    {
      id: "breakdown",
      type: "breakdown",
      title: t("expenses.analytics.breakdown"),
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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target))
        setShowExportMenu(false);
    };
    if (showExportMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showExportMenu]);

  const getExpensesXLSXConfig = () => ({
    title: t("expenses.analytics.reportTitle"),
    columns: 2,
    sections: [
      {
        title: t("expenses.analytics.summary"),
        headers: [
          t("expenses.analytics.metric"),
          t("expenses.analytics.value"),
        ],
        columns: 2,
        data: [
          [
            t("expenses.analytics.totalExpenses"),
            formatNumber(counts.totalExpenses),
          ],
          [
            t("expenses.analytics.paidExpenses"),
            formatNumber(counts.paidExpenses),
          ],
          [
            t("expenses.analytics.pendingExpenses"),
            formatNumber(counts.pendingExpenses),
          ],
          [
            t("expenses.analytics.totalAmount"),
            formatCurrency(amounts.totalAmount),
          ],
        ],
      },
      {
        title: t("expenses.analytics.financialBreakdown"),
        headers: [t("expenses.category"), t("expenses.amount")],
        columns: 2,
        data: [
          [
            t("expenses.analytics.totalAmount"),
            formatCurrency(amounts.totalAmount),
          ],
          [
            t("expenses.analytics.netAmount"),
            formatCurrency(amounts.netAmount),
          ],
          [
            t("expenses.analytics.gstAmount"),
            formatCurrency(amounts.gstAmount),
          ],
          [
            t("expenses.analytics.paidExpenses"),
            formatNumber(counts.paidExpenses),
          ],
          [
            t("expenses.analytics.pendingExpenses"),
            formatNumber(counts.pendingExpenses),
          ],
        ],
        amountColumns: [1],
      },
    ],
  });

  return (
    <ExpenseAnalyticsScreen
      model={{
        analytics,
        ExpensesReportTemplate,
        selectedStore,
        isLoading,
        t,
        sensors,
        handleMetricsDragEnd,
        metrics,
        SortableMetricCard,
        setAmountCards,
        amountCards,
        SortableCard,
        handleCardsDragEnd,
        cards,
        categoryData,
        paymentMethodData,
        formatCurrency,
        formatNumber,
        amounts,
        counts,
        exportMenuRef,
        setShowExportMenu,
        showExportMenu,
        handleDownloadPDF,
        handleDownloadXLSX,
        getExpensesXLSXConfig,
      }}
    />
  );
};

export default ExpenseAnalytics;
