"use client";

import { Download, FileSpreadsheet, FileText, IndianRupee, Receipt } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Card } from "@/components/ui";
import { useAnalyticsReportPrint } from "@/hooks/print/useAnalyticsReportPrint";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getInvoiceAnalytics, getRevenueAnalytics } from "@/store/slices/analyticsSlice";
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
    t("analytics.dailySalesDescription") || "Simple today sales view for kirana shops",
  );

  const dispatch = useAppDispatch();
  const { revenue, invoice, isLoadingRevenue, isLoadingInvoice } = useAppSelector(
    (state) => state.analytics,
  );

  const storeId = selectedStore?.storeId || selectedStore?.id || selectedStore?._id;
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
    <div className="space-y-6">
      {!hideGst ? (
        <Card className="p-4 bg-primary/5 border-primary/20">
          <p className="text-sm">{t("analytics.gstDailySalesCta")}</p>
          <Link href="/dashboard/analytics/gst" className="text-sm font-medium text-primary mt-2 inline-block">
            {t("analytics.openGstAnalytics")}
          </Link>
        </Card>
      ) : (
        <Card className="p-4 border-dashed">
          <p className="text-sm text-muted-foreground">{t("analytics.gstUpsell")}</p>
          <Link href="/dashboard/settings" className="text-sm font-medium text-primary mt-2 inline-block">
            {t("analytics.addGstCta")}
          </Link>
        </Card>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => handleDownloadPDF(reportData)}>
          <FileText className="h-4 w-4 mr-2" /> PDF
        </Button>
        <Button variant="outline" onClick={() => handleDownloadXLSX(reportData)}>
          <FileSpreadsheet className="h-4 w-4 mr-2" /> XLSX
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">{t("analytics.todaysSalesAmount")}</p>
          <p className="text-2xl font-bold">{formatCurrency(todayRevenue.revenue)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">{t("analytics.todaysBillCount")}</p>
          <p className="text-2xl font-bold">{formatNumber(todayRevenue.sales)}</p>
        </Card>
        {!hideGst ? (
          <Card className="p-5">
            <p className="text-sm text-muted-foreground">{t("analytics.todaysProfit")}</p>
            <p className="text-2xl font-bold">{formatCurrency(todayRevenue.profit)}</p>
          </Card>
        ) : (
          <Card className="p-5">
            <p className="text-sm text-muted-foreground">{t("analytics.releasedToday")}</p>
            <p className="text-2xl font-bold">{formatNumber(invoiceToday.releasedInvoices)}</p>
          </Card>
        )}
      </div>

      <Card>
        <div className="px-5 py-4 border-b">
          <h3 className="font-semibold">{t("analytics.recentBillsToday")}</h3>
        </div>
        {recentTransactions.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">{t("analytics.noBillsToday")}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left px-5 py-3">Invoice</th>
                <th className="text-right px-5 py-3">Amount</th>
                <th className="text-left px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.slice(0, 15).map((row) => (
                <tr key={row.invoiceId || row.invoiceNumber} className="border-b">
                  <td className="px-5 py-3">{row.invoiceNumber || "—"}</td>
                  <td className="px-5 py-3 text-right">{formatCurrency(row.totalAmount)}</td>
                  <td className="px-5 py-3">{row.paymentStatus || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <div className="fixed left-[-9999px] top-0 opacity-0 pointer-events-none" aria-hidden>
        <DailySalesReportTemplate
          analyticsData={reportData}
          selectedStore={selectedStore}
          hideGst={hideGst}
        />
      </div>
    </div>
  );
};

export default DailySalesAnalytics;
