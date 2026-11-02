"use client";
import { BillsScreen } from "@dragorbit/features/bills";
import { useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import BillListContent from "@/components/bills/list/BillListContent";
import BillListHeader from "@/components/bills/list/BillListHeader";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setViewMode } from "@/store/slices/billsSlice";

const Bills = () => {
  const { t } = useTranslation();

  useDashboardHeader(t("bills.title"), t("bills.description"));
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [searchValue, setSearchValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const {
    bills,
    isLoading: requestLoading,
    hasLoaded,
    error,
  } = useAppSelector((state) => state.bills);
  const isLoading = requestLoading || (!hasLoaded && !error);

  const { create: canCreate, loading: permissionsLoading } =
    useModulePermissions("billing");

  useEffect(() => {
    try {
      const savedViewMode = localStorage.getItem("bills-view-mode");
      if (savedViewMode === "table" || savedViewMode === "card") {
        dispatch(setViewMode(savedViewMode));
      }
    } catch {
      // Storage unavailable
    }
  }, [dispatch]);

  const handleBack = useCallback(() => {
    router.push("/dashboard");
  }, [router]);

  const handleCreate = useCallback(() => {
    router.push("/dashboard/bills/create");
  }, [router]);

  useCommonHotkeys({
    onBack: handleBack,
    onNew: canCreate ? handleCreate : undefined,
  });

  const model = useMemo(
    () => ({
      BillListHeader,
      searchValue,
      setSearchValue,
      startDate,
      setStartDate,
      endDate,
      setEndDate,
      isLoading,
      permissionsLoading,
      bills,
      error,
      t,
      canCreate,
      BillListContent,
      onCreate: handleCreate,
    }),
    [
      searchValue,
      startDate,
      endDate,
      isLoading,
      permissionsLoading,
      bills,
      error,
      t,
      canCreate,
      handleCreate,
    ]
  );

  return <BillsScreen model={model} />;
};

export default memo(Bills);
