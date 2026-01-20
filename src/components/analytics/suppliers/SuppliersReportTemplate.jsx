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

const SuppliersReportTemplate = ({ analyticsData, selectedStore }) => {
  const formatNumber = (num) => (num || 0).toLocaleString('en-IN');

  const totals = analyticsData?.totals || {
    totalSuppliers: 0,
    activeSuppliers: 0,
    inactiveSuppliers: 0
  };

  const summaryCards = [
    {
      title: 'Total Suppliers',
      value: formatNumber(totals.totalSuppliers),
      change: `${formatNumber(totals.activeSuppliers)} active, ${formatNumber(totals.inactiveSuppliers)} inactive`
    },
    {
      title: 'Active Suppliers',
      value: formatNumber(totals.activeSuppliers),
      change: 'Currently active'
    },
    {
      title: 'Inactive Suppliers',
      value: formatNumber(totals.inactiveSuppliers),
      change: 'Not active'
    },
    {
      title: 'Total Count',
      value: formatNumber(totals.totalSuppliers),
      change: 'All suppliers'
    }
  ];

  const tableColumns = [
    { label: 'Category', key: 'label' },
    { label: 'Count', key: 'amount', align: 'right' }
  ];

  const tableData = [
    { label: 'Total Suppliers', amount: formatNumber(totals.totalSuppliers) },
    { label: 'Active Suppliers', amount: formatNumber(totals.activeSuppliers) },
    { label: 'Inactive Suppliers', amount: formatNumber(totals.inactiveSuppliers) }
  ];

  return (
    <div className={`${styles.report} analytics-report`}>
      <ReportHeader title="SUPPLIERS ANALYTICS" selectedStore={selectedStore} />

      <SummarySection cards={summaryCards} />

      <DetailsSection
        title="Suppliers Breakdown"
        columns={tableColumns}
        data={tableData}
      />

      <ReportFooter reportType="suppliers analytics" />
    </div>
  );
};

export default SuppliersReportTemplate;