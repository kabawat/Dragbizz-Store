"use client";
import {
  DetailsSection,
  ReportFooter,
  ReportHeader,
  SummarySection,
} from "../common";
import styles from "../common/analyticsReport.module.scss";

const BillsReportTemplate = ({ analyticsData, selectedStore }) => {
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "₹0.00";
    return `₹${Number(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatNumber = (num) => (num || 0).toLocaleString("en-IN");

  const counts = analyticsData?.counts || {
    totalBills: 0,
    paidBills: 0,
    pendingBills: 0,
    overdueBills: 0,
  };

  const amounts = analyticsData?.amounts || {
    totalPayable: 0,
    totalPaid: 0,
    totalDue: 0,
  };

  const summaryCards = [
    {
      title: "Total Bills",
      value: formatNumber(counts.totalBills),
      change: `${formatNumber(counts.paidBills)} paid, ${formatNumber(counts.pendingBills)} pending`,
    },
    {
      title: "Paid Bills",
      value: formatNumber(counts.paidBills),
      change: `Total: ${formatCurrency(amounts.totalPaid)}`,
    },
    {
      title: "Pending Bills",
      value: formatNumber(counts.pendingBills),
      change: `Amount: ${formatCurrency(amounts.totalDue)}`,
    },
    {
      title: "Overdue Bills",
      value: formatNumber(counts.overdueBills),
      change: "Urgent action needed",
    },
  ];

  const tableColumns = [
    { label: "Category", key: "label" },
    { label: "Amount", key: "amount", align: "right" },
  ];

  const tableData = [
    { label: "Total Payable", amount: formatCurrency(amounts.totalPayable) },
    { label: "Total Paid", amount: formatCurrency(amounts.totalPaid) },
    { label: "Total Due", amount: formatCurrency(amounts.totalDue) },
    { label: "Paid Bills", amount: formatNumber(counts.paidBills) },
    { label: "Pending Bills", amount: formatNumber(counts.pendingBills) },
  ];

  return (
    <div className={`${styles.report} analytics-report`}>
      <ReportHeader title="BILLS ANALYTICS" selectedStore={selectedStore} />

      <SummarySection cards={summaryCards} />

      <DetailsSection
        title="Financial Breakdown"
        columns={tableColumns}
        data={tableData}
      />

      <ReportFooter reportType="bills analytics" />
    </div>
  );
};

export default BillsReportTemplate;
