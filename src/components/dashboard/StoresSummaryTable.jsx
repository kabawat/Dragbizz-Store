"use client";

import { DataTable } from "@dragorbit/ui/table";
import { Building2, LayoutDashboard } from "lucide-react";
import { useTranslation } from "@/hooks/ui/useTranslation";

const numberValue = (value) => {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric : 0;
};
const formatNumber = (value) => numberValue(value).toLocaleString("en-IN");

export const StoresSummaryTable = ({ data = [], loading = false }) => {
  const { t } = useTranslation();
  const columns = [
    {
      id: "store",
      header: t("common.store"),
      width: 240,
      pin: "left",
      cell: (store) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))]">
            <Building2 className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="break-words font-medium">{store.storeName}</span>
        </div>
      ),
    },
    ...[
      ["revenue", "totalRevenue", true, "text-green-600 dark:text-green-400"],
      ["profit", "totalProfit", true, "text-emerald-600 dark:text-emerald-400"],
      ["customers", "totalCustomers", false, ""],
      ["products", "totalProducts", false, ""],
      ["stockValue", "stockValue", true, ""],
      ["outOfStock", "outOfStock", false, ""],
      [
        "payables",
        "totalPayables",
        true,
        "text-orange-600 dark:text-orange-400",
      ],
    ].map(([id, label, currency, color]) => ({
      id,
      header: t(`dashboard.${label}`),
      width: 160,
      align: "right",
      cell: (store) =>
        id === "outOfStock" ? (
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums ${numberValue(store[id]) > 0 ? "bg-red-500/10 text-red-600 dark:text-red-400" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"}`}
          >
            {formatNumber(store[id])}
          </span>
        ) : (
          <span
            className={`whitespace-nowrap tabular-nums ${currency ? "font-semibold" : ""} ${color}`}
          >
            {currency ? "₹" : ""}
            {formatNumber(store[id])}
          </span>
        ),
    })),
  ];

  return (
    <DataTable
      rows={data ?? []}
      columns={columns}
      getRowKey={(store) => store._id}
      caption={t("dashboard.storesSummary")}
      loading={loading}
      loadingContent={
        <div className="mx-auto h-16 max-w-lg animate-pulse rounded-lg bg-[rgb(var(--color-bg-tertiary))]">
          <span className="sr-only">{t("common.loading")}</span>
        </div>
      }
      emptyContent={
        <div className="flex flex-col items-center gap-3">
          <Building2 className="h-8 w-8 opacity-40" aria-hidden="true" />
          <p>{t("dashboard.noData")}</p>
        </div>
      }
      minWidth={1360}
      maxHeight={480}
      className="!rounded-2xl !shadow-none"
      toolbar={
        <div className="flex items-center gap-3 border-b border-[rgb(var(--color-border-primary))] p-4 sm:p-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))]">
            <LayoutDashboard className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
            {t("dashboard.storesSummary")}
          </h2>
          {!loading && (
            <span className="ml-auto rounded-full bg-[rgb(var(--color-bg-tertiary))] px-3 py-1 text-sm font-medium text-[rgb(var(--color-text-secondary))]">
              {formatNumber(data?.length)}
            </span>
          )}
        </div>
      }
    />
  );
};
