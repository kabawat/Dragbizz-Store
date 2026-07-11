"use client";
import { Button, Input, Select } from "@/components/ui";
import { IndianRupee, Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import staffService from "@/service/retailer/staff.service";
import useApiResponse from "@/hooks/useApiResponse";
import { buildStaffOptions, getStaffId, isActiveStaff } from "./MarkAttendanceDrawer";

const PAYMENT_MODES = ["CASH", "UPI", "BANK_TRANSFER", "CHEQUE"];

function formatDateInput(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function monthStartEnd(dateStr) {
  const date = new Date(dateStr);
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { periodStart: formatDateInput(start), periodEnd: formatDateInput(end) };
}

export default function StaffSalaryTab({ storeId, staffList = [] }) {
  const { t } = useTranslation();
  const { execute, loading } = useApiResponse();
  const [records, setRecords] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    staff: "",
    amount: "",
    periodMonth: formatDateInput().slice(0, 7),
    paymentMode: "CASH",
    notes: "",
    confirmWithoutAttendance: false,
  });

  const staffOptions = useMemo(() => buildStaffOptions(staffList), [staffList]);
  const activeStaff = useMemo(() => staffList.filter(isActiveStaff), [staffList]);

  const paymentModeOptions = useMemo(
    () =>
      PAYMENT_MODES.map((mode) => ({
        value: mode,
        label: mode.replace("_", " "),
      })),
    [],
  );

  const loadRecords = useCallback(async () => {
    if (!storeId) return;
    const result = await execute(staffService.listSalary(storeId), { showToast: false });
    if (result?.success && Array.isArray(result.data)) {
      setRecords(result.data);
    }
  }, [storeId, execute]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const submitSalary = async (confirmWithoutAttendance = false) => {
    if (!storeId || !form.staff || !form.amount) return;
    const { periodStart, periodEnd } = monthStartEnd(`${form.periodMonth}-01`);
    const payload = {
      staff: form.staff,
      amount: Number(form.amount),
      periodStart,
      periodEnd,
      paymentMode: form.paymentMode,
      notes: form.notes || undefined,
      confirmWithoutAttendance,
    };
    const result = await execute(staffService.createSalary(storeId, payload), {
      message: t("staff.salary.saved") || "Salary payment saved",
    });
    if (result?.success) {
      setForm((prev) => ({ ...prev, amount: "", notes: "", confirmWithoutAttendance: false }));
      setShowConfirm(false);
      await loadRecords();
      return;
    }
    if (result?.code === "ATTENDANCE_REQUIRED_OR_CONFIRM") {
      setShowConfirm(true);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await submitSalary(form.confirmWithoutAttendance);
  };

  return (
    <div className="space-y-4">
      {showConfirm && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
          <p className="mb-3 text-amber-800">
            {t("staff.salary.noAttendanceConfirm") ||
              "No attendance found for this pay period. Confirm to record salary anyway."}
          </p>
          <div className="flex gap-2">
            <Button type="button" onClick={() => submitSalary(true)}>
              {t("staff.salary.confirmPay") || "Confirm and pay"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setShowConfirm(false)}>
              {t("common.cancel") || "Cancel"}
            </Button>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-3 rounded-xl border border-[rgb(var(--color-border-primary)/0.4)] bg-[rgb(var(--color-bg-primary))] p-4 md:grid-cols-2"
      >
        <Select
          label={t("staff.salary.staff") || "Staff member"}
          placeholder={t("staff.attendance.selectStaff") || "Select staff"}
          value={form.staff}
          onChange={(value) => setForm((prev) => ({ ...prev, staff: value }))}
          options={staffOptions}
          clearable={false}
          required
        />

        <Input
          type="number"
          label={t("staff.salary.amount") || "Amount"}
          value={form.amount}
          onChange={(value) => setForm((prev) => ({ ...prev, amount: value }))}
          min="0"
          step="0.01"
          required
        />

        <Input
          type="month"
          label={t("staff.salary.period") || "Pay period"}
          value={form.periodMonth}
          onChange={(value) => setForm((prev) => ({ ...prev, periodMonth: value }))}
          required
        />

        <Select
          label={t("staff.salary.paymentMode") || "Payment mode"}
          value={form.paymentMode}
          onChange={(value) => setForm((prev) => ({ ...prev, paymentMode: value }))}
          options={paymentModeOptions}
          clearable={false}
        />

        <div className="flex justify-end md:col-span-2">
          <Button type="submit" leftIcon={IndianRupee} disabled={loading || !form.staff}>
            {t("staff.salary.record") || "Record salary"}
          </Button>
        </div>
      </form>

      <div className="overflow-hidden rounded-xl border border-[rgb(var(--color-border-primary)/0.4)] bg-[rgb(var(--color-bg-primary))]">
        {loading && records.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-[rgb(var(--color-text-secondary))]">
            <Loader2 size={16} className="animate-spin" />
            {t("staff.salary.loading") || "Loading salary payments..."}
          </div>
        ) : records.length === 0 ? (
          <p className="py-12 text-center text-sm text-[rgb(var(--color-text-secondary))]">
            {t("staff.salary.empty") || "No salary payments recorded yet."}
          </p>
        ) : (
          <div className="divide-y divide-[rgb(var(--color-border-primary)/0.3)]">
            {records.map((record) => {
              const staff = activeStaff.find((s) => {
                const staffId = getStaffId(s);
                return staffId === record.staff || staffId === record.staffId;
              });
              return (
                <div
                  key={record.id || record._id}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                      {staff?.name || record.staff} · ₹{record.amount}
                    </p>
                    <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                      {record.paymentMode} · {record.paidAt || record.periodStart}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
