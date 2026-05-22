"use client";
import {
  DetailsSection,
  ReportFooter,
  ReportHeader,
  SummarySection,
} from "../common";
import styles from "../common/analyticsReport.module.scss";

const CustomersReportTemplate = ({ analyticsData, selectedStore }) => {
  const formatNumber = (num) => (num || 0).toLocaleString("en-IN");

  const newCustomers = analyticsData?.newCustomers || {
    last1Day: 0,
    last7Days: 0,
    last15Days: 0,
    last30Days: 0,
    last3Months: 0,
    last6Months: 0,
    last12Months: 0,
  };

  const totalCustomers = analyticsData?.totalCustomers || 0;

  const summaryCards = [
    {
      title: "Total Customers",
      value: formatNumber(totalCustomers),
      change: "All customers",
    },
    {
      title: "Today's Customers",
      value: formatNumber(newCustomers.last1Day),
      change: "New today",
    },
    {
      title: "Last 7 Days",
      value: formatNumber(newCustomers.last7Days),
      change: "New customers",
    },
    {
      title: "Last 30 Days",
      value: formatNumber(newCustomers.last30Days),
      change: "New customers",
    },
  ];

  const tableColumns = [
    { label: "Period", key: "label" },
    { label: "New Customers", key: "amount", align: "right" },
  ];

  const tableData = [
    { label: "Last 1 Day", amount: formatNumber(newCustomers.last1Day) },
    { label: "Last 7 Days", amount: formatNumber(newCustomers.last7Days) },
    { label: "Last 15 Days", amount: formatNumber(newCustomers.last15Days) },
    { label: "Last 30 Days", amount: formatNumber(newCustomers.last30Days) },
    { label: "Last 3 Months", amount: formatNumber(newCustomers.last3Months) },
    { label: "Last 6 Months", amount: formatNumber(newCustomers.last6Months) },
    {
      label: "Last 12 Months",
      amount: formatNumber(newCustomers.last12Months),
    },
  ];

  return (
    <div className={`${styles.report} analytics-report`}>
      <ReportHeader title="CUSTOMERS ANALYTICS" selectedStore={selectedStore} />

      <SummarySection cards={summaryCards} />

      <DetailsSection
        title="Customer Growth Breakdown"
        columns={tableColumns}
        data={tableData}
      />

      <ReportFooter reportType="customers analytics" />
    </div>
  );
};

export default CustomersReportTemplate;
