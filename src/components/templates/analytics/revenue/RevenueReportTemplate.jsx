"use client";
import {
  DetailsSection,
  PerformanceSection,
  ReportFooter,
  ReportHeader,
  SummarySection,
} from "../common";
import styles from "../common/analyticsReport.module.scss";

const RevenueReportTemplate = ({ analyticsData, selectedStore }) => {
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "₹0.00";
    return `₹${Number(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatNumber = (num) => (num || 0).toLocaleString("en-IN");
  const formatPercent = (num) => `${(num || 0).toFixed(2)}%`;

  const summary = analyticsData?.summary || {
    totalRevenue: 0,
    totalProfit: 0,
    totalDiscount: 0,
    totalGst: 0,
    profitMargin: 0,
  };

  const today = analyticsData?.today || {
    revenue: 0,
    profit: 0,
    sales: 0,
  };

  const change = analyticsData?.change || {
    revenue: 0,
    profit: 0,
    sales: 0,
    changeType: {
      revenue: "up",
      profit: "up",
      sales: "up",
    },
  };

  const summaryCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(summary.totalRevenue),
      change: `${change.changeType?.revenue === "up" ? "↑" : "↓"} ${Math.abs(change.revenue)}% from last period`,
      changeType: change.changeType?.revenue === "up" ? "up" : "down",
    },
    {
      title: "Total Profit",
      value: formatCurrency(summary.totalProfit),
      change: `${change.changeType?.profit === "up" ? "↑" : "↓"} ${Math.abs(change.profit)}% from last period`,
      changeType: change.changeType?.profit === "up" ? "up" : "down",
    },
    {
      title: "Profit Margin",
      value: formatPercent(summary.profitMargin),
      change: "Overall margin percentage",
    },
    {
      title: "Total Sales",
      value: formatNumber(today.sales),
      change: `${change.changeType?.sales === "up" ? "↑" : "↓"} ${Math.abs(change.sales)}% from last period`,
      changeType: change.changeType?.sales === "up" ? "up" : "down",
    },
  ];

  const performanceCards = [
    {
      label: "Today's Revenue",
      value: formatCurrency(today.revenue),
      subValue: `${formatNumber(today.sales)} sales`,
    },
    {
      label: "Today's Profit",
      value: formatCurrency(today.profit),
      subValue: `From ${formatNumber(today.sales)} sales`,
    },
    {
      label: "Total Sales",
      value: formatNumber(today.sales),
      subValue: "Transactions today",
    },
  ];

  const tableColumns = [
    { label: "Category", key: "label" },
    { label: "Amount", key: "amount", align: "right" },
  ];

  const tableData = [
    { label: "Total Revenue", amount: formatCurrency(summary.totalRevenue) },
    { label: "Total Profit", amount: formatCurrency(summary.totalProfit) },
    { label: "Total Discount", amount: formatCurrency(summary.totalDiscount) },
    { label: "Total GST", amount: formatCurrency(summary.totalGst) },
    { label: "Profit Margin", amount: formatPercent(summary.profitMargin) },
  ];

  return (
    <div className={`${styles.report} analytics-report`}>
      <ReportHeader
        title="REVENUE ANALYTICS"
        selectedStore={selectedStore}
        lastSyncedAt={analyticsData?.lastSyncedAt}
      />

      <SummarySection cards={summaryCards} />

      <PerformanceSection
        title="Today's Performance"
        cards={performanceCards}
      />

      <DetailsSection
        title="Financial Breakdown"
        columns={tableColumns}
        data={tableData}
      />

      <ReportFooter reportType="revenue analytics" />
    </div>
  );
};

export default RevenueReportTemplate;
