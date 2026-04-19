"use client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
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

  useDashboardHeader(t("expenses.title"), t("expenses.description"));
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { expenses, isLoading, error } = useAppSelector((state) => state.expenses);
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;

  const [searchValue, setSearchValue] = useState("");

  const { can, loading: permissionLoading } = useModulePermissions("expense");
  const canRead = can("read");
  const canCreate = can("create");

  useEffect(() => {
    if (!permissionLoading && !canRead) {
      router.replace("/dashboard");
    }
  }, [canRead, permissionLoading, router]);

  useEffect(() => {
    if (!storeId || expenses.length > 0) return;
    dispatch(getExpenses({ store: storeId, isFreshLoad: true }));
  }, [dispatch, storeId]);

  useCommonHotkeys({
    onBack: () => router.push("/dashboard"),
  });

  return (
    <div className="p-5">
      <div className="max-w-8xl mx-auto">
        <ExpenseListHeader onSearchChange={setSearchValue} />

        {isLoading && expenses.length === 0 && !error && (
          <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-8 mb-6 flex justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[rgb(var(--color-text-secondary))]">{t("common.loading")}</p>
            </div>
          </div>
        )}

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

        {expenses.length > 0 && (<ExpenseListContent />)}
      </div>
    </div>
  );
};

export default ExpensesPage;
