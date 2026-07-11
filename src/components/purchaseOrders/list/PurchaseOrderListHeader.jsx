"use client";
import { Grid3X3, List, Plus, RotateCcw, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, DateRangeFilter } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getPurchaseOrders as getPOs, setViewMode } from "@/store/slices/purchaseOrdersSlice";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";

const PurchaseOrderListHeader = ({
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

    const { viewMode } = useAppSelector((state) => state.purchaseOrders);
    const { selectedStore } = useAppSelector((state) => state.profile);
    const storeId = useMemo(() => selectedStore?.storeId || "", [selectedStore?.storeId]);

    const { can, loading } = useModulePermissions("purchase_order");
    const canCreate = can("create");

    const searchInputRef = useRef(null);

    const lastFetchRef = useRef(null);
    const hasFetchedRef = useRef({ fetched: false, storeId: null, searchValue: null, startDate: null, endDate: null });
    const hasActiveFilters = Boolean(startDate || endDate);

    // Reset fetch refs when store changes
    useEffect(() => {
        lastFetchRef.current = null;
        hasFetchedRef.current = { fetched: false, storeId: null, searchValue: null, startDate: null, endDate: null };
    }, [storeId]);

    // Fetch POs with debounce + deduplication
    const fetchPurchaseOrders = useCallback(async () => {
        if (!storeId) return;

        const fetchKey = `${storeId}-${searchValue}-${startDate}-${endDate}`;
        if (lastFetchRef.current === fetchKey) return;

        const last = hasFetchedRef.current;
        if (last.fetched && last.storeId === storeId && last.searchValue === searchValue && last.startDate === startDate && last.endDate === endDate) return;

        lastFetchRef.current = fetchKey;

        const params = {
            store: storeId,
            search: searchValue,
            limit: 20,
            cursor: null,
            isFreshLoad: true,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
        };

        await dispatch(getPOs(params));
        hasFetchedRef.current = { fetched: true, storeId, searchValue, startDate, endDate };
    }, [dispatch, storeId, searchValue, startDate, endDate]);

    // Debounce hook replacement
    useEffect(() => {
        if (!storeId) return;
        const last = hasFetchedRef.current;
        if (last.fetched && last.storeId === storeId && last.searchValue === searchValue && last.startDate === startDate && last.endDate === endDate) return;

        const timer = setTimeout(() => fetchPurchaseOrders(), 350);
        return () => clearTimeout(timer);
    }, [storeId, searchValue, startDate, endDate, fetchPurchaseOrders]);

    const handleClearFilters = () => {
        setStartDate("");
        setEndDate("");
    };

    const handleViewModeChange = useCallback((mode) => {
        dispatch(setViewMode(mode));
        localStorage.setItem("purchase-orders-view-mode", mode);
    }, [dispatch]);

    useCommonHotkeys({
        onNew: canCreate ? () => router.push("/dashboard/purchase-orders/create") : undefined,
        onSearch: () => searchInputRef.current?.focus(),
        onViewTable: () => handleViewModeChange("table"),
        onViewGrid: () => handleViewModeChange("card"),
    });

    if (loading) return <div className="h-10 mb-3 animate-pulse bg-[rgb(var(--color-bg-secondary))] rounded-lg" />;

    return (
        <div className="p-5">
            <div className="flex justify-between items-center lg:flex-row gap-4 mb-0">
                <div className="flex flex-wrap items-center gap-3">
                    <Input
                        type="text"
                        ref={searchInputRef}
                        placeholder={`${t("common.search")} ${t("purchaseOrders.title").toLowerCase()}...`}
                        value={searchValue}
                        onChange={setSearchValue}
                        leftIcon={Search}
                        className="w-100"
                    />
                    <DateRangeFilter
                        startDate={startDate}
                        endDate={endDate}
                        onChange={({ startDate: nextStart, endDate: nextEnd }) => {
                            setStartDate(nextStart);
                            setEndDate(nextEnd);
                        }}
                    />
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            onClick={handleClearFilters}
                            className="h-10 px-3 text-sm font-medium text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-primary))] flex items-center gap-2"
                        >
                            <RotateCcw className="w-4 h-4" />
                            {t("common.clearFilters")}
                        </Button>
                    )}
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
                        <Button variant="primary" leftIcon={Plus} onClick={() => router.push("/dashboard/purchase-orders/create")} >
                            {t("purchaseOrders.createPO")}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PurchaseOrderListHeader;
