"use client";
import { useEffect, useState } from "react";
import { Alert, Input, Select, Textarea } from "@/components/ui";
import {
  EXPENSE_CATEGORIES,
  EXPENSE_STATUS,
  EXPENSE_GST_RATES,
  PAYMENT_METHODS,
} from "@/data/constants/expenses";
import { useTranslation } from "@/hooks/ui/useTranslation";

// ── GST Rate options for Select ──────────────────────────────────────
const GST_RATE_OPTIONS = EXPENSE_GST_RATES.map((r) => ({
  value: String(r.value),
  label: r.label,
}));

const ExpenseForm = ({
  onSubmit = null,
  error = null,
  expense = null,
  formRef = null,
  mode = "page", // 'page' or 'drawer'
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: "",
    billNumber: "",
    date: new Date().toISOString().split("T")[0],
    category: "office-supplies",
    amount: "",
    paymentMethod: "CASH",
    vendor: "",
    status: "PAID",
    description: "",
    // ── GST Fields ──
    gstIncluded: false,
    gstRate: "18",
    isRcm: false,
  });

  const [errors, setErrors] = useState({});

  // ── Derived: net amount & GST amount ────────────────────────────────
  const derivedGst = (() => {
    const amt = parseFloat(formData.amount) || 0;
    const rate = parseFloat(formData.gstRate) || 0;
    if (!rate || !amt) return { gstAmount: 0, netAmount: amt };

    if (formData.gstIncluded) {
      const gstAmount = (amt * rate) / (100 + rate);
      return {
        gstAmount: Math.round(gstAmount * 100) / 100,
        netAmount: Math.round((amt - gstAmount) * 100) / 100,
      };
    } else {
      const gstAmount = (amt * rate) / 100;
      return {
        gstAmount: Math.round(gstAmount * 100) / 100,
        netAmount: amt,
      };
    }
  })();

  // ── Populate form when editing ───────────────────────────────────────
  useEffect(() => {
    if (expense) {
      setFormData({
        title: expense.title || "",
        billNumber: expense.billNumber || "",
        date: expense.date
          ? new Date(expense.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        category:
          expense.category?.name || expense.category || "office-supplies",
        amount: expense.amount || "",
        paymentMethod: expense.paymentMethod || "CASH",
        vendor: expense.vendor?.name || expense.vendor || "",
        status: expense.status || "PAID",
        description: expense.description || "",
        // GST fields
        gstIncluded: expense.gstIncluded ?? false,
        gstRate: String(expense.gst?.percentage ?? 18),
        isRcm: expense.isRcm ?? false,
      });
    }
  }, [expense]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleCheckbox = (field) => {
    setFormData((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = t("expenses.titleRequired");
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = t("expenses.amountRequired");
    }
    if (!formData.date) {
      newErrors.date = t("expenses.dateRequired");
    }
    if (!formData.category) {
      newErrors.category = t("expenses.categoryRequired");
    }
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = t("expenses.paymentMethodRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const gstRate = parseFloat(formData.gstRate) || 0;

    const submitData = {
      title: formData.title,
      billNumber: formData.billNumber,
      date: formData.date,
      category: formData.category,
      amount: parseFloat(formData.amount),
      paymentMethod: formData.paymentMethod,
      vendor: formData.vendor ? { name: formData.vendor } : null,
      status: formData.status,
      description: formData.description,
      // ── GST fields ──
      gstIncluded: formData.gstIncluded,
      gst: {
        percentage: gstRate,
        amount: derivedGst.gstAmount,
      },
      netAmount: derivedGst.netAmount,
      isRcm: formData.isRcm,
      itcClaimable: formData.isRcm ? derivedGst.gstAmount : 0,
    };

    onSubmit(submitData);
  };

  return (
    <div
      className={
        mode === "drawer"
          ? ""
          : "bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-6"
      }
    >
      {error && (
        <Alert className="mb-6" variant="error">
          {error}
        </Alert>
      )}

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="space-y-4 sm:space-y-6"
      >
        {/* ── Basic Information ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
              {t("expenses.expenseTitle")} *
            </label>
            <Input
              size="sm"
              value={formData.title}
              onChange={(value) => handleInputChange("title", value)}
              placeholder={t("expenses.enterExpenseTitle")}
              error={errors.title}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
              {t("expenses.billNumber")}
            </label>
            <Input
              size="sm"
              value={formData.billNumber}
              onChange={(value) => handleInputChange("billNumber", value)}
              placeholder={t("expenses.enterBillNumber")}
            />
          </div>
        </div>

        {/* ── Date and Category ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
              {t("expenses.date")} *
            </label>
            <Input
              size="sm"
              type="date"
              value={formData.date}
              onChange={(value) => handleInputChange("date", value)}
              error={errors.date}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
              {t("expenses.category")} *
            </label>
            <Select
              size="sm"
              value={formData.category}
              onChange={(value) => handleInputChange("category", value)}
              options={EXPENSE_CATEGORIES.map((cat) => ({
                value: cat.value,
                label: cat.label,
              }))}
              error={errors.category}
            />
          </div>
        </div>

        {/* ── Amount ── */}
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
            {t("expenses.amount")} *
          </label>
          <Input
            size="sm"
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={(value) => handleInputChange("amount", value)}
            placeholder={t("expenses.enterAmount")}
            error={errors.amount}
          />
        </div>

        {/* ── GST Section ── */}
        <div className="bg-[rgb(var(--color-bg-secondary))]/40 rounded-lg p-4 border border-[rgb(var(--color-border-primary))]/30 space-y-4">
          <h4 className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
            GST Details
          </h4>

          {/* GST Rate + Tax Included */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                GST Rate
              </label>
              <Select
                size="sm"
                value={formData.gstRate}
                onChange={(value) => handleInputChange("gstRate", value)}
                options={GST_RATE_OPTIONS}
              />
            </div>

            {/* Tax Included Checkbox */}
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  onClick={() => handleCheckbox("gstIncluded")}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${formData.gstIncluded
                    ? "bg-[rgb(var(--color-primary))] border-[rgb(var(--color-primary))]"
                    : "border-[rgb(var(--color-border-primary))] bg-transparent"
                    }`}
                >
                  {formData.gstIncluded && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-[rgb(var(--color-text-primary))]">
                  Tax Included in Amount
                </span>
              </label>
              <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-1 ml-7">
                {formData.gstIncluded
                  ? "GST is already included in the entered amount"
                  : "GST will be added on top of the entered amount"}
              </p>
            </div>
          </div>

          {/* RCM Checkbox */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div
                onClick={() => handleCheckbox("isRcm")}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${formData.isRcm
                  ? "bg-orange-500 border-orange-500"
                  : "border-[rgb(var(--color-border-primary))] bg-transparent"
                  }`}
              >
                {formData.isRcm && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-[rgb(var(--color-text-primary))]">
                RCM Applicable (Reverse Charge Mechanism)
              </span>
            </label>
            {formData.isRcm && (
              <p className="text-xs text-orange-500 mt-1 ml-7">
                ⚠️ You are liable to pay GST under RCM. ITC will be claimable.
              </p>
            )}
          </div>

          {/* GST Preview */}
          {parseFloat(formData.amount) > 0 && parseFloat(formData.gstRate) > 0 && (
            <div className="bg-[rgb(var(--color-bg-primary))]/50 rounded-md p-3 border border-[rgb(var(--color-border-primary))]/20 text-xs space-y-1">
              <div className="flex justify-between text-[rgb(var(--color-text-secondary))]">
                <span>Net Taxable Value:</span>
                <span className="font-medium text-[rgb(var(--color-text-primary))]">
                  ₹{derivedGst.netAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-[rgb(var(--color-text-secondary))]">
                <span>GST ({formData.gstRate}%):</span>
                <span className="font-medium text-[rgb(var(--color-text-primary))]">
                  ₹{derivedGst.gstAmount.toFixed(2)}
                </span>
              </div>
              {formData.isRcm && (
                <div className="flex justify-between text-orange-500">
                  <span>ITC Claimable (RCM):</span>
                  <span className="font-medium">₹{derivedGst.gstAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-[rgb(var(--color-border-primary))]/20 pt-1 font-semibold">
                <span className="text-[rgb(var(--color-text-primary))]">Total Amount:</span>
                <span className="text-[rgb(var(--color-text-primary))]">
                  ₹{(formData.gstIncluded
                    ? parseFloat(formData.amount)
                    : derivedGst.netAmount + derivedGst.gstAmount
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── Payment Method, Vendor, Status ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
              {t("expenses.paymentMethod")} *
            </label>
            <Select
              size="sm"
              value={formData.paymentMethod}
              onChange={(value) => handleInputChange("paymentMethod", value)}
              options={PAYMENT_METHODS.map((method) => ({
                value: method.value,
                label: `${method.icon} ${method.label}`,
              }))}
              error={errors.paymentMethod}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
              {t("expenses.vendor")}
            </label>
            <Input
              size="sm"
              value={formData.vendor}
              onChange={(value) => handleInputChange("vendor", value)}
              placeholder={t("expenses.enterVendorName")}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
              {t("expenses.status")}
            </label>
            <Select
              size="sm"
              value={formData.status}
              onChange={(value) => handleInputChange("status", value)}
              options={EXPENSE_STATUS.map((status) => ({
                value: status.value,
                label: status.label,
              }))}
            />
          </div>
        </div>

        {/* ── Description ── */}
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
            {t("expenses.description")}
          </label>
          <Textarea
            value={formData.description}
            onChange={(value) => handleInputChange("description", value)}
            placeholder={t("expenses.enterExpenseDescription")}
            rows={3}
          />
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;
