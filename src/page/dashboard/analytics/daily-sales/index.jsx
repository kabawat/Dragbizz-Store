"use client";
import { DailySalesAnalyticsScreen } from "@dragorbit/features/analytics";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";

import { useAnalyticsReportPrint } from "@/hooks/print/useAnalyticsReportPrint";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getInvoiceAnalytics,
  getRevenueAnalytics,
} from "@/store/slices/analyticsSlice";
import DailySalesReportTemplate from "@/components/templates/analytics/daily-sales/DailySalesReportTemplate";

const formatCurrency = (amount) =>
  `₹${(amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const formatNumber = (num) => (num || 0).toLocaleString("en-IN");

const DailySalesAnalytics = () => {
  const { t } = useTranslation();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const hideGst = !selectedStore?.gst;

  useDashboardHeader(
    t("dashboard.dailySales") || "Daily Sales",
    t("analytics.dailySalesDescription") ||
      "Simple today sales view for kirana shops",
  );

  const dispatch = useAppDispatch();
  const { revenue, invoice, isLoadingRevenue, isLoadingInvoice } =
    useAppSelector((state) => state.analytics);

  const storeId =
    selectedStore?.storeId || selectedStore?.id || selectedStore?._id;
  const fetchedStoreId = useRef(null);

  useEffect(() => {
    if (storeId && fetchedStoreId.current !== storeId) {
      fetchedStoreId.current = storeId;
      dispatch(getRevenueAnalytics(storeId));
      dispatch(getInvoiceAnalytics(storeId));
    }
  }, [storeId, dispatch]);

  const reportData = useMemo(
    () => ({
      todayRevenue: revenue?.today ?? { revenue: 0, profit: 0, sales: 0 },
      invoiceToday: invoice?.today ?? { totalInvoices: 0, releasedInvoices: 0 },
      recentTransactions: invoice?.recentTransactions ?? [],
      lastSyncedAt: revenue?.lastSyncedAt ?? invoice?.lastSyncedAt,
      hideGst,
    }),
    [revenue, invoice, hideGst],
  );

  const isLoading = isLoadingRevenue || isLoadingInvoice;
  const { handleDownloadPDF, handleDownloadXLSX } = useAnalyticsReportPrint(
    isLoading,
    reportData,
    "daily-sales-report-area",
    "daily-sales-report",
  );

  const todayRevenue = reportData.todayRevenue;
  const invoiceToday = reportData.invoiceToday;
  const recentTransactions = reportData.recentTransactions;

  return (
    <DailySalesAnalyticsScreen
      model={{
        gstLinkProps: { href: "/dashboard/analytics/gst" },
        settingsLinkProps: { href: "/dashboard/settings" },
        hideGst,
        t,
        Link,
        handleDownloadPDF,
        reportData,
        handleDownloadXLSX,
        formatCurrency,
        todayRevenue,
        formatNumber,
        invoiceToday,
        recentTransactions,
        DailySalesReportTemplate,
        selectedStore,
      }}
    />
  );
};

export default DailySalesAnalytics;
