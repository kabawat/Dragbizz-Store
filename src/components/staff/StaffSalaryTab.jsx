"use client";
import { StaffSalaryTabView } from "@dragorbit/features/management";

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

  const activeStaff = useMemo(
    () => staffList.filter(isActiveStaff),
    [staffList],
  );

  const loadRecords = useCallback(async () => {
    if (!storeId) return;
    const { from, to } = getMonthDateRange(viewMonth);
    const result = await execute(
      staffService.listSalary(storeId, { from, to }),
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

  const monthLabel = formatMonthLabel(
    viewMonth,
    locale === "hi" ? "hi-IN" : "en-IN",
  );

  return (
    <StaffSalaryTabView
      model={{
        t,
        monthLabel,
        onOpenRecordDrawer,
        storeId,
        setViewMonth,
        shiftMonth,
        formatMonthInput,
        records,
        formatAmount,
        summary,
        PAYMENT_MODES,
        PaymentModeBadge,
        loading,
        activeStaff,
        getStaffId,
        formatDateShort,
      }}
    />
  );
}
