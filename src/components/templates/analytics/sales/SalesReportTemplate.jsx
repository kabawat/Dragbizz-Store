"use client";
import { SalesReportTemplateView } from "@dragorbit/features/analytics";

import {
  DetailsSection,
  ReportFooter,
  ReportHeader,
  SummarySection,
} from "../common";
import styles from "../common/analyticsReport.module.scss";

const SalesReportTemplate = ({ analyticsData, selectedStore }) => {
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "₹0.00";
    return `₹${Number(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatNumber = (num) => (num || 0).toLocaleString("en-IN");

  const counts = analyticsData?.counts || {
    totalInvoices: 0,
    releasedInvoices: 0,
    draftInvoices: 0,
    cancelledInvoices: 0,
  };

  const amounts = analyticsData?.amounts || {
    totalAmount: 0,
    averageOrderValue: 0,
  };

  const today = analyticsData?.today || {
    totalInvoices: 0,
    releasedInvoices: 0,
  };

  const summaryCards = [
    {
      title: "Total Invoices",
      value: formatNumber(counts.totalInvoices),
      change: `${formatNumber(counts.releasedInvoices)} released, ${formatNumber(counts.draftInvoices)} draft`,
    },
    {
      title: "Released Invoices",
      value: formatNumber(counts.releasedInvoices),
      change: `Total: ${formatCurrency(amounts.totalAmount)}`,
    },
    {
      title: "Draft Invoices",
      value: formatNumber(counts.draftInvoices),
      change: "Pending release",
    },
    {
      title: "Cancelled Invoices",
      value: formatNumber(counts.cancelledInvoices),
      change: "Cancelled",
    },
  ];

  const todayPerformanceCards = [
    {
      title: "Today's Invoices",
      value: formatNumber(today.totalInvoices),
      change: `${formatNumber(today.releasedInvoices)} released`,
    },
    {
      title: "Average Order Value",
      value: formatCurrency(amounts.averageOrderValue),
      change: "Per invoice",
    },
  ];

  const tableColumns = [
    { label: "Category", key: "label" },
    { label: "Count", key: "amount", align: "right" },
  ];

  const tableData = [
    { label: "Total Invoices", amount: formatNumber(counts.totalInvoices) },
    {
      label: "Released Invoices",
      amount: formatNumber(counts.releasedInvoices),
    },
    { label: "Draft Invoices", amount: formatNumber(counts.draftInvoices) },
    {
      label: "Cancelled Invoices",
      amount: formatNumber(counts.cancelledInvoices),
    },
    { label: "Total Amount", amount: formatCurrency(amounts.totalAmount) },
  ];

  return (
    <SalesReportTemplateView
      model={{
        styles,
        ReportHeader,
        selectedStore,
        SummarySection,
        summaryCards,
        DetailsSection,
        todayPerformanceCards,
        tableColumns,
        tableData,
        ReportFooter,
      }}
    />
  );
};

export default SalesReportTemplate;
