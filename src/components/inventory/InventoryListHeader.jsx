"use client";
import { InventoryListHeaderView } from "@dragorbit/features/inventory";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

import { CreateInventory } from "@/components/inventory";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getInventories,
  setViewMode,
} from "@/store/slices/inventory/inventorySlice";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";

const InventoryListHeader = ({
  showInventoryDrawer,
  setShowInventoryDrawer,
  canCreate = false,
  searchValue,
  setSearchValue,
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { viewMode } = useAppSelector((state) => state.inventory);
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId || "";

  const searchInputRef = useRef(null);
  const lastFetchRef = useRef(null);
  const hasFetchedRef = useRef({
    fetched: false,
    storeId: null,
    searchValue: null,
  });

  // Reset fetch refs when store changes
  useEffect(() => {
    lastFetchRef.current = null;
    hasFetchedRef.current = {
      fetched: false,
      storeId: null,
      searchValue: null,
    };
  }, [storeId]);

  // Fetch inventories with debounce
  const fetchInventories = useCallback(async () => {
    if (!storeId) return;

    const fetchKey = `${storeId}-${searchValue}`;
    if (lastFetchRef.current === fetchKey) return;

    const last = hasFetchedRef.current;
    if (
      last.fetched &&
      last.storeId === storeId &&
      last.searchValue === searchValue
    )
      return;

    lastFetchRef.current = fetchKey;

    const params = {
      store: storeId,
      search: searchValue,
      limit: 20,
      isFreshLoad: true,
    };

    await dispatch(getInventories(params));
    hasFetchedRef.current = { fetched: true, storeId, searchValue };
  }, [dispatch, storeId, searchValue]);

  useEffect(() => {
    if (!storeId) return;
    const last = hasFetchedRef.current;
    const alreadyFetched =
      last.fetched &&
      last.storeId === storeId &&
      last.searchValue === searchValue;
    if (alreadyFetched) return;

    const timer = setTimeout(() => fetchInventories(), 350);
    return () => clearTimeout(timer);
  }, [storeId, searchValue, fetchInventories]);

  const handleViewModeChange = useCallback(
    (mode) => {
      dispatch(setViewMode(mode));
      localStorage.setItem("inventory-view-mode", mode);
    },
    [dispatch],
  );

  const handleInventorySuccess = (inventoryData) => {
    setShowInventoryDrawer?.(false);
  };

  useCommonHotkeys({
    onNew: () => canCreate && setShowInventoryDrawer?.(true),
    onSearch: () => searchInputRef.current?.focus(),
    onViewTable: () => handleViewModeChange("table"),
    onViewGrid: () => handleViewModeChange("card"),
    onClose: () => {
      if (showInventoryDrawer) setShowInventoryDrawer?.(false);
    },
  });

  return (
    <InventoryListHeaderView
      model={{
        t,
        searchValue,
        setSearchValue,
        searchInputRef,
        handleViewModeChange,
        viewMode,
        canCreate,
        setShowInventoryDrawer,
        showInventoryDrawer,
        CreateInventory,
        handleInventorySuccess,
        onCreate: () => setShowInventoryDrawer(true),
      }}
    />
  );
};

export default InventoryListHeader;
