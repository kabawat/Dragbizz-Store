"use client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getExpenses } from "@/store/slices/expenses/expenseSlice";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { EmptyState } from "@/components/ui";
import { IndianRupee, Plus, Search } from "lucide-react";
import ExpenseListContent from "@/components/expenses/list/ExpenseListContent";
import ExpenseListHeader from "@/components/expenses/list/ExpenseListHeader";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";

const ExpensesPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { expenses, isLoading, error } = useAppSelector((state) => state.expenses);
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;

  // Local search state (to match Header if needed, though mostly for UI)
  const [searchValue, setSearchValue] = useState("");

  // Permission Management
  const { can, loading: permissionLoading } = useModulePermissions("expense");
  const canRead = can("read");
  const canCreate = can("create");

  useEffect(() => {
    if (!permissionLoading && !canRead) {
      router.replace("/dashboard");
    }
  }, [canRead, permissionLoading, router]);

  // ─── Initial fetch — skip if data already in Redux ──────────────────────
  useEffect(() => {
    if (!storeId) return;
    if (expenses.length > 0) return; // already cached, no need to refetch
    // Initial fetch should trigger with all default options
    dispatch(getExpenses({ store: storeId, isFreshLoad: true }));
  }, [dispatch, storeId]);

  // Shortcuts
  useCommonHotkeys({
    onBack: () => router.push("/dashboard"),
  });

  return (
    <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
        {/* Header */}
        <Header title={t("expenses.title")} description={t("expenses.description")} />

        {/* Main Content */}
        <div className="flex-1 p-5 overflow-y-auto">
          <div className="max-w-8xl mx-auto">

            {/* Header manages: search, viewMode, download, create — all internally */}
            <ExpenseListHeader onSearchChange={setSearchValue} />

            {/* Loading */}
            {isLoading && expenses.length === 0 && !error && (
              <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-8 mb-6 flex justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-[rgb(var(--color-text-secondary))]">{t("common.loading")}</p>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && expenses.length === 0 && (
              <EmptyState
                className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))]"
                title={searchValue ? t("common.noResults") : (t("expenses.noExpenses") || "No Expenses Found")}
                description={
                  error
                    ? `${t("common.error")}: ${error}`
                    : searchValue
                      ? `${t("common.noResultsFoundFor")} "${searchValue}"`
                      : t("expenses.emptyDescription") || t("expenses.startAddingExpense")
                }
                icon={searchValue ? Search : IndianRupee}
                type={error ? "error" : "empty"}
              />
            )}

            {/* Expenses List */}
            {expenses.length > 0 && (<ExpenseListContent />)}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpensesPage;
