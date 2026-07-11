"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Plus } from "lucide-react";
import { EmptyState, PageLoader } from "@/components/ui";
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

  useDashboardHeader(t("purchaseOrders.title"), t("purchaseOrders.description"));
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [searchValue, setSearchValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { list: purchaseOrders, isLoading, error } = useAppSelector(state => state.purchaseOrders);

  const {
    can,
    create: canCreate,
    loading: permissionsLoading
  } = useModulePermissions("purchase_order");

  useEffect(() => {
    const savedViewMode = localStorage.getItem("purchase-orders-view-mode");
    if (savedViewMode === "table" || savedViewMode === "card") {
      dispatch(setViewMode(savedViewMode));
    }
  }, [dispatch]);

  useCommonHotkeys({
    onBack: () => router.push("/dashboard"),
    onNew: canCreate ? () => router.push("/dashboard/purchase-orders/create") : undefined,
  });

  return (
    <div className="overflow-hidden">
      <div className="max-w-8xl mx-auto w-full">
        <PurchaseOrderListHeader
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />
        <div className="px-5">
          {(isLoading || permissionsLoading) && purchaseOrders.length === 0 && !error && (<PageLoader />)}
          {!(isLoading || permissionsLoading) && purchaseOrders.length === 0 && (
            <EmptyState
              className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))]"
              icon={FileText}
              title={t("purchaseOrders.noPurchaseOrders")}
              description={searchValue ? t("purchaseOrders.noResultsDescription") : t("purchaseOrders.emptyDescription")}
              actionButton={!searchValue && canCreate ? {
                label: t("purchaseOrders.createPO"),
                onClick: () => router.push("/dashboard/purchase-orders/create"),
                icon: Plus
              } : null}
            />
          )}
          {purchaseOrders.length > 0 && (
            <PurchaseOrderListContent
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

export default PurchaseOrders;
