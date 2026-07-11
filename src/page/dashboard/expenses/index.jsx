"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useAppSelector } from "@/store/hooks";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { EmptyState, PageLoader } from "@/components/ui";
import { IndianRupee, Plus, Search } from "lucide-react";
import ExpenseListContent from "@/components/expenses/list/ExpenseListContent";
import ExpenseListHeader from "@/components/expenses/list/ExpenseListHeader";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";

const ExpensesPage = () => {
  const { t } = useTranslation();

  useDashboardHeader(t("expenses.title"), t("expenses.description"));
  const router = useRouter();

  const { expenses, isLoading, error } = useAppSelector((state) => state.expenses);

  const [searchValue, setSearchValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { can, loading: permissionLoading } = useModulePermissions("expense");
  const canRead = can("read");

  useEffect(() => {
    if (!permissionLoading && !canRead) {
      router.replace("/dashboard");
    }
  }, [canRead, permissionLoading, router]);

  useCommonHotkeys({
    onBack: () => router.push("/dashboard"),
  });

  return (
    <div className="overflow-hidden">
      <div className="max-w-8xl mx-auto">
        <ExpenseListHeader
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />

        <div className="px-5">
          {isLoading && expenses.length === 0 && !error && (<PageLoader />)}

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

          {expenses.length > 0 && (
            <ExpenseListContent
              searchValue={searchValue}
              startDate={startDate}
              endDate={endDate}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpensesPage;
