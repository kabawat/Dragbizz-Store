"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building, Plus } from "lucide-react";
import { EmptyState } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setViewMode } from "@/store/slices/supplier/supplierSlice";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";

// Encapsulated Modules
import SupplierListHeader from "@/components/supplier/list/SupplierListHeader";
import SupplierListContent from "@/components/supplier/list/SupplierListContent";

const SuppliersPage = () => {
  const { t } = useTranslation();

  useDashboardHeader(t("suppliers.title"), t("suppliers.description"));
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Lifted state
  const [showAddSupplierDrawer, setShowAddSupplierDrawer] = useState(false);
  const [accountStatus, setAccountStatus] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [riskLevel, setRiskLevel] = useState("");
  const [isActive, setIsActive] = useState("");

  const { suppliers, isLoading, error } = useAppSelector((state) => state.suppliers);
  const {
    can,
    create: canCreate,
    loading: permissionsLoading
  } = useModulePermissions("supplier");

  useEffect(() => {
    const savedViewMode = localStorage.getItem("suppliers-view-mode");
    if (savedViewMode === "table" || savedViewMode === "card") {
      dispatch(setViewMode(savedViewMode));
    }
  }, [dispatch]);

  useCommonHotkeys({
    onBack: () => router.push("/dashboard"),
    onNew: canCreate ? () => setShowAddSupplierDrawer(true) : undefined,
  });

  const isFiltered = searchValue || accountStatus || riskLevel || isActive;

  return (
    <div className="p-5">
      <div className="max-w-8xl mx-auto">
        <SupplierListHeader
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          accountStatus={accountStatus}
          setAccountStatus={setAccountStatus}
          riskLevel={riskLevel}
          setRiskLevel={setRiskLevel}
          isActive={isActive}
          setIsActive={setIsActive}
          showAddSupplierDrawer={showAddSupplierDrawer}
          setShowAddSupplierDrawer={setShowAddSupplierDrawer}
        />

        {(isLoading || permissionsLoading) && suppliers.length === 0 && !error && (
          <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-8 mb-6 flex justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[rgb(var(--color-text-secondary))]">{t("common.loading")}</p>
            </div>
          </div>
        )}

        {!(isLoading || permissionsLoading) && suppliers.length === 0 && !error && (
          <EmptyState
            className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))]"
            icon={Building}
            title={t("suppliers.noSuppliers")}
            description={isFiltered ? t("suppliers.noResultsDescription") : t("suppliers.emptyDescription")}
            actionButton={!isFiltered && canCreate ? {
              label: t("suppliers.addSupplier"),
              onClick: () => setShowAddSupplierDrawer(true),
              icon: Plus
            } : null}
          />
        )}

        {suppliers.length > 0 && <SupplierListContent />}
      </div>
    </div>
  );
};

export default SuppliersPage;
