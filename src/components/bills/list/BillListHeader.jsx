"use client";
import { Grid3X3, List, Plus, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getBills,
  setViewMode as setViewModeAction,
} from "@/store/slices/billsSlice";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";

const BillListHeader = ({ searchValue, setSearchValue }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { viewMode } = useAppSelector((state) => state.bills);
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = useMemo(() => selectedStore?.storeId || "", [selectedStore?.storeId]);
  const { can, loading } = useModulePermissions("billing");
  const canCreate = can("create");

  const searchInputRef = useRef(null);
  const lastFetchRef = useRef(null);
  const hasFetchedRef = useRef({ fetched: false, storeId: null, searchValue: null });

  // Reset fetch refs when store changes
  useEffect(() => {
    lastFetchRef.current = null;
    hasFetchedRef.current = { fetched: false, storeId: null, searchValue: null };
  }, [storeId]);

  // Fetch bills with debounce + deduplication
  const fetchBills = useCallback(async () => {
    if (!storeId) return;

    const fetchKey = `${storeId}-${searchValue}`;
    if (lastFetchRef.current === fetchKey) return;

    const last = hasFetchedRef.current;
    if (last.fetched && last.storeId === storeId && last.searchValue === searchValue) return;

    lastFetchRef.current = fetchKey;

    dispatch(getBills({
      store: storeId,
      search: searchValue,
      limit: 20,
      cursor: null,
      isFreshLoad: true,
    }));
    hasFetchedRef.current = { fetched: true, storeId, searchValue };
  }, [dispatch, storeId, searchValue]);

  // Debounced trigger
  useEffect(() => {
    if (!storeId) return;
    const last = hasFetchedRef.current;
    if (last.fetched && last.storeId === storeId && last.searchValue === searchValue) return;

    const timer = setTimeout(() => fetchBills(), 350);
    return () => clearTimeout(timer);
  }, [storeId, searchValue, fetchBills]);

  const handleViewModeChange = useCallback((mode) => {
    dispatch(setViewModeAction(mode));
    localStorage.setItem("bills-view-mode", mode);
  }, [dispatch]);

  useCommonHotkeys({
    onNew: canCreate ? () => router.push("/dashboard/bills/create") : undefined,
    onSearch: () => searchInputRef.current?.focus(),
    onViewTable: () => handleViewModeChange("table"),
    onViewGrid: () => handleViewModeChange("card"),
  });

  if (loading) return <div className="h-10 mb-3 animate-pulse bg-[rgb(var(--color-bg-secondary))] rounded-lg" />;

  return (
    <div className="p-5">
      <div className="flex justify-between items-center lg:flex-row gap-4 mb-0">
        <div className="flex">
          <Input
            type="text"
            ref={searchInputRef}
            placeholder={`${t("common.search")} ${t("bills.title").toLowerCase()}...`}
            value={searchValue}
            onChange={setSearchValue}
            leftIcon={Search}
            className="w-100"
          />
        </div>

        <div className="flex gap-3 items-center">
          <div className="flex bg-[rgb(var(--color-bg-secondary))] rounded-lg">
            <button
              onClick={() => handleViewModeChange("table")}
              className={`px-3 cursor-pointer py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${viewMode === "table"
                ? "bg-[rgb(var(--color-primary))] text-white"
                : "text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]"
                }`}
            >
              <List className="w-4 h-4" />
              {t("common.tableView")}
            </button>
            <button
              onClick={() => handleViewModeChange("card")}
              className={`px-3 cursor-pointer py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${viewMode === "card"
                ? "bg-[rgb(var(--color-primary))] text-white"
                : "text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]"
                }`}
            >
              <Grid3X3 className="w-4 h-4" />
              {t("common.cardView")}
            </button>
          </div>

          {canCreate && (
            <Button
              variant="primary"
              onClick={() => router.push("/dashboard/bills/create")}
              leftIcon={Plus}
            >
              {t("bills.createBill")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillListHeader;
