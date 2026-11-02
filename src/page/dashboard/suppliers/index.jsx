"use client";
import { SuppliersScreen } from "@dragorbit/features/suppliers";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

  const { suppliers, isLoading: requestLoading, hasLoaded, error } = useAppSelector(
    (state) => state.suppliers,
  );
  const isLoading = requestLoading || (!hasLoaded && !error);
  const {
    can,
    create: canCreate,
    loading: permissionsLoading,
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
    <SuppliersScreen
      model={{
        SupplierListHeader,
        searchValue,
        setSearchValue,
        accountStatus,
        setAccountStatus,
        riskLevel,
        setRiskLevel,
        isActive,
        setIsActive,
        showAddSupplierDrawer,
        setShowAddSupplierDrawer,
        isLoading,
        permissionsLoading,
        suppliers,
        error,
        t,
        isFiltered,
        canCreate,
        SupplierListContent,
      }}
    />
  );
};

export default SuppliersPage;
