"use client";
import React from 'react';
import styles from '../common/analyticsReport.module.scss';
import {
  ReportHeader,
  SummarySection,
  DetailsSection,
  ReportTable,
  ReportFooter
} from '../common';

const SalesReportTemplate = ({ analyticsData, selectedStore }) => {
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '₹0.00';
    return `₹${Number(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatNumber = (num) => (num || 0).toLocaleString('en-IN');

  const counts = analyticsData?.counts || {
    totalInvoices: 0,
    releasedInvoices: 0,
    draftInvoices: 0,
    cancelledInvoices: 0
  };

  const amounts = analyticsData?.amounts || {
    totalAmount: 0,
    averageOrderValue: 0
  };

  const today = analyticsData?.today || {
    totalInvoices: 0,
    releasedInvoices: 0
  };

  const summaryCards = [
    {
      title: 'Total Invoices',
      value: formatNumber(counts.totalInvoices),
      change: `${formatNumber(counts.releasedInvoices)} released, ${formatNumber(counts.draftInvoices)} draft`
    },
    {
      title: 'Released Invoices',
      value: formatNumber(counts.releasedInvoices),
      change: `Total: ${formatCurrency(amounts.totalAmount)}`
    },
    {
      title: 'Draft Invoices',
      value: formatNumber(counts.draftInvoices),
      change: 'Pending release'
    },
    {
      title: 'Cancelled Invoices',
      value: formatNumber(counts.cancelledInvoices),
      change: 'Cancelled'
    }
  ];

  const todayPerformanceCards = [
    {
      title: "Today's Invoices",
      value: formatNumber(today.totalInvoices),
      change: `${formatNumber(today.releasedInvoices)} released`
    },
    {
      title: 'Average Order Value',
      value: formatCurrency(amounts.averageOrderValue),
      change: 'Per invoice'
    }
  ];

  const tableColumns = [
    { label: 'Category', key: 'label' },
    { label: 'Count', key: 'amount', align: 'right' }
  ];

  const tableData = [
    { label: 'Total Invoices', amount: formatNumber(counts.totalInvoices) },
    { label: 'Released Invoices', amount: formatNumber(counts.releasedInvoices) },
    { label: 'Draft Invoices', amount: formatNumber(counts.draftInvoices) },
    { label: 'Cancelled Invoices', amount: formatNumber(counts.cancelledInvoices) },
    { label: 'Total Amount', amount: formatCurrency(amounts.totalAmount) }
  ];

  return (
    <div className={`${styles.report} analytics-report`}>
      <ReportHeader title="SALES ANALYTICS" selectedStore={selectedStore} />

      <SummarySection cards={summaryCards} />

      <DetailsSection title="Today's Performance">
        <SummarySection cards={todayPerformanceCards} />
      </DetailsSection>

      <DetailsSection
        title="Invoice Breakdown"
        columns={tableColumns}
        data={tableData}
      />

      <ReportFooter reportType="sales analytics" />
    </div>
  );
};

export default SalesReportTemplate;