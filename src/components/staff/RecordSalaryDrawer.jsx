"use client";
import { RecordSalaryDrawerView } from "@dragorbit/features/management";

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
  return {
    periodStart: formatDateInput(start),
    periodEnd: formatDateInput(end),
  };
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
    <RecordSalaryDrawerView
      model={{
        handleSubmit,
        showConfirm,
        t,
        submitSalary,
        setShowConfirm,
        staffOptions,
        form,
        setForm,
        paymentModeOptions,
        isOnline: true,
        handleClose,
        loading,
      }}
    />
  );
}
