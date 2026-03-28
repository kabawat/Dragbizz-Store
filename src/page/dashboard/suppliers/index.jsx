"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setViewMode } from "@/store/slices/supplier/supplierSlice";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";

// Encapsulated Modules
import SupplierListHeader from "@/components/supplier/list/SupplierListHeader";
import SupplierListContent from "@/components/supplier/list/SupplierListContent";
import { SupplierEmptyState } from "@/components/supplier";

const SuppliersPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { suppliers, isLoading, error } = useAppSelector((state) => state.suppliers);

  useEffect(() => {
    const savedViewMode = localStorage.getItem("suppliers-view-mode");
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
          title={t("suppliers.title")}
          description={t("suppliers.description")}
        />

        <div className="flex-1 p-5">
          <div className="max-w-8xl mx-auto">
            <SupplierListHeader />

            {isLoading && suppliers.length === 0 && !error && (
              <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-8 mb-6 flex justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-[rgb(var(--color-text-secondary))]">{t("common.loading")}</p>
                </div>
              </div>
            )}

            {!isLoading && suppliers.length === 0 && !error && (
              <SupplierEmptyState />
            )}

            {suppliers.length > 0 && <SupplierListContent />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuppliersPage;
