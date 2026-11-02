"use client";
import { ProductsReportTemplateView } from "@dragorbit/features/analytics";

import {
  DetailsSection,
  ReportFooter,
  ReportHeader,
  SummarySection,
} from "../common";
import styles from "../common/analyticsReport.module.scss";

const ProductsReportTemplate = ({ analyticsData, selectedStore }) => {
  const formatNumber = (num) => (num || 0).toLocaleString("en-IN");

  const totals = analyticsData?.totals || {
    totalProducts: 0,
    activeProducts: 0,
    inactiveProducts: 0,
  };

  const summaryCards = [
    {
      title: "Total Products",
      value: formatNumber(totals.totalProducts),
      change: `${formatNumber(totals.activeProducts)} active, ${formatNumber(totals.inactiveProducts)} inactive`,
    },
    {
      title: "Active Products",
      value: formatNumber(totals.activeProducts),
      change: "Currently active",
    },
    {
      title: "Inactive Products",
      value: formatNumber(totals.inactiveProducts),
      change: "Not active",
    },
    {
      title: "Total Count",
      value: formatNumber(totals.totalProducts),
      change: "All products",
    },
  ];

  const tableColumns = [
    { label: "Category", key: "label" },
    { label: "Count", key: "amount", align: "right" },
  ];

  const tableData = [
    { label: "Total Products", amount: formatNumber(totals.totalProducts) },
    { label: "Active Products", amount: formatNumber(totals.activeProducts) },
    {
      label: "Inactive Products",
      amount: formatNumber(totals.inactiveProducts),
    },
  ];

  return (
    <ProductsReportTemplateView
      model={{
        styles,
        ReportHeader,
        selectedStore,
        SummarySection,
        summaryCards,
        DetailsSection,
        tableColumns,
        tableData,
        ReportFooter,
      }}
    />
  );
};

export default ProductsReportTemplate;
