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

const StockReportTemplate = ({ analyticsData, selectedStore }) => {
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '₹0.00';
    return `₹${Number(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatNumber = (num) => (num || 0).toLocaleString('en-IN');

  const totals = analyticsData?.totals || {
    totalSkus: 0,
    totalQuantity: 0,
    availableQuantity: 0,
    reservedQuantity: 0,
    soldQuantity: 0,
    lowStockItems: 0,
    outOfStockItems: 0
  };

  const valueSummary = analyticsData?.valueSummary || {
    averageCost: 0,
    totalStockValue: 0
  };

  const summaryCards = [
    {
      title: 'Total SKUs',
      value: formatNumber(totals.totalSkus),
      change: `${formatNumber(totals.availableQuantity)} available`
    },
    {
      title: 'Total Quantity',
      value: formatNumber(totals.totalQuantity),
      change: 'All items'
    },
    {
      title: 'Low Stock Items',
      value: formatNumber(totals.lowStockItems),
      change: 'Needs attention'
    },
    {
      title: 'Out of Stock',
      value: formatNumber(totals.outOfStockItems),
      change: 'Urgent action needed'
    }
  ];

  const tableColumns = [
    { label: 'Category', key: 'label' },
    { label: 'Value', key: 'amount', align: 'right' }
  ];

  const tableData = [
    { label: 'Total SKUs', amount: formatNumber(totals.totalSkus) },
    { label: 'Total Quantity', amount: formatNumber(totals.totalQuantity) },
    { label: 'Available Quantity', amount: formatNumber(totals.availableQuantity) },
    { label: 'Reserved Quantity', amount: formatNumber(totals.reservedQuantity) },
    { label: 'Sold Quantity', amount: formatNumber(totals.soldQuantity) },
    { label: 'Total Stock Value', amount: formatCurrency(valueSummary.totalStockValue) },
    { label: 'Average Cost', amount: formatCurrency(valueSummary.averageCost) }
  ];

  return (
    <div className={`${styles.report} analytics-report`}>
      <ReportHeader title="STOCK ANALYTICS" selectedStore={selectedStore} />

      <SummarySection cards={summaryCards} />

      <DetailsSection
        title="Stock Breakdown"
        columns={tableColumns}
        data={tableData}
      />

      <ReportFooter reportType="stock analytics" />
    </div>
  );
};

export default StockReportTemplate;