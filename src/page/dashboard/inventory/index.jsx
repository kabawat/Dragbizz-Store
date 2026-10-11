"use client";
import { InventoryScreen } from "@dragorbit/features/inventory";

import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";

import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setViewMode } from "@/store/slices/inventory/inventorySlice";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import {
  InventoryListHeader,
  InventoryListContent,
} from "@/components/inventory";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";

const InventoryPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();

  useDashboardHeader(t("inventory.title"), t("inventory.description"));

  const [showInventoryDrawer, setShowInventoryDrawer] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const {
    inventories,
    isLoading: inventoryLoading,
    error,
  } = useAppSelector((state) => state.inventory);
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;
  const {
    can,
    create: canCreate,
    edit: canEdit,
    delete: canDelete,
    loading: permissionsLoading,
  } = useModulePermissions("inventory");

  useEffect(() => {
    if (!permissionsLoading && !can("read")) {
      router.push("/dashboard");
    }
  }, [can, permissionsLoading, router]);

  useEffect(() => {
    const savedViewMode = localStorage.getItem("inventory-view-mode");
    if (savedViewMode === "table" || savedViewMode === "card") {
      dispatch(setViewMode(savedViewMode));
    }
  }, [dispatch]);

  useCommonHotkeys({
    onBack: () => router.push("/dashboard"),
  });

  return (
    <InventoryScreen
      model={{
        InventoryListHeader,
        showInventoryDrawer,
        setShowInventoryDrawer,
        canCreate,
        searchValue,
        setSearchValue,
        inventoryLoading,
        permissionsLoading,
        inventories,
        error,
        t,
        InventoryListContent,
        canEdit,
        canDelete,
        onCreate: () => setShowInventoryDrawer(true),
      }}
    />
  );
};

export default InventoryPage;
