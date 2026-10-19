"use client";
import { BillsScreen } from "@dragorbit/features/bills";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useTranslation } from "@/hooks/ui/useTranslation";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setViewMode } from "@/store/slices/billsSlice";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";

import BillListHeader from "@/components/bills/list/BillListHeader";
import BillListContent from "@/components/bills/list/BillListContent";

const Bills = () => {
  const { t } = useTranslation();

  useDashboardHeader(t("bills.title"), t("bills.description"));
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [searchValue, setSearchValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { bills, isLoading: requestLoading, hasLoaded, error } = useAppSelector((state) => state.bills);
  const isLoading = requestLoading || (!hasLoaded && !error);

  const {
    can,
    create: canCreate,
    loading: permissionsLoading,
  } = useModulePermissions("billing");
  useEffect(() => {
    const savedViewMode = localStorage.getItem("bills-view-mode");
    if (savedViewMode === "table" || savedViewMode === "card") {
      dispatch(setViewMode(savedViewMode));
    }
  }, [dispatch]);

  useCommonHotkeys({
    onBack: () => router.push("/dashboard"),
    onNew: canCreate ? () => router.push("/dashboard/bills/create") : undefined,
  });

  return (
    <BillsScreen
      model={{
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
        onCreate: () => router.push("/dashboard/bills/create"),
      }}
    />
  );
};

export default Bills;
