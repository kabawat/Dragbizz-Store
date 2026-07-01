"use client";

import { EmptyState } from "@/components/ui";
import { Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/ui/useTranslation";

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
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function KhataLedgerList({
  entries = [],
  loading = false,
  error = null,
  title,
  emptyTitle,
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
    <div className="space-y-2">
      {title ? <h4 className="text-sm font-semibold">{title}</h4> : null}
      <ul className="divide-y divide-[rgb(var(--color-border-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] overflow-hidden">
        {entries.map((entry) => {
          const isYouGave = entry.label === "youGave";
          const dateHeader = formatDateHeader(entry.date);
          const showHeader = dateHeader && dateHeader !== lastDateHeader;
          if (showHeader) lastDateHeader = dateHeader;

          return (
            <li key={`${entry.kind}-${entry.id}`}>
              {showHeader ? (
                <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wide bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-text-secondary))]">
                  {dateHeader}
                </div>
              ) : null}
              <div className="flex items-center justify-between gap-3 px-4 py-3 bg-[rgb(var(--color-bg-primary))]">
                <div className="min-w-0">
                  <p className={`text-sm font-semibold ${isYouGave ? "text-red-600" : "text-green-600"}`}>
                    {t(`khata.${entry.label}`)}
                  </p>
                  <p className="text-xs text-[rgb(var(--color-text-secondary))] truncate">
                    {entry.reference}
                    {entry.paymentMode ? ` · ${entry.paymentMode}` : ""}
                  </p>
                  {entry.notes ? (
                    <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-0.5 truncate">
                      {entry.notes}
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
                    <p className="text-xs text-[rgb(var(--color-text-secondary))] tabular-nums">
                      {t("khata.balance")}: {formatAmount(entry.runningBalance)}
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
