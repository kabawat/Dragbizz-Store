"use client";
import { PurchaseOrdersScreen } from "@dragorbit/features/purchase-orders";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useTranslation } from "@/hooks/ui/useTranslation";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setViewMode } from "@/store/slices/purchaseOrdersSlice";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";

// Import Refactored Components
import PurchaseOrderListHeader from "@/components/purchaseOrders/list/PurchaseOrderListHeader";
import PurchaseOrderListContent from "@/components/purchaseOrders/list/PurchaseOrderListContent";

const PurchaseOrders = () => {
  const { t } = useTranslation();

  useDashboardHeader(
    t("purchaseOrders.title"),
    t("purchaseOrders.description"),
  );
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [searchValue, setSearchValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const {
    list: purchaseOrders,
    isLoading: requestLoading, hasLoaded,
    error,
  } = useAppSelector((state) => state.purchaseOrders);
  const isLoading = requestLoading || (!hasLoaded && !error);

  const {
    can,
    create: canCreate,
    loading: permissionsLoading,
  } = useModulePermissions("purchase_order");

  useEffect(() => {
    const savedViewMode = localStorage.getItem("purchase-orders-view-mode");
    if (savedViewMode === "table" || savedViewMode === "card") {
      dispatch(setViewMode(savedViewMode));
    }
  }, [dispatch]);

  useCommonHotkeys({
    onBack: () => router.push("/dashboard"),
    onNew: canCreate
      ? () => router.push("/dashboard/purchase-orders/create")
      : undefined,
  });

  return (
    <PurchaseOrdersScreen
      model={{
        PurchaseOrderListHeader,
        searchValue,
        setSearchValue,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        isLoading,
        permissionsLoading,
        purchaseOrders,
        error,
        t,
        canCreate,
        PurchaseOrderListContent,
        onCreate: () => router.push("/dashboard/purchase-orders/create"),
      }}
    />
  );
};

export default PurchaseOrders;
