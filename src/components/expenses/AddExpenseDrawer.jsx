"use client";
import { Receipt, Save } from "lucide-react";
import { useState } from "react";
import { ExpenseForm } from "@/components/expenses";
import { Button, SideDrawer } from "@/components/ui";
import useErrorHandling from "@/hooks/useErrorHandling";
import { useTranslation } from "@/hooks/useTranslation";
import { useUsageQuota } from "@/hooks/useUsageQuota";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createExpense } from "@/store/slices/expensesSlice";

const AddExpenseDrawer = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const { isCreating, error: expenseError } = useAppSelector(
    (state) => state.expenses
  );

  const [loading, setLoading] = useState(false);
  const {
    handleApiError,
    handleApiResult,
    QuotaModal,
    showSuccess,
    setQuotaErrorManually,
  } = useErrorHandling();

  // Get quota information (for validation only, not displayed)
  const { quota, isLoading: quotaLoading } =
    useUsageQuota("expense_management");

  // Check if quota is available (validation only)
  const isQuotaAvailable = () => {
    if (!quota || quotaLoading) return true;
    if (quota.remaining === -1 || quota.limit === -1) return true;
    return quota.remaining > 0 && quota.hasAccess !== false;
  };

  const handleExpenseSubmit = async (formData) => {
    if (!isQuotaAvailable()) {
      const quotaData = quota || {};
      setQuotaErrorManually({
        message:
          quota.remaining === 0
            ? t("expenses.dailyLimitReached", { limit: quota.limit })
            : t("quota.quotaExceeded"),
        quota: quotaData,
        resetTime:
          quota.usageType === "DAILY_FIXED"
            ? "tomorrow"
            : quota.usageType === "MONTHLY_TOTAL"
              ? "next month"
              : null,
        canUpgrade: true,
      });
      return;
    }

    try {
      setLoading(true);
      const expenseData = {
        ...formData,
        store: selectedStore?.storeId,
      };

      const result = await dispatch(createExpense(expenseData));
      const handled = handleApiResult(
        result.payload || result,
        t("expenses.createSuccess"),
        "expense-creation"
      );

      if (handled.type === "success") {
        onClose();
        if (onSuccess) {
          onSuccess(result.payload?.data || result.data);
        }
      }
    } catch (error) {
      handleApiError(error, "expense-creation");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <>
      <SideDrawer
        isOpen={isOpen}
        onClose={handleClose}
        title={t("expenses.addNewExpense")}
        icon={Receipt}
        description={t("expenses.recordNewExpense")}
        width="w-full md:w-2/3 lg:w-1/2"
      >
        <div className="p-3 sm:p-4 md:p-6 h-full">
          <div className="flex flex-col h-full">
            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-6 min-h-0 pb-4">
              <ExpenseForm
                onSubmit={handleExpenseSubmit}
                onCancel={handleClose}
                isLoading={loading || isCreating}
                error={expenseError}
                mode="drawer"
              />
            </div>

            {/* Footer - Action Buttons */}
            <div className="flex-shrink-0 bg-[rgb(var(--color-bg-primary))] border-t border-[rgb(var(--color-border-primary))] p-3 sm:p-4 -mx-3 sm:-mx-4 md:-mx-6 -mb-3 sm:-mb-4 md:-mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-2 sm:gap-3">
              <Button
                variant="success"
                onClick={() => {
                  const form = document.querySelector("form");
                  if (form) form.requestSubmit();
                }}
                disabled={loading || isCreating}
                loading={loading || isCreating}
                leftIcon={Save}
                className="w-full sm:w-auto"
                size="sm"
              >
                {t("expenses.saveExpense")}
              </Button>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={loading || isCreating}
                className="w-full sm:w-auto"
                size="sm"
              >
                {t("common.cancel")}
              </Button>
            </div>
          </div>
        </div>
      </SideDrawer>

      {QuotaModal}
    </>
  );
};

export default AddExpenseDrawer;
