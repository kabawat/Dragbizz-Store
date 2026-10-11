"use client";
import { CustomersScreen } from "@dragorbit/features/customers";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import CustomerListContent from "@/components/customer/list/CustomerListContent";
import CustomerListHeader from "@/components/customer/list/CustomerListHeader";

import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setViewMode } from "@/store/slices/customers/customerSlice";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";

const CustomersPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();

  useDashboardHeader(t("customers.title"), t("customers.description"));

  const [searchValue, setSearchValue] = useState("");
  const [isActive, setIsActive] = useState("");
  const [source, setSource] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [balanceFilter, setBalanceFilter] = useState("");

  const { customers, isLoading, error } = useAppSelector(
    (state) => state.customers,
  );

  useEffect(() => {
    const savedViewMode = localStorage.getItem("customers-view-mode");
    if (savedViewMode === "table" || savedViewMode === "card") {
      dispatch(setViewMode(savedViewMode));
    }
  }, [dispatch]);

  useCommonHotkeys({
    onBack: () => router.push("/dashboard"),
  });

  const handleBulkSuccess = useCallback(() => {}, []);

  const isFiltered = Boolean(
    searchValue || isActive || source || startDate || endDate || balanceFilter,
  );

  return (
    <CustomersScreen
      t={t}
      customers={customers}
      isLoading={isLoading}
      error={error}
      CustomerListHeader={CustomerListHeader}
      CustomerListContent={CustomerListContent}
    />
  );
};

export default CustomersPage;
