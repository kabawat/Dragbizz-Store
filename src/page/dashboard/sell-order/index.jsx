"use client";
import { SalesOrdersScreen } from "@dragorbit/features/sales-orders";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setViewMode } from "@/store/slices/salesOrdersSlice";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";

// Modularized Sales Order Components
import SalesOrderListHeader from "@/components/salesOrder/list/SalesOrderListHeader";

import SalesOrderListContent from "@/components/salesOrder/list/SalesOrderListContent";

const SalesOrdersPage = () => {
  const { t } = useTranslation();
  useDashboardHeader(
    t("sidebar.sellOrders"),
    t("salesOrder.orderListSubtitle"),
  );
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Smooth deterministic tracking using global Redux Architecture
  const {
    list: orders,
    isLoading,
    error,
  } = useAppSelector((state) => state.salesOrders);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orderSourceFilter, setOrderSourceFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const {
    can,
    create: canCreate,
    edit: canEdit,
    delete: canDelete,
    loading: permissionsLoading,
  } = useModulePermissions("sales_order");

  useEffect(() => {
    if (!permissionsLoading && !can("read")) {
      router.push("/dashboard");
    }
  }, [can, permissionsLoading, router]);

  // Initial configuration check
  useEffect(() => {
    const savedViewMode = localStorage.getItem("sales-orders-view-mode");
    if (savedViewMode === "table" || savedViewMode === "card") {
      dispatch(setViewMode(savedViewMode));
    }
  }, [dispatch]);

  useCommonHotkeys({
    onBack: () => router.push("/dashboard"),
  });

  return (
    <SalesOrdersScreen
      t={t}
      orders={orders}
      isLoading={isLoading}
      error={error}
      permissionsLoading={permissionsLoading}
      canCreate={canCreate}
      canEdit={canEdit}
      canDelete={canDelete}
      SalesOrderListHeader={SalesOrderListHeader}
      SalesOrderListContent={SalesOrderListContent}
    />
  );
};

export default SalesOrdersPage;
