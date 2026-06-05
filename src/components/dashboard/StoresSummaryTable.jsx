"use client";
import React from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { 
  Building2, 
  IndianRupee, 
  Users, 
  Package, 
  Warehouse, 
  AlertTriangle, 
  TrendingUp,
  Receipt
} from "lucide-react";

export const StoresSummaryTable = ({ data = [], loading = false }) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="w-full h-48 bg-[rgb(var(--color-bg-primary))]/20 animate-pulse rounded-lg" />
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center bg-[rgb(var(--color-bg-primary))]/20 rounded-lg border border-[rgb(var(--color-border-primary))]/50">
        <p className="text-[rgb(var(--color-text-secondary))]">{t("dashboard.noData")}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[rgb(var(--color-border-primary))]/50">
            <th className="px-4 py-3 text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">
              {t("common.store")}
            </th>
            <th className="px-4 py-3 text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase tracking-wider text-right">
              {t("dashboard.totalRevenue")}
            </th>
            <th className="px-4 py-3 text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase tracking-wider text-right">
              {t("dashboard.totalProfit")}
            </th>
            <th className="px-4 py-3 text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase tracking-wider text-right">
              {t("dashboard.totalCustomers")}
            </th>
            <th className="px-4 py-3 text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase tracking-wider text-right">
              {t("dashboard.totalProducts")}
            </th>
            <th className="px-4 py-3 text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase tracking-wider text-right">
              {t("dashboard.stockValue")}
            </th>
            <th className="px-4 py-3 text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase tracking-wider text-right">
              {t("dashboard.outOfStock")}
            </th>
            <th className="px-4 py-3 text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase tracking-wider text-right">
              {t("dashboard.totalPayables")}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[rgb(var(--color-border-primary))]/30">
          {data.map((store) => (
            <tr key={store._id} className="hover:bg-[rgb(var(--color-bg-primary))]/30 transition-colors">
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-[rgb(var(--color-primary))]/20 flex items-center justify-center mr-3 text-[rgb(var(--color-primary))]">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                    {store.storeName}
                  </span>
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-semibold text-green-600">
                ₹{store.revenue.toLocaleString("en-IN")}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-semibold text-emerald-600">
                ₹{store.profit.toLocaleString("en-IN")}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-[rgb(var(--color-text-secondary))]">
                {store.customers}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-[rgb(var(--color-text-secondary))]">
                {store.products}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium text-[rgb(var(--color-text-primary))]">
                ₹{store.stockValue.toLocaleString("en-IN")}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-right">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${store.outOfStock > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  {store.outOfStock}
                </span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-semibold text-orange-600">
                ₹{store.payables.toLocaleString("en-IN")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
