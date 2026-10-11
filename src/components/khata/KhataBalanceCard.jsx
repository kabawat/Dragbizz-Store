"use client";
import { KhataBalanceCardPresentation } from "@dragorbit/features/khata";

import { useTranslation } from "@/hooks/ui/useTranslation";

function formatAmount(amount) {
  return `₹${(Number(amount) || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function MetricTile({
  label,
  value,
  icon: Icon,
  gradient,
  iconClass,
  valueClass,
}) {
  return (
    <div
      className={`relative p-4 bg-gradient-to-br ${gradient} rounded-xl overflow-hidden`}
    >
      <Icon
        className={`absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 ${iconClass}`}
        aria-hidden
      />
      <div className="relative z-10 pr-10">
        <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">
          {label}
        </p>
        <p className={`text-lg font-bold tabular-nums ${valueClass}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

export function KhataBalanceCard({
  account,
  className = "",
  onRecordTransaction,
  showRecordButton = false,
}) {
  const { t } = useTranslation();
  const totalDue = Number(account?.totalDue) || 0;
  const totalSpent = Number(account?.totalAmount) || 0;
  const totalInvoices = Number(account?.totalInvoices) || 0;
  const itemsBought = Number(account?.totalItemsPurchased) || 0;
  const hasDue = totalDue > 0;
  const hasAdvance = totalDue < 0;

  const balanceLabel = hasAdvance
    ? t("khata.balanceAdvance")
    : t("khata.balance");
  const balanceValue = hasAdvance
    ? formatAmount(Math.abs(totalDue))
    : formatAmount(totalDue);

  return (
    <KhataBalanceCardPresentation
      model={{
        className,
        t,
        showRecordButton,
        onRecordTransaction,
        hasDue,
        MetricTile,
        balanceLabel,
        balanceValue,
        hasAdvance,
        formatAmount,
        totalSpent,
        totalInvoices,
        itemsBought,
      }}
    />
  );
}

export default KhataBalanceCard;
