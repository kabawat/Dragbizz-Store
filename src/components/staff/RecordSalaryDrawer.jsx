"use client";
import { Button, Input, Select } from "@/components/ui";
import { IndianRupee } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import staffService from "@/service/retailer/staff.service";
import useApiResponse from "@/hooks/useApiResponse";
import { buildStaffOptions } from "./MarkAttendanceDrawer";

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

export default function RecordSalaryDrawer({
  storeId,
  staffList = [],
  onSuccess,
  onCancel,
}) {
  const { t } = useTranslation();
  const { execute, loading } = useApiResponse();
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    staff: "",
    amount: "",
    periodMonth: formatDateInput().slice(0, 7),
    paymentMode: "CASH",
    notes: "",
  });

  const staffOptions = useMemo(() => buildStaffOptions(staffList), [staffList]);

  const paymentModeOptions = useMemo(
    () =>
      PAYMENT_MODES.map((mode) => ({
        value: mode,
        label: t(`staff.salary.paymentModes.${mode}`) || mode.replace("_", " "),
      })),
    [t],
  );

  const resetForm = useCallback(() => {
    setShowConfirm(false);
    setForm({
      staff: "",
      amount: "",
      periodMonth: formatDateInput().slice(0, 7),
      paymentMode: "CASH",
      notes: "",
    });
  }, []);

  const handleClose = () => {
    resetForm();
    onCancel?.();
  };

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
      resetForm();
      onSuccess?.(form.periodMonth);
      return;
    }
    if (result?.code === "ATTENDANCE_REQUIRED_OR_CONFIRM") {
      setShowConfirm(true);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await submitSalary(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
        {showConfirm && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800">
            <p className="mb-3">
              {t("staff.salary.noAttendanceConfirm") ||
                "No attendance found for this pay period. Confirm to record salary anyway."}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" onClick={() => submitSalary(true)}>
                {t("staff.salary.confirmPay") || "Confirm and pay"}
              </Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => setShowConfirm(false)}>
                {t("common.cancel") || "Cancel"}
              </Button>
            </div>
          </div>
        )}

        {staffOptions.length === 0 ? (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800">
            {t("staff.salary.noActiveStaff") ||
              "No active staff members found. Add or activate team members before recording salary."}
          </div>
        ) : (
          <Select
            label={t("staff.salary.staff") || "Staff member"}
            placeholder={t("staff.attendance.selectStaff") || "Select staff"}
            value={form.staff}
            onChange={(value) => setForm((prev) => ({ ...prev, staff: value }))}
            options={staffOptions}
            clearable={false}
            required
          />
        )}

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

        <Input
          type="text"
          label={t("staff.salary.notes") || "Notes"}
          placeholder={t("staff.salary.notesPlaceholder") || "Optional note"}
          value={form.notes}
          onChange={(value) => setForm((prev) => ({ ...prev, notes: value }))}
        />

        <p className="text-xs text-[rgb(var(--color-text-secondary))]">
          {t("staff.salary.formHint") || "Salary is recorded for the selected pay period."}
        </p>
      </div>

      <div className="flex flex-shrink-0 flex-col-reverse gap-2 border-t border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))] p-4 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={handleClose}>
          {t("common.cancel") || "Cancel"}
        </Button>
        <Button
          type="submit"
          leftIcon={IndianRupee}
          disabled={loading || !form.staff || !form.amount || staffOptions.length === 0}
        >
          {t("staff.salary.record") || "Record salary"}
        </Button>
      </div>
    </form>
  );
}
