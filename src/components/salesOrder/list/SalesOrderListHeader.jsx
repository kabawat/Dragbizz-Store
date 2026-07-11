"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Grid3X3, List, QrCode, RotateCcw, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button, Input, Select, DateRangeFilter } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getSalesOrders, setViewMode } from "@/store/slices/salesOrdersSlice";
import { CatalogQRModal } from "@/components/common";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";

const SalesOrderListHeader = ({
    canCreate: canCreateProp,
    searchValue,
    setSearchValue,
    statusFilter,
    setStatusFilter,
    orderSourceFilter,
    setOrderSourceFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
}) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const router = useRouter();

    const { viewMode } = useAppSelector((state) => state.salesOrders);
    const { selectedStore } = useAppSelector((state) => state.profile);
    const storeId = useMemo(() => selectedStore?.storeId || "", [selectedStore?.storeId]);

    const { can, loading } = useModulePermissions("sales_order");
    const canCreate = canCreateProp ?? can("create");

    const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);

    const searchInputRef = useRef(null);
    const lastFetchRef = useRef(null);
    const hasFetchedRef = useRef({ fetched: false, storeId: null, searchValue: null, statusFilter: null, orderSourceFilter: null, startDate: null, endDate: null });

    const hasActiveFilters = Boolean(startDate || endDate);

    // Reset fetch refs when store changes
    useEffect(() => {
        lastFetchRef.current = null;
        hasFetchedRef.current = { fetched: false, storeId: null, searchValue: null, statusFilter: null, orderSourceFilter: null, startDate: null, endDate: null };
    }, [storeId]);

    // Fetch Orders with debounce + deduplication
    const fetchSalesOrders = useCallback(async () => {
        if (!storeId) return;

        const fetchKey = `${storeId}-${searchValue}-${statusFilter}-${orderSourceFilter}-${startDate}-${endDate}`;
        if (lastFetchRef.current === fetchKey) return;

        const last = hasFetchedRef.current;
        if (last.fetched && last.storeId === storeId && last.searchValue === searchValue && last.statusFilter === statusFilter && last.orderSourceFilter === orderSourceFilter && last.startDate === startDate && last.endDate === endDate) return;

        lastFetchRef.current = fetchKey;

        const params = {
            store: storeId,
            search: searchValue,
            limit: 20,
            cursor: null,
            isFreshLoad: true,
            status: statusFilter !== "all" ? statusFilter : undefined,
            orderSource: orderSourceFilter !== "all" ? orderSourceFilter : undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
        };

        try {
            await dispatch(getSalesOrders(params));
            hasFetchedRef.current = { fetched: true, storeId, searchValue, statusFilter, orderSourceFilter, startDate, endDate };
        } catch {
            lastFetchRef.current = null;
        }
    }, [dispatch, storeId, searchValue, statusFilter, orderSourceFilter, startDate, endDate]);

    // Debounce hook replacement
    useEffect(() => {
        if (!storeId) return;
        const last = hasFetchedRef.current;
        if (last.fetched && last.storeId === storeId && last.searchValue === searchValue && last.statusFilter === statusFilter && last.orderSourceFilter === orderSourceFilter && last.startDate === startDate && last.endDate === endDate) return;

        const timer = setTimeout(() => fetchSalesOrders(), 350);
        return () => clearTimeout(timer);
    }, [storeId, searchValue, statusFilter, orderSourceFilter, startDate, endDate, fetchSalesOrders]);

    const handleClearFilters = () => {
        setStartDate("");
        setEndDate("");
    };

    const handleViewModeChange = useCallback((mode) => {
        dispatch(setViewMode(mode));
        localStorage.setItem("sales-orders-view-mode", mode);
    }, [dispatch]);

    useCommonHotkeys({
        onNew: canCreate ? () => setIsCatalogModalOpen(true) : undefined,
        onClose: () => setIsCatalogModalOpen(false),
        onSearch: () => searchInputRef.current?.focus(),
        onViewTable: () => handleViewModeChange("table"),
        onViewGrid: () => handleViewModeChange("card"),
    });

    return (
        <div className="p-5">
            <div className="flex justify-between items-center lg:flex-row gap-4 mb-0">
                <div className="w-100">
                    <Input
                        type="text"
                        ref={searchInputRef}
                        placeholder={t("common.searchOrders")}
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target?.value ?? e)}
                        leftIcon={Search}
                        className="w-100"
                    />
                </div>

                <div className="flex flex-wrap gap-3 items-center mt-3 lg:mt-0">
                    <div className="min-w-[140px]">
                        <Select
                            placeholder={t("common.type", { defaultValue: "All Types" })}
                            value={orderSourceFilter}
                            onChange={setOrderSourceFilter}
                            options={[
                                { value: "all", label: "All Sources" },
                                { value: "ONLINE", label: "Online" },
                                { value: "IN_STORE", label: "In-Store" }
                            ]}
                        />
                    </div>

                    <div className="min-w-[160px]">
                        <Select
                            placeholder={t("common.allStatus")}
                            value={statusFilter}
                            onChange={setStatusFilter}
                            options={[
                                { value: "all", label: t("common.allStatus") },
                                { value: "PENDING", label: t("salesOrder.status.pending") },
                                { value: "CONFIRMED", label: t("salesOrder.status.confirmed") },
                                { value: "PROCESSING", label: t("salesOrder.status.processing") },
                                { value: "SHIPPED", label: t("salesOrder.status.shipped") },
                                { value: "DELIVERED", label: t("salesOrder.status.delivered") },
                                { value: "CANCELLED", label: t("salesOrder.status.cancelled") },
                            ]}
                        />
                    </div>

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

                    {canCreate && selectedStore?.catalogId && (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => setIsCatalogModalOpen(true)}
                                leftIcon={QrCode}
                                className="h-9 font-semibold border-[rgb(var(--color-primary))]/20 text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))]/5"
                            >
                                {t("settings.publicCatalog")}
                            </Button>

                            <CatalogQRModal
                                isOpen={isCatalogModalOpen}
                                onClose={() => setIsCatalogModalOpen(false)}
                                store={selectedStore}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SalesOrderListHeader;
