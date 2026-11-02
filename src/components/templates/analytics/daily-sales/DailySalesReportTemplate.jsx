"use client";
import { DailySalesReportTemplateView } from "@dragorbit/features/analytics";

function formatCurrency(amount) {
  if (amount === null || amount === undefined) return "₹0.00";
  return `₹${Number(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatNumber(num) {
  return (num || 0).toLocaleString("en-IN");
}

export default function DailySalesReportTemplate({
  analyticsData,
  selectedStore,
  hideGst = false,
}) {
  const todayRevenue = analyticsData?.todayRevenue ?? {
    revenue: 0,
    profit: 0,
    sales: 0,
  };
  const invoiceToday = analyticsData?.invoiceToday ?? {
    totalInvoices: 0,
    releasedInvoices: 0,
  };
  const recentTransactions = analyticsData?.recentTransactions ?? [];

  return (
    <DailySalesReportTemplateView
      model={{
        hideGst,
        selectedStore,
        formatCurrency,
        todayRevenue,
        formatNumber,
        invoiceToday,
        recentTransactions,
      }}
    />
  );
}
