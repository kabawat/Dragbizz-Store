"use client";
import React, { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { createExpense } from "@/store/slices/expensesSlice";
import { useUsageQuota } from "@/hooks/useUsageQuota";
import { useToast } from "@/hooks/useToast";
import { extractFieldErrors } from "@/utils/validationErrorHandler";
import {
  SideDrawer,
  ToastContainer,
  ErrorModal,
  Button,
} from "@/components/ui";
import { QuotaExceededModal } from "@/components/common";
import { ExpenseForm } from "@/components/expenses";
import { Save, Receipt } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const AddExpenseDrawer = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const { isCreating, error: expenseError } = useAppSelector(
    (state) => state.expenses,
  );

  const [loading, setLoading] = useState(false);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [quotaError, setQuotaError] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { toasts, showSuccess, removeToast } = useToast();

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
      setQuotaError({
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
      setShowQuotaModal(true);
      return;
    }

    try {
      setLoading(true);
      setQuotaError(null);
      setShowQuotaModal(false);

      const expenseData = {
        ...formData,
        store: selectedStore?.storeId,
      };

      const result = await dispatch(createExpense(expenseData));

      if (result.payload?.success) {
        // Show success toast
        showSuccess(t("expenses.createSuccess"));
        // Close drawer
        onClose();
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess(result.payload.data);
        }
      } else {
        // Check if it's a quota exceeded error (403)
        const errorData = result.payload?.error || {};
        const isQuotaError =
          result?.statusCode === 403 ||
          errorData.error === "Quota Exceeded" ||
          errorData.error === "Forbidden" ||
          result.payload?.message?.includes("Quota exceeded") ||
          result.payload?.message?.includes("limit reached") ||
          result.payload?.message?.includes("Quota Exceeded");

        if (isQuotaError) {
          const quotaData = errorData.data || errorData || {};
          setQuotaError({
            message:
              result.payload?.message ||
              errorData.message ||
              t("quota.quotaExceeded"),
            quota: quotaData.quota || quotaData,
            resetTime: quotaData.resetTime || null,
            canUpgrade: quotaData.canUpgrade !== false,
          });
          setShowQuotaModal(true);
        } else {
          // Handle validation errors
          const fieldErrors = extractFieldErrors(
            result.payload?.error || result.payload,
          );
          if (Object.keys(fieldErrors).length > 0) {
            // Field errors will be handled by the form component
          } else {
            setErrorMessage(
              result.payload?.message || t("expenses.createError"),
            );
            setShowErrorModal(true);
          }
        }
      }
    } catch (error) {
      // Handle API error response
      if (error.response && error.response.data) {
        const errorData = error.response.data;

        // Check for quota exceeded error (403)
        if (
          error.response.status === 403 &&
          (errorData.error === "Quota Exceeded" ||
            errorData.error === "Forbidden")
        ) {
          const quotaData = errorData.data || {};
          setQuotaError({
            message: errorData.message || t("quota.quotaExceeded"),
            quota: quotaData.quota || quotaData,
            resetTime: quotaData.resetTime || null,
            canUpgrade: quotaData.canUpgrade !== false,
          });
          setShowQuotaModal(true);
        } else {
          // Handle validation errors
          const fieldErrors = extractFieldErrors(errorData);
          if (Object.keys(fieldErrors).length > 0) {
            // Field errors will be handled by the form component
          } else {
            setErrorMessage(errorData.message || t("expenses.createError"));
            setShowErrorModal(true);
          }
        }
      } else {
        // Handle other types of errors
        setErrorMessage(t("common.error"));
        setShowErrorModal(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setQuotaError(null);
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

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Error Modal */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title={t("common.error")}
        message={errorMessage}
      />

      {/* Quota Exceeded Modal */}
      <QuotaExceededModal
        isOpen={showQuotaModal}
        onClose={() => {
          setShowQuotaModal(false);
          setQuotaError(null);
        }}
        message={quotaError?.message || t("quota.quotaExceeded")}
        quota={quotaError?.quota || null}
        resetTime={quotaError?.resetTime || null}
        canUpgrade={quotaError?.canUpgrade !== false}
      />
    </>
  );
};

export default AddExpenseDrawer;
