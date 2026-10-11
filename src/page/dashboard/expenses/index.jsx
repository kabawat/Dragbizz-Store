"use client";
import { ExpensesScreen } from "@dragorbit/features/expenses";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useAppSelector } from "@/store/hooks";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";

import ExpenseListContent from "@/components/expenses/list/ExpenseListContent";
import ExpenseListHeader from "@/components/expenses/list/ExpenseListHeader";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";

const ExpensesPage = () => {
  const { t } = useTranslation();

  useDashboardHeader(t("expenses.title"), t("expenses.description"));
  const router = useRouter();

  const { expenses, isLoading, error } = useAppSelector(
    (state) => state.expenses,
  );

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
    <ExpensesScreen
      t={t}
      expenses={expenses}
      isLoading={isLoading}
      error={error}
      ExpenseListHeader={ExpenseListHeader}
      ExpenseListContent={ExpenseListContent}
    />
  );
};

export default ExpensesPage;
