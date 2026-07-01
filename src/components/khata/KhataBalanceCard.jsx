"use client";

import { Badge } from "@/components/ui";
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

  return (
    <div
      className={`rounded-2xl border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))] p-5 shadow-sm ${className}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">{t("khata.balance")}</p>
            {totalDue > 0 ? (
              <Badge variant="danger" size="sm" className="rounded-full">
                {t("khata.toCollect")}
              </Badge>
            ) : null}
          </div>
          <p className="text-4xl font-bold tabular-nums text-[rgb(var(--color-text-primary))] mt-2 tracking-tight">
            {formatAmount(totalDue)}
          </p>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 sm:text-right">
          <div>
            <p className="text-xs text-[rgb(var(--color-text-secondary))]">{t("khata.totalSpent")}</p>
            <p className="text-sm font-semibold tabular-nums">{formatCompact(totalSpent)}</p>
          </div>
          <div>
            <p className="text-xs text-[rgb(var(--color-text-secondary))]">{t("khata.invoices")}</p>
            <p className="text-sm font-semibold tabular-nums">{totalInvoices}</p>
          </div>
          <div>
            <p className="text-xs text-[rgb(var(--color-text-secondary))]">{t("khata.itemsBought")}</p>
            <p className="text-sm font-semibold tabular-nums">{itemsBought}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KhataBalanceCard;
