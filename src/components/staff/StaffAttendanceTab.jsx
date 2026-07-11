"use client";
import { Button, EmptyState } from "@/components/ui";
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Loader2,
  UserCheck,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import staffService from "@/service/retailer/staff.service";
import useApiResponse from "@/hooks/useApiResponse";
import { formatDateShort } from "@/utils/dateFormatter";
import { getStaffId, isActiveStaff } from "./MarkAttendanceDrawer";

const ATTENDANCE_STATUSES = ["PRESENT", "ABSENT", "HALF_DAY", "LEAVE"];

const STATUS_STYLES = {
  PRESENT: {
    badge: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  ABSENT: {
    badge: "bg-rose-500/10 text-rose-700 border-rose-500/20",
    dot: "bg-rose-500",
  },
  HALF_DAY: {
    badge: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    dot: "bg-amber-500",
  },
  LEAVE: {
    badge: "bg-sky-500/10 text-sky-700 border-sky-500/20",
    dot: "bg-sky-500",
  },
};

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

function AttendanceStatusBadge({ status, label }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.PRESENT;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${style.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {label}
    </span>
  );
}

export default function StaffAttendanceTab({
  storeId,
  staffList = [],
  onOpenMarkDrawer,
  refreshKey = 0,
  savedDate = null,
}) {
  const { t, locale } = useTranslation();
  const { execute, loading } = useApiResponse();
  const [records, setRecords] = useState([]);
  const [viewMonth, setViewMonth] = useState(formatMonthInput());

  const activeStaff = useMemo(() => staffList.filter(isActiveStaff), [staffList]);

  const loadRecords = useCallback(async () => {
    if (!storeId) return;
    const { from, to } = getMonthDateRange(viewMonth);
    const result = await execute(staffService.listAttendance(storeId, { from, to }), {
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
    if (!savedDate) return;
    const savedMonth = savedDate.slice(0, 7);
    if (savedMonth !== viewMonth) {
      setViewMonth(savedMonth);
    }
  }, [savedDate, viewMonth]);

  const handleOpenMarkDrawer = () => {
    onOpenMarkDrawer?.();
  };

  const summary = useMemo(() => {
    const counts = { PRESENT: 0, ABSENT: 0, HALF_DAY: 0, LEAVE: 0 };
    records.forEach((record) => {
      if (counts[record.status] !== undefined) {
        counts[record.status] += 1;
      }
    });
    return counts;
  }, [records]);

  const monthLabel = formatMonthLabel(viewMonth, locale === "hi" ? "hi-IN" : "en-IN");

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-[rgb(var(--color-border-primary)/0.45)] bg-[rgb(var(--color-bg-primary))] overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[rgb(var(--color-border-primary)/0.35)] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-text-secondary))]">
              <ClipboardList className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                {t("staff.attendance.recordsTitle") || "Monthly records"}
              </h3>
              <p className="text-xs text-[rgb(var(--color-text-secondary))]">{monthLabel}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
            <Button
              type="button"
              leftIcon={CalendarCheck}
              onClick={handleOpenMarkDrawer}
              disabled={!storeId}
              className="w-full sm:w-auto"
            >
              {t("staff.attendance.mark") || "Mark attendance"}
            </Button>

            <button
              type="button"
              onClick={() => setViewMonth((prev) => shiftMonth(prev, -1))}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-text-secondary))] transition-colors hover:text-[rgb(var(--color-text-primary))]"
              aria-label={t("staff.attendance.previousMonth") || "Previous month"}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMonth(formatMonthInput())}
              className="rounded-lg border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-secondary))] px-3 py-1.5 text-xs font-medium text-[rgb(var(--color-text-primary))] transition-colors hover:bg-[rgb(var(--color-bg-tertiary))]"
            >
              {t("staff.attendance.thisMonth") || "This month"}
            </button>
            <button
              type="button"
              onClick={() => setViewMonth((prev) => shiftMonth(prev, 1))}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-text-secondary))] transition-colors hover:text-[rgb(var(--color-text-primary))]"
              aria-label={t("staff.attendance.nextMonth") || "Next month"}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {records.length > 0 && (
          <div className="flex flex-wrap gap-2 border-b border-[rgb(var(--color-border-primary)/0.3)] bg-[rgb(var(--color-bg-secondary)/0.35)] px-4 py-3 sm:px-5">
            {ATTENDANCE_STATUSES.map((status) => (
              <div
                key={status}
                className="inline-flex items-center gap-2 rounded-lg border border-[rgb(var(--color-border-primary)/0.35)] bg-[rgb(var(--color-bg-primary))] px-3 py-1.5"
              >
                <AttendanceStatusBadge
                  status={status}
                  label={t(`staff.attendance.statuses.${status}`) || status.replace("_", " ")}
                />
                <span className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                  {summary[status]}
                </span>
              </div>
            ))}
          </div>
        )}

        {loading && records.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-14 text-sm text-[rgb(var(--color-text-secondary))]">
            <Loader2 size={16} className="animate-spin" />
            {t("staff.attendance.loading") || "Loading attendance..."}
          </div>
        ) : records.length === 0 ? (
          <EmptyState
            size="sm"
            className="border-0 bg-transparent py-10"
            icon={UserCheck}
            title={t("staff.attendance.emptyTitle") || "No attendance yet"}
            description={t("staff.attendance.empty") || "No attendance records for this month."}
            actionButton={{
              label: t("staff.attendance.mark") || "Mark attendance",
              onClick: handleOpenMarkDrawer,
              icon: CalendarCheck,
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[rgb(var(--color-bg-secondary)/0.55)] text-xs uppercase tracking-wide text-[rgb(var(--color-text-secondary))]">
                <tr>
                  <th className="px-4 py-3 font-medium sm:px-5">{t("staff.attendance.staff") || "Staff member"}</th>
                  <th className="px-4 py-3 font-medium sm:px-5">{t("staff.attendance.date") || "Date"}</th>
                  <th className="px-4 py-3 font-medium sm:px-5">{t("staff.attendance.status") || "Status"}</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell sm:px-5">
                    {t("staff.attendance.notes") || "Notes"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--color-border-primary)/0.3)]">
                {records.map((record) => {
                  const staff = activeStaff.find((s) => {
                    const staffId = getStaffId(s);
                    return staffId === record.staff || staffId === record.staffId;
                  });
                  const status = record.status || "PRESENT";
                  return (
                    <tr
                      key={record.id || record._id}
                      className="transition-colors hover:bg-[rgb(var(--color-bg-secondary)/0.35)]"
                    >
                      <td className="px-4 py-3.5 font-medium text-[rgb(var(--color-text-primary))] sm:px-5">
                        {staff?.name || record.staff}
                      </td>
                      <td className="px-4 py-3.5 text-[rgb(var(--color-text-secondary))] sm:px-5">
                        {formatDateShort(record.dateKey || record.date)}
                      </td>
                      <td className="px-4 py-3.5 sm:px-5">
                        <AttendanceStatusBadge
                          status={status}
                          label={t(`staff.attendance.statuses.${status}`) || status.replace("_", " ")}
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
