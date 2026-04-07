"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Plus } from "lucide-react";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import { EmptyState } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setViewMode } from "@/store/slices/purchaseOrdersSlice";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";

// Import Refactored Components
import PurchaseOrderListHeader from "@/components/purchaseOrders/list/PurchaseOrderListHeader";
import PurchaseOrderListContent from "@/components/purchaseOrders/list/PurchaseOrderListContent";

const PurchaseOrders = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [searchValue, setSearchValue] = useState("");

  const { list: purchaseOrders, isLoading, error } = useAppSelector(
    (state) => state.purchaseOrders
  );

  const {
    can,
    create: canCreate,
    loading: permissionsLoading
  } = useModulePermissions("purchase_order");

  // Restore saved view mode on mount
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
    <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
      <Sidebar />
      <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
        <Header title={t("purchaseOrders.title")} description={t("purchaseOrders.description")} />

        <div className="flex-1 p-5">
          <div className="max-w-8xl mx-auto">

            <PurchaseOrderListHeader searchValue={searchValue} setSearchValue={setSearchValue} />

            {/* Loading */}
            {(isLoading || permissionsLoading) && purchaseOrders.length === 0 && !error && (
              <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-8 mb-6 flex justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-[rgb(var(--color-text-secondary))]">{t("common.loading")}</p>
                </div>
              </div>
            )}

            {/* Empty State */}
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

            {/* Main Content (Table/Grid/Drawers) */}
            {purchaseOrders.length > 0 && <PurchaseOrderListContent />}

          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrders;
