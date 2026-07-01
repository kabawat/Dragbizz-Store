"use client";

function formatAmount(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(Number(amount) || 0);
}

export function KhataBalanceCard({ totalDue = 0, label, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))] p-5 shadow-sm ${className}`}
    >
      <p className="text-sm text-[rgb(var(--color-text-secondary))]">{label}</p>
      <p className="text-3xl font-bold tabular-nums text-[rgb(var(--color-text-primary))] mt-1">
        {formatAmount(totalDue)}
      </p>
    </div>
  );
}

export default KhataBalanceCard;
