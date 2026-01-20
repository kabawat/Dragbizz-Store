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

const ExpensesReportTemplate = ({ analyticsData, selectedStore }) => {
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '₹0.00';
    return `₹${Number(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatNumber = (num) => (num || 0).toLocaleString('en-IN');

  const counts = analyticsData?.counts || {
    totalExpenses: 0,
    paidExpenses: 0,
    pendingExpenses: 0
  };

  const amounts = analyticsData?.amounts || {
    totalAmount: 0,
    netAmount: 0,
    gstAmount: 0
  };

  const summaryCards = [
    {
      title: 'Total Expenses',
      value: formatNumber(counts.totalExpenses),
      change: `${formatNumber(counts.paidExpenses)} paid, ${formatNumber(counts.pendingExpenses)} pending`
    },
    {
      title: 'Paid Expenses',
      value: formatNumber(counts.paidExpenses),
      change: `Total: ${formatCurrency(amounts.totalAmount)}`
    },
    {
      title: 'Pending Expenses',
      value: formatNumber(counts.pendingExpenses),
      change: 'Pending payment'
    },
    {
      title: 'Total Amount',
      value: formatCurrency(amounts.totalAmount),
      change: 'All expenses'
    }
  ];

  const tableColumns = [
    { label: 'Category', key: 'label' },
    { label: 'Amount', key: 'amount', align: 'right' }
  ];

  const tableData = [
    { label: 'Total Amount', amount: formatCurrency(amounts.totalAmount) },
    { label: 'Net Amount', amount: formatCurrency(amounts.netAmount) },
    { label: 'GST Amount', amount: formatCurrency(amounts.gstAmount) },
    { label: 'Paid Expenses', amount: formatNumber(counts.paidExpenses) },
    { label: 'Pending Expenses', amount: formatNumber(counts.pendingExpenses) }
  ];

  return (
    <div className={`${styles.report} analytics-report`}>
      <ReportHeader title="EXPENSES ANALYTICS" selectedStore={selectedStore} />

      <SummarySection cards={summaryCards} />

      <DetailsSection
        title="Financial Breakdown"
        columns={tableColumns}
        data={tableData}
      />

      <ReportFooter reportType="expenses analytics" />
    </div>
  );
};

export default ExpensesReportTemplate;