"use client";
import { MarkAttendanceDrawerView } from "@dragorbit/features/management";

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
        label:
          t(`staff.attendance.statuses.${status}`) || status.replace("_", " "),
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

    const result = await execute(
      staffService.createAttendance(storeId, payload),
      {
        message: t("staff.attendance.saved") || "Attendance saved",
      },
    );

    if (result?.success) {
      resetForm();
      onSuccess?.(form.date);
    }
  };

  return (
    <MarkAttendanceDrawerView
      model={{
        handleSubmit,
        staffOptions,
        t,
        form,
        setForm,
        statusOptions,
        isOnline: true,
        handleClose,
        loading,
      }}
    />
  );
}
