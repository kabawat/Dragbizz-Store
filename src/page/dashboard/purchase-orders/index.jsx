"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setViewMode } from "@/store/slices/purchaseOrdersSlice";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";

// Import Refactored Components
import PurchaseOrderListHeader from "@/components/purchaseOrders/list/PurchaseOrderListHeader";
import PurchaseOrderEmptyState from "@/components/purchaseOrders/list/PurchaseOrderEmptyState";
import PurchaseOrderListContent from "@/components/purchaseOrders/list/PurchaseOrderListContent";

const PurchaseOrders = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { list: purchaseOrders, isLoading, error } = useAppSelector(
    (state) => state.purchaseOrders
  );

  // Restore saved view mode on mount
  useEffect(() => {
    const savedViewMode = localStorage.getItem("purchase-orders-view-mode");
    if (savedViewMode === "table" || savedViewMode === "card") {
      dispatch(setViewMode(savedViewMode));
    }
  }, [dispatch]);

  useCommonHotkeys({
    onBack: () => router.push("/dashboard"),
  });

  return (
    <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
      <Sidebar />
      <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
        <Header
          title={t("purchaseOrders.title")}
          description={t("purchaseOrders.description")}
        />

        <div className="flex-1 p-5">
          <div className="max-w-8xl mx-auto">

            <PurchaseOrderListHeader />

            {/* Loading */}
            {isLoading && purchaseOrders.length === 0 && !error && (
              <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-8 mb-6 flex justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-[rgb(var(--color-text-secondary))]">{t("common.loading")}</p>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && purchaseOrders.length === 0 && <PurchaseOrderEmptyState />}

            {/* Main Content (Table/Grid/Drawers) */}
            {purchaseOrders.length > 0 && <PurchaseOrderListContent />}

          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrders;
