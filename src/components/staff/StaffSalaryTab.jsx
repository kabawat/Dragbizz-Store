"use client";
import { Button, EmptyState } from "@/components/ui";
import {
  ChevronLeft,
  ChevronRight,
  IndianRupee,
  Loader2,
  Wallet,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import staffService from "@/service/retailer/staff.service";
import useApiResponse from "@/hooks/useApiResponse";
import { formatDateShort } from "@/utils/dateFormatter";
import { getStaffId, isActiveStaff } from "./MarkAttendanceDrawer";

const PAYMENT_MODES = ["CASH", "UPI", "BANK_TRANSFER", "CHEQUE"];

function formatMonthInput(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function shiftMonth(monthValue, delta) {
  const [year, month] = monthValue.split("-").map(Number);
  const next = new Date(year, month - 1 + delta, 1);
  return formatMonthInput(next);
}

function formatMonthLabel(monthValue, locale = "en-IN") {
  const [year, month] = monthValue.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
  });
}

function getMonthDateRange(monthValue) {
  const [year, month] = monthValue.split("-").map(Number);
  const from = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const to = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { from, to };
}

function formatAmount(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function PaymentModeBadge({ label }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[rgb(var(--color-border-primary)/0.35)] bg-[rgb(var(--color-bg-secondary)/0.6)] px-2.5 py-1 text-xs font-medium text-[rgb(var(--color-text-primary))]">
      {label}
    </span>
  );
}

export default function StaffSalaryTab({
  storeId,
  staffList = [],
  onOpenRecordDrawer,
  refreshKey = 0,
  savedPeriodMonth = null,
}) {
  const { t, locale } = useTranslation();
  const { execute, loading } = useApiResponse();
  const [records, setRecords] = useState([]);
  const [viewMonth, setViewMonth] = useState(formatMonthInput());

  const activeStaff = useMemo(() => staffList.filter(isActiveStaff), [staffList]);

  const loadRecords = useCallback(async () => {
    if (!storeId) return;
    const { from, to } = getMonthDateRange(viewMonth);
    const result = await execute(staffService.listSalary(storeId, { from, to }), {
      showToast: false,
    });
    if (result?.success && Array.isArray(result.data)) {
      setRecords(result.data);
    }
  }, [storeId, viewMonth, execute]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshKey]);

  useEffect(() => {
    if (!savedPeriodMonth) return;
    if (savedPeriodMonth !== viewMonth) {
      setViewMonth(savedPeriodMonth);
    }
  }, [savedPeriodMonth, viewMonth]);

  const summary = useMemo(() => {
    const totals = { amount: 0, count: 0 };
    const byMode = {};
    PAYMENT_MODES.forEach((mode) => {
      byMode[mode] = 0;
    });
    records.forEach((record) => {
      totals.count += 1;
      totals.amount += Number(record.amount || 0);
      const mode = record.paymentMode || "CASH";
      if (byMode[mode] !== undefined) {
        byMode[mode] += 1;
      }
    });
    return { totals, byMode };
  }, [records]);

  const monthLabel = formatMonthLabel(viewMonth, locale === "hi" ? "hi-IN" : "en-IN");

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-[rgb(var(--color-border-primary)/0.45)] bg-[rgb(var(--color-bg-primary))] overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[rgb(var(--color-border-primary)/0.35)] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-text-secondary))]">
              <Wallet className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                {t("staff.salary.recordsTitle") || "Monthly payments"}
              </h3>
              <p className="text-xs text-[rgb(var(--color-text-secondary))]">{monthLabel}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
            <Button
              type="button"
              leftIcon={IndianRupee}
              onClick={() => onOpenRecordDrawer?.()}
              disabled={!storeId}
              className="w-full sm:w-auto"
            >
              {t("staff.salary.record") || "Record salary"}
            </Button>

            <button
              type="button"
              onClick={() => setViewMonth((prev) => shiftMonth(prev, -1))}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-text-secondary))] transition-colors hover:text-[rgb(var(--color-text-primary))]"
              aria-label={t("staff.salary.previousMonth") || "Previous month"}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMonth(formatMonthInput())}
              className="rounded-lg border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-secondary))] px-3 py-1.5 text-xs font-medium text-[rgb(var(--color-text-primary))] transition-colors hover:bg-[rgb(var(--color-bg-tertiary))]"
            >
              {t("staff.salary.thisMonth") || "This month"}
            </button>
            <button
              type="button"
              onClick={() => setViewMonth((prev) => shiftMonth(prev, 1))}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-text-secondary))] transition-colors hover:text-[rgb(var(--color-text-primary))]"
              aria-label={t("staff.salary.nextMonth") || "Next month"}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {records.length > 0 && (
          <div className="flex flex-wrap gap-2 border-b border-[rgb(var(--color-border-primary)/0.3)] bg-[rgb(var(--color-bg-secondary)/0.35)] px-4 py-3 sm:px-5">
            <div className="inline-flex items-center gap-2 rounded-lg border border-[rgb(var(--color-border-primary)/0.35)] bg-[rgb(var(--color-bg-primary))] px-3 py-1.5">
              <span className="text-xs font-medium text-[rgb(var(--color-text-secondary))]">
                {t("staff.salary.totalAmount") || "Total paid"}
              </span>
              <span className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                {formatAmount(summary.totals.amount)}
              </span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-[rgb(var(--color-border-primary)/0.35)] bg-[rgb(var(--color-bg-primary))] px-3 py-1.5">
              <span className="text-xs font-medium text-[rgb(var(--color-text-secondary))]">
                {t("staff.salary.totalPayments") || "Payments"}
              </span>
              <span className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                {summary.totals.count}
              </span>
            </div>
            {PAYMENT_MODES.filter((mode) => summary.byMode[mode] > 0).map((mode) => (
              <div
                key={mode}
                className="inline-flex items-center gap-2 rounded-lg border border-[rgb(var(--color-border-primary)/0.35)] bg-[rgb(var(--color-bg-primary))] px-3 py-1.5"
              >
                <PaymentModeBadge
                  label={t(`staff.salary.paymentModes.${mode}`) || mode.replace("_", " ")}
                />
                <span className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                  {summary.byMode[mode]}
                </span>
              </div>
            ))}
          </div>
        )}

        {loading && records.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-14 text-sm text-[rgb(var(--color-text-secondary))]">
            <Loader2 size={16} className="animate-spin" />
            {t("staff.salary.loading") || "Loading salary payments..."}
          </div>
        ) : records.length === 0 ? (
          <EmptyState
            size="sm"
            className="border-0 bg-transparent py-10"
            icon={Wallet}
            title={t("staff.salary.emptyTitle") || "No salary payments yet"}
            description={t("staff.salary.empty") || "No salary payments recorded for this month."}
            actionButton={{
              label: t("staff.salary.record") || "Record salary",
              onClick: () => onOpenRecordDrawer?.(),
              icon: IndianRupee,
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[rgb(var(--color-bg-secondary)/0.55)] text-xs uppercase tracking-wide text-[rgb(var(--color-text-secondary))]">
                <tr>
                  <th className="px-4 py-3 font-medium sm:px-5">{t("staff.salary.staff") || "Staff member"}</th>
                  <th className="px-4 py-3 font-medium sm:px-5">{t("staff.salary.period") || "Pay period"}</th>
                  <th className="px-4 py-3 font-medium sm:px-5">{t("staff.salary.amount") || "Amount"}</th>
                  <th className="px-4 py-3 font-medium sm:px-5">{t("staff.salary.paymentMode") || "Payment mode"}</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell sm:px-5">
                    {t("staff.salary.notes") || "Notes"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--color-border-primary)/0.3)]">
                {records.map((record) => {
                  const staff = activeStaff.find((s) => {
                    const staffId = getStaffId(s);
                    return staffId === record.staff || staffId === record.staffId;
                  });
                  const mode = record.paymentMode || "CASH";
                  return (
                    <tr
                      key={record.id || record._id}
                      className="transition-colors hover:bg-[rgb(var(--color-bg-secondary)/0.35)]"
                    >
                      <td className="px-4 py-3.5 font-medium text-[rgb(var(--color-text-primary))] sm:px-5">
                        {staff?.name || record.staff}
                      </td>
                      <td className="px-4 py-3.5 text-[rgb(var(--color-text-secondary))] sm:px-5">
                        {formatDateShort(record.periodStart)}
                        {record.periodEnd ? ` – ${formatDateShort(record.periodEnd)}` : ""}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-[rgb(var(--color-text-primary))] sm:px-5">
                        {formatAmount(record.amount)}
                      </td>
                      <td className="px-4 py-3.5 sm:px-5">
                        <PaymentModeBadge
                          label={t(`staff.salary.paymentModes.${mode}`) || mode.replace("_", " ")}
                        />
                      </td>
                      <td className="hidden px-4 py-3.5 text-[rgb(var(--color-text-secondary))] md:table-cell sm:px-5">
                        {record.notes || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
