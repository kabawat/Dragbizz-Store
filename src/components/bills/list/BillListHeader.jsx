"use client";
import { BillListHeaderView } from "@dragorbit/features/bills";
import { useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getBills,
  setViewMode as setViewModeAction,
} from "@/store/slices/billsSlice";
import { pickStoreId } from "@/utils/store.util";

const BillListHeader = ({
  searchValue,
  setSearchValue,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { viewMode } = useAppSelector((state) => state.bills);
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = useMemo(
    () => pickStoreId(selectedStore) || "",
    [selectedStore]
  );
  const { can, loading } = useModulePermissions("billing");
  const canCreate = can("create");

  const searchInputRef = useRef(null);
  const lastFetchRef = useRef(null);
  const hasFetchedRef = useRef({
    fetched: false,
    storeId: null,
    searchValue: null,
    startDate: null,
    endDate: null,
  });
  const hasActiveFilters = Boolean(startDate || endDate);

  // Reset fetch refs when store changes
  useEffect(() => {
    if (!storeId) return;
    lastFetchRef.current = null;
    hasFetchedRef.current = {
      fetched: false,
      storeId: null,
      searchValue: null,
      startDate: null,
      endDate: null,
    };
  }, [storeId]);

  // Fetch bills with debounce + deduplication
  const fetchBills = useCallback(async () => {
    if (!storeId) return;

    const fetchKey = `${storeId}-${searchValue}-${startDate}-${endDate}`;
    if (lastFetchRef.current === fetchKey) return;

    const last = hasFetchedRef.current;
    if (
      last.fetched &&
      last.storeId === storeId &&
      last.searchValue === searchValue &&
      last.startDate === startDate &&
      last.endDate === endDate
    )
      return;

    lastFetchRef.current = fetchKey;

    dispatch(
      getBills({
        store: storeId,
        search: searchValue,
        limit: 20,
        cursor: null,
        isFreshLoad: true,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      })
    );
    hasFetchedRef.current = {
      fetched: true,
      storeId,
      searchValue,
      startDate,
      endDate,
    };
  }, [dispatch, storeId, searchValue, startDate, endDate]);

  // Debounced trigger
  useEffect(() => {
    if (!storeId) return;
    const last = hasFetchedRef.current;
    if (
      last.fetched &&
      last.storeId === storeId &&
      last.searchValue === searchValue &&
      last.startDate === startDate &&
      last.endDate === endDate
    )
      return;

    const timer = setTimeout(() => fetchBills(), 350);
    return () => clearTimeout(timer);
  }, [storeId, searchValue, startDate, endDate, fetchBills]);

  const handleClearFilters = useCallback(() => {
    setStartDate("");
    setEndDate("");
  }, [setStartDate, setEndDate]);

  const handleViewModeChange = useCallback(
    (mode) => {
      dispatch(setViewModeAction(mode));
      localStorage.setItem("bills-view-mode", mode);
    },
    [dispatch]
  );

  const handleCreate = useCallback(() => {
    router.push("/dashboard/bills/create");
  }, [router]);

  useCommonHotkeys({
    onNew: canCreate ? handleCreate : undefined,
    onSearch: () => searchInputRef.current?.focus(),
    onViewTable: () => handleViewModeChange("table"),
    onViewGrid: () => handleViewModeChange("card"),
  });

  const model = useMemo(
    () => ({
      searchInputRef,
      t,
      searchValue,
      setSearchValue,
      startDate,
      endDate,
      setStartDate,
      setEndDate,
      hasActiveFilters,
      handleClearFilters,
      handleViewModeChange,
      viewMode,
      canCreate,
      onCreate: handleCreate,
    }),
    [
      t,
      searchValue,
      setSearchValue,
      startDate,
      endDate,
      setStartDate,
      setEndDate,
      hasActiveFilters,
      handleClearFilters,
      handleViewModeChange,
      viewMode,
      canCreate,
      handleCreate,
    ]
  );

  if (loading)
    return (
      <div className="h-10 mb-3 animate-pulse bg-[rgb(var(--color-bg-secondary))] rounded-lg" />
    );

  return <BillListHeaderView model={model} />;
};

export default memo(BillListHeader);
