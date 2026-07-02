"use client";

import { Badge } from "@/components/ui";
import { CheckCircle2, FileText, Package, ShoppingBag, Wallet } from "lucide-react";
import { useTranslation } from "@/hooks/ui/useTranslation";

function formatAmount(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(Number(amount) || 0);
}

function formatCompact(amount) {
  const value = Number(amount) || 0;
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(value % 100000 === 0 ? 0 : 1)}L`;
  }
  if (value >= 1000) {
    return `₹${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`;
  }
  return formatAmount(value);
}

export function KhataBalanceCard({ account, className = "" }) {
  const { t } = useTranslation();
  const totalDue = Number(account?.totalDue) || 0;
  const totalSpent = Number(account?.totalAmount) || 0;
  const totalInvoices = Number(account?.totalInvoices) || 0;
  const itemsBought = Number(account?.totalItemsPurchased) || 0;
  const hasDue = totalDue > 0;

  const stats = [
    {
      key: "spent",
      label: t("khata.totalSpent"),
      value: formatCompact(totalSpent),
      icon: ShoppingBag,
      tone: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      key: "invoices",
      label: t("khata.invoices"),
      value: totalInvoices,
      icon: FileText,
      tone: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-500/10",
    },
    {
      key: "items",
      label: t("khata.itemsBought"),
      value: itemsBought,
      icon: Package,
      tone: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
    },
  ];

  return (
    <div
      className={`rounded-2xl border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-secondary))]/25 p-3 sm:p-4 ${className}`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.35fr)_repeat(3,minmax(0,1fr))] gap-3">
        <div
          className={`rounded-xl border p-5 sm:p-6 flex flex-col justify-between min-h-[132px] ${
            hasDue
              ? "border-orange-200/80 dark:border-orange-800/50 bg-gradient-to-br from-orange-50 to-[rgb(var(--color-bg-primary))] dark:from-orange-950/30 dark:to-[rgb(var(--color-bg-primary))]"
              : "border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))]"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
                  hasDue
                    ? "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300"
                    : "bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-text-secondary))]"
                }`}
              >
                <Wallet className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">
                  {t("khata.balance")}
                </p>
                {hasDue ? (
                  <Badge variant="danger" size="sm" className="rounded-full mt-1.5">
                    {t("khata.toCollect")}
                  </Badge>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 mt-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {t("khata.noDue")}
                  </span>
                )}
              </div>
            </div>
          </div>

          <p
            className={`text-3xl sm:text-4xl font-bold tabular-nums tracking-tight mt-4 ${
              hasDue
                ? "text-orange-900 dark:text-orange-200"
                : "text-[rgb(var(--color-text-primary))]"
            }`}
          >
            {formatAmount(totalDue)}
          </p>
        </div>

        {stats.map(({ key, label, value, icon: Icon, tone, bg }) => (
          <div
            key={key}
            className="rounded-xl border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))] p-4 sm:p-5 flex flex-col justify-between min-h-[132px]"
          >
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${bg}`}>
              <Icon className={`h-5 w-5 ${tone}`} />
            </div>
            <div className="mt-4">
              <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] leading-snug">
                {label}
              </p>
              <p className="text-xl sm:text-2xl font-semibold tabular-nums text-[rgb(var(--color-text-primary))] mt-1">
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default KhataBalanceCard;
