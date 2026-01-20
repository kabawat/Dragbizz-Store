"use client";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, IndianRupee } from "lucide-react";

// Import components
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { ExpenseForm } from "@/components/expenses";
import QuotaProgressBar from "@/components/product/QuotaProgressBar";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { createExpense } from "@/store/slices/expensesSlice";
import { useUsageQuota } from "@/hooks/useUsageQuota";
import useErrorHandling from "@/hooks/useErrorHandling";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

const AddExpensePage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { isCreating, error } = useAppSelector((state) => state.expenses);
  const { selectedStore } = useAppSelector((state) => state.profile);
  const quotaRefreshRef = useRef(null);

  // Get quota information for frontend validation
  const { quota, isLoading: quotaLoading } =
    useUsageQuota("expense_management");

  const [loading, setLoading] = useState(false);
  const {
    handleApiError,
    handleApiResult,
    QuotaModal,
    showSuccess,
    setQuotaErrorManually,
  } = useErrorHandling();

  // Check if quota is available
  const isQuotaAvailable = () => {
    if (!quota || quotaLoading) return true;
    if (quota.remaining === -1 || quota.limit === -1) return true;
    return quota.remaining > 0 && quota.hasAccess !== false;
  };

  const quotaExceeded = !isQuotaAvailable();

  const handleSubmit = async (formData) => {
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
        result.payload,
        t("expenses.createSuccess"),
        "expense-creation"
      );

      if (handled.type === "success") {
        if (quotaRefreshRef.current) {
          quotaRefreshRef.current();
        }
        setTimeout(() => {
          router.push("/dashboard/expenses");
        }, 1500);
      }
    } catch (error) {
      handleApiError(error, "expense-creation");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/expenses");
  };

  return (
    <div className="flex h-screen w-full relative overflow-hidden">
      <Sidebar />

      {/* Main Content */}
      <div className="min-h-screen w-full flex flex-col">
        {/* Header */}
        <Header
          title={t("expenses.addNewExpense")}
          description={t("expenses.addNewExpenseDescription")}
        />

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-8xl mx-auto">
            {/* Back Button with Quota Progress Bar */}
            <div className="mb-4 flex items-center justify-between">
              <Link
                href="/dashboard/expenses"
                className="inline-flex items-center space-x-2 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {t("expenses.backToExpenses")}
                </span>
              </Link>
              <QuotaProgressBar
                featureKey="expense_management"
                onRefreshRef={(refreshFn) => {
                  quotaRefreshRef.current = refreshFn;
                }}
              />
            </div>

            {/* Form Container - Two Column Layout */}
            <div
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              style={{ height: "calc(100vh - 200px)" }}
            >
              {/* Main Form - Left Side */}
              <div className="lg:col-span-2 flex flex-col h-full">
                <div className="flex-1 overflow-y-auto pe-3 max-h-[calc(100vh-228px)] min-h-[calc(100vh-228px)]">
                  <ExpenseForm
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isLoading={loading || isCreating}
                    error={error}
                  />
                </div>

                {/* Action Buttons - Fixed Bottom */}
                <div className="mt-6 flex items-center justify-between space-x-3 bg-[rgb(var(--color-bg-primary))] border-t border-[rgb(var(--color-border-primary))] pt-4">
                  {/* Quota exceeded warning message */}
                  {quotaExceeded && !quotaLoading && (
                    <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                      <span>⚠️ {t("expenses.quotaExceededMessage")}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-3 ml-auto">
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={loading || isCreating}
                    >
                      {t("common.cancel")}
                    </Button>
                    <Button
                      variant="success"
                      onClick={() => {
                        const form = document.querySelector("form");
                        if (form) form.requestSubmit();
                      }}
                      disabled={
                        loading || isCreating || quotaExceeded || quotaLoading
                      }
                      loading={loading || isCreating}
                      leftIcon={Save}
                      title={quotaExceeded ? t("quota.quotaExceeded") : ""}
                    >
                      {t("expenses.saveExpense")}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Tips Section - Right Side */}
              <div className="lg:col-span-1">
                <div className="sticky top-6">
                  <div className="bg-gradient-to-br from-[rgb(var(--color-primary))]/5 to-[rgb(var(--color-primary))]/10 backdrop-blur-md rounded-lg border border-[rgb(var(--color-primary))]/20 p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-[rgb(var(--color-primary))]/20 rounded-lg flex items-center justify-center">
                        <IndianRupee className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
                          {t("expenses.whyTrackExpenses")}
                        </h3>
                        <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                          {t("expenses.stayOrganized")}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Tax Deduction Benefits */}
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-green-600 text-sm">💰</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">
                            {t("expenses.taxDeductions")}
                          </h4>
                          <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                            {t("expenses.taxDeductionsDescription")}
                          </p>
                        </div>
                      </div>

                      {/* Budget Management */}
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 text-sm">📊</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">
                            {t("expenses.budgetManagement")}
                          </h4>
                          <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                            {t("expenses.budgetManagementDescription")}
                          </p>
                        </div>
                      </div>

                      {/* Financial Analysis */}
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-purple-600 text-sm">📈</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">
                            {t("expenses.financialAnalysis")}
                          </h4>
                          <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                            {t("expenses.financialAnalysisDescription")}
                          </p>
                        </div>
                      </div>

                      {/* Compliance */}
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-orange-600 text-sm">📋</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">
                            {t("expenses.compliance")}
                          </h4>
                          <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                            {t("expenses.complianceDescription")}
                          </p>
                        </div>
                      </div>

                      {/* GST Benefits */}
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-indigo-600 text-sm">🧾</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">
                            {t("expenses.gstInputCredit")}
                          </h4>
                          <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                            {t("expenses.gstInputCreditDescription")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Tips Section */}
                    <div className="mt-6 p-4 bg-[rgb(var(--color-bg-primary))]/20 rounded-lg border border-[rgb(var(--color-border-primary))]/30">
                      <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                        💡 Pro Tips
                      </h4>
                      <ul className="text-xs text-[rgb(var(--color-text-secondary))] space-y-1">
                        <li>• Keep bills and receipts for all expenses</li>
                        <li>• Track expenses daily for accuracy</li>
                        <li>• Categorize properly for better reporting</li>
                        <li>• Update payment status promptly</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {QuotaModal}
    </div>
  );
};

export default AddExpensePage;
