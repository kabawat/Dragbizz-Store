"use client";
import { useEffect, useState } from "react";
import { Alert, Input, Select, Textarea } from "@/components/ui";
import { EXPENSE_CATEGORIES, EXPENSE_STATUS, PAYMENT_METHODS, } from "@/data/constants/expenses";
import { useTranslation } from "@/hooks/useTranslation";
import { calculateGst } from "@/utils/gstCalculator";

const ExpenseForm = ({
  onSubmit = null,
  onCancel = null,
  isLoading = false,
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
    gstRate: 0,
    gstIncluded: false,
    isRcm: false,
    paymentMethod: "CASH",
    vendor: "",
    status: "PAID",
    description: "",
  });

  const [errors, setErrors] = useState({});

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
        gstRate: expense.gst?.percentage || 0,
        gstIncluded: expense.gstIncluded || false,
        isRcm: expense.isRcm || false,
        paymentMethod: expense.paymentMethod || "CASH",
        vendor: expense.vendor?.name || expense.vendor || "",
        status: expense.status || "PAID",
        description: expense.description || "",
      });
    }
  }, [expense]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
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

    if (!validateForm()) {
      return;
    }

    // Calculate GST Split using utility
    // Since expense is usually 1 item
    const { items: [{ taxableValue, gst: { total: gstAmount, itc: itcValue } }] } = calculateGst({
      items: [{
        price: parseFloat(formData.amount),
        quantity: 1,
        gstRate: Number(formData.gstRate),
        isInclusive: formData.gstIncluded
      }],
      supplier: { hasGst: true, stateCode: "" }, // Not relevant for simple split
      buyer: { hasGst: true, stateCode: "" },
      isRcmApplicable: formData.isRcm
    });

    const submitData = {
      title: formData.title,
      billNumber: formData.billNumber,
      date: formData.date,
      category: formData.category,
      amount: parseFloat(formData.amount),
      gst: {
        percentage: Number(formData.gstRate),
        amount: gstAmount
      },
      gstIncluded: formData.gstIncluded,
      netAmount: taxableValue,
      isRcm: formData.isRcm,
      itcClaimable: itcValue,
      paymentMethod: formData.paymentMethod,
      vendor: formData.vendor
        ? {
          name: formData.vendor,
        }
        : null,
      status: formData.status,
      description: formData.description,
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
        {/* Basic Information */}
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

        {/* Date and Category */}
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

        {/* Amount & GST */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-end">
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

          <div>
            <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
              Tax Rate (%)
            </label>
            <Select
              size="sm"
              value={formData.gstRate}
              onChange={(value) => handleInputChange("gstRate", value)}
              options={[0, 5, 12, 18, 28].map((rate) => ({
                value: rate,
                label: `${rate}%`,
              }))}
            />
          </div>

          <div className="flex items-center space-x-2 h-10 mb-1">
            <input
              id="gstIncluded"
              type="checkbox"
              checked={formData.gstIncluded}
              onChange={(e) => handleInputChange("gstIncluded", e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="gstIncluded" className="text-xs font-medium text-[rgb(var(--color-text-secondary))]">
              {t("expenses.taxIncluded")}
            </label>
          </div>

          <div className="flex items-center space-x-2 h-10 mb-1 text-orange-600">
            <input
              id="isRcm"
              type="checkbox"
              checked={formData.isRcm}
              onChange={(e) => handleInputChange("isRcm", e.target.checked)}
              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <label htmlFor="isRcm" className="text-xs font-medium">
              RCM Applicable
            </label>
          </div>
        </div>

        {/* Payment Method and Vendor */}
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

        {/* Description */}
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
