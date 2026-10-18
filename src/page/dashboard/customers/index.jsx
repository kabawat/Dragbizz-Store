"use client";
import { CustomersScreen } from "@dragorbit/features/customers";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
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

  const { customers, isLoading, error, hasLoaded, loadedStoreId } =
    useAppSelector((state) => state.customers);

  const storeId = useAppSelector(
    (state) => state.profile.selectedStore?.storeId
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

  return (
    <CustomersScreen
      t={t}
      customers={customers}
      isLoading={isLoading}
      hasLoaded={hasLoaded && loadedStoreId === storeId}
      error={error}
      CustomerListHeader={CustomerListHeader}
      CustomerListContent={CustomerListContent}
    />
  );
};

export default CustomersPage;
