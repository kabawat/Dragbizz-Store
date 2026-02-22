"use client";
import React from 'react';
import RevenueChart from "@/components/analytics/revenue/RevenueChart";
import SalesChart from "@/components/analytics/sales/SalesChart";
import CustomersChart from "@/components/analytics/customers/CustomersChart";
import ProductsChart from "@/components/analytics/products/ProductsChart";
import StockChart from "@/components/analytics/stock/StockChart";
import SuppliersChart from "@/components/analytics/suppliers/SuppliersChart";
import BillsChart from "@/components/analytics/bills/BillsChart";

const AnalyticsRow = ({ label, value, chart }) => (
    <div className="space-y-4">
        <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[rgb(var(--color-text-secondary))] opacity-80 uppercase tracking-tight">
                {label}
            </span>
            <span className="text-xl font-bold text-[rgb(var(--color-text-primary))] tabular-nums">
                {value}
            </span>
        </div>
        <div className="h-48 overflow-hidden rounded-xl bg-[rgb(var(--color-bg-secondary))]/10">
            {chart}
        </div>
    </div>
);

export const RevenueAnalytics = () => (
    <AnalyticsRow label="Total Revenue" value="₹0" chart={<RevenueChart type="area" />} />
);

export const SalesAnalytics = () => (
    <AnalyticsRow label="Total Sales" value="0" chart={<SalesChart type="bar" />} />
);

export const StockAnalytics = () => (
    <AnalyticsRow label="Total Value" value="₹0" chart={<StockChart type="line" />} />
);

export const CustomerAnalytics = () => (
    <AnalyticsRow label="Total Count" value="0" chart={<CustomersChart type="multi-line" />} />
);

export const BillAnalytics = () => (
    <AnalyticsRow label="Total Amount" value="₹0" chart={<BillsChart type="line" />} />
);
