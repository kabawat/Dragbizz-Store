"use client";
import { Button, Input, Select } from "@/components/ui";
import { CalendarCheck } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import staffService from "@/service/retailer/staff.service";
import useApiResponse from "@/hooks/useApiResponse";

const ATTENDANCE_STATUSES = ["PRESENT", "ABSENT", "HALF_DAY", "LEAVE"];

function formatDateInput(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getStaffId(staff) {
  return staff?._id ?? staff?.serverId ?? staff?.localId ?? staff?.id ?? "";
}

export function isActiveStaff(staff) {
  return String(staff?.status || "").toUpperCase() === "ACTIVE";
}

export function buildStaffOptions(staffList = []) {
  return staffList
    .filter(isActiveStaff)
    .map((staff) => ({
      value: getStaffId(staff),
      label: staff.name || staff.email || "Staff",
    }))
    .filter((option) => option.value);
}

export default function MarkAttendanceDrawer({
  storeId,
  staffList = [],
  onSuccess,
  onCancel,
}) {
  const { t } = useTranslation();
  const { execute, loading } = useApiResponse();
  const [form, setForm] = useState({
    staff: "",
    date: formatDateInput(),
    status: "PRESENT",
    notes: "",
  });

  const statusOptions = useMemo(
    () =>
      ATTENDANCE_STATUSES.map((status) => ({
        value: status,
        label: t(`staff.attendance.statuses.${status}`) || status.replace("_", " "),
      })),
    [t],
  );

  const staffOptions = useMemo(() => buildStaffOptions(staffList), [staffList]);

  const resetForm = useCallback(() => {
    setForm({
      staff: "",
      date: formatDateInput(),
      status: "PRESENT",
      notes: "",
    });
  }, []);

  const handleClose = () => {
    resetForm();
    onCancel?.();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!storeId || !form.staff) return;

    const payload = {
      staff: form.staff,
      date: form.date,
      status: form.status,
      notes: form.notes || undefined,
    };

    const result = await execute(staffService.createAttendance(storeId, payload), {
      message: t("staff.attendance.saved") || "Attendance saved",
    });

    if (result?.success) {
      resetForm();
      onSuccess?.(form.date);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
        {staffOptions.length === 0 ? (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800">
            {t("staff.attendance.noActiveStaff") ||
              "No active staff members found. Add or activate team members before marking attendance."}
          </div>
        ) : (
          <Select
            label={t("staff.attendance.staff") || "Staff member"}
            placeholder={t("staff.attendance.selectStaff") || "Select staff"}
            value={form.staff}
            onChange={(value) => setForm((prev) => ({ ...prev, staff: value }))}
            options={staffOptions}
            clearable={false}
            required
          />
        )}

        <Input
          type="date"
          label={t("staff.attendance.date") || "Date"}
          value={form.date}
          onChange={(value) => setForm((prev) => ({ ...prev, date: value }))}
          required
        />

        <Select
          label={t("staff.attendance.status") || "Status"}
          value={form.status}
          onChange={(value) => setForm((prev) => ({ ...prev, status: value }))}
          options={statusOptions}
          clearable={false}
        />

        <Input
          type="text"
          label={t("staff.attendance.notes") || "Notes"}
          placeholder={t("staff.attendance.notesPlaceholder") || "Optional note"}
          value={form.notes}
          onChange={(value) => setForm((prev) => ({ ...prev, notes: value }))}
        />

        <p className="text-xs text-[rgb(var(--color-text-secondary))]">
          {t("staff.attendance.formHint") || "Attendance is saved for the selected date."}
        </p>
      </div>

      <div className="flex flex-shrink-0 flex-col-reverse gap-2 border-t border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))] p-4 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={handleClose}>
          {t("common.cancel") || "Cancel"}
        </Button>
        <Button
          type="submit"
          leftIcon={CalendarCheck}
          disabled={loading || !form.staff || staffOptions.length === 0}
        >
          {t("staff.attendance.mark") || "Mark attendance"}
        </Button>
      </div>
    </form>
  );
}
