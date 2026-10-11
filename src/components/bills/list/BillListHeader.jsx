"use client";
import { BillListHeaderView } from "@dragorbit/features/bills";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";

import { useTranslation } from "@/hooks/ui/useTranslation";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getBills,
  setViewMode as setViewModeAction,
} from "@/store/slices/billsSlice";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";

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
    () => selectedStore?.storeId || "",
    [selectedStore?.storeId],
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
      }),
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

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  const handleViewModeChange = useCallback(
    (mode) => {
      dispatch(setViewModeAction(mode));
      localStorage.setItem("bills-view-mode", mode);
    },
    [dispatch],
  );

  useCommonHotkeys({
    onNew: canCreate ? () => router.push("/dashboard/bills/create") : undefined,
    onSearch: () => searchInputRef.current?.focus(),
    onViewTable: () => handleViewModeChange("table"),
    onViewGrid: () => handleViewModeChange("card"),
  });

  if (loading)
    return (
      <div className="h-10 mb-3 animate-pulse bg-[rgb(var(--color-bg-secondary))] rounded-lg" />
    );

  return (
    <BillListHeaderView
      model={{
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
        onCreate: () => router.push("/dashboard/bills/create"),
      }}
    />
  );
};

export default BillListHeader;
