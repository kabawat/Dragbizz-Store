"use client";
import { StaffAttendanceTabView } from "@dragorbit/features/management";

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

  const activeStaff = useMemo(
    () => staffList.filter(isActiveStaff),
    [staffList],
  );

  const loadRecords = useCallback(async () => {
    if (!storeId) return;
    const { from, to } = getMonthDateRange(viewMonth);
    const result = await execute(
      staffService.listAttendance(storeId, { from, to }),
      {
        showToast: false,
      },
    );
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

  const monthLabel = formatMonthLabel(
    viewMonth,
    locale === "hi" ? "hi-IN" : "en-IN",
  );

  return (
    <StaffAttendanceTabView
      model={{
        t,
        monthLabel,
        handleOpenMarkDrawer,
        storeId,
        setViewMonth,
        shiftMonth,
        formatMonthInput,
        records,
        ATTENDANCE_STATUSES,
        AttendanceStatusBadge,
        summary,
        loading,
        activeStaff,
        getStaffId,
        formatDateShort,
      }}
    />
  );
}
