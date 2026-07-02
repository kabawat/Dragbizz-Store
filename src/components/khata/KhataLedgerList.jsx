"use client";

import { ArrowDownLeft, ArrowUpRight, Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { EmptyState } from "@/components/ui";

function formatAmount(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(Number(amount) || 0);
}

function formatDateHeader(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date
    .toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    .toUpperCase();
}

function formatPaymentMode(mode) {
  if (!mode) return "";
  return String(mode).replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildEntryMeta(entry) {
  const parts = [entry.reference, formatPaymentMode(entry.paymentMode), entry.notes].filter(Boolean);
  return parts.join(" · ");
}

export function KhataLedgerList({
  entries = [],
  loading = false,
  error = null,
  title,
  emptyTitle,
  className = "",
}) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-[rgb(var(--color-text-secondary))]">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        {t("common.loading")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!entries.length) {
    return (
      <EmptyState title={emptyTitle ?? t("khata.noEntries")} description={t("khata.addFirstEntry")} />
    );
  }

  let lastDateHeader = "";

  return (
    <div className={`rounded-2xl border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))] shadow-sm overflow-hidden flex flex-col ${className}`}>
      {title ? (
        <div className="px-5 py-4 border-b border-[rgb(var(--color-border-primary))] shrink-0 bg-[rgb(var(--color-bg-secondary))]/20">
          <h4 className="text-base font-semibold">{title}</h4>
        </div>
      ) : null}
      <ul className="overflow-y-auto flex-1 min-h-0">
        {entries.map((entry) => {
          const isYouGave = entry.label === "youGave";
          const dateHeader = formatDateHeader(entry.date);
          const showHeader = dateHeader && dateHeader !== lastDateHeader;
          if (showHeader) lastDateHeader = dateHeader;
          const meta = buildEntryMeta(entry);

          return (
            <li key={`${entry.kind}-${entry.id}`}>
              {showHeader ? (
                <div className="px-5 py-2 text-[11px] font-semibold tracking-wide bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-text-secondary))]">
                  {dateHeader}
                </div>
              ) : null}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-[rgb(var(--color-border-primary))] last:border-b-0">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                    isYouGave ? "bg-red-500/10 text-red-600" : "bg-green-500/10 text-green-600"
                  }`}
                >
                  {isYouGave ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownLeft className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-semibold ${isYouGave ? "text-red-600" : "text-green-600"}`}
                  >
                    {t(`khata.${entry.label}`)}
                  </p>
                  {meta ? (
                    <p className="text-xs text-[rgb(var(--color-text-secondary))] truncate mt-0.5">
                      {meta}
                    </p>
                  ) : null}
                </div>
                <div className="text-right shrink-0">
                  <p
                    className={`text-sm font-bold tabular-nums ${isYouGave ? "text-red-600" : "text-green-600"}`}
                  >
                    {isYouGave ? "-" : "+"}
                    {formatAmount(entry.amount)}
                  </p>
                  {entry.runningBalance != null ? (
                    <p className="text-xs text-[rgb(var(--color-text-secondary))] tabular-nums mt-0.5">
                      {t("khata.balance")} {formatAmount(entry.runningBalance)}
                    </p>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default KhataLedgerList;
