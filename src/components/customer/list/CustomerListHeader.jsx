"use client";
import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { Download, Grid3X3, List, Plus, RotateCcw, Search, Crown, Users } from "lucide-react";
import { Button, Input, Select, SideDrawer, DateRangeFilter } from "@/components/ui";
import { CreateCustomer } from "@/components/customer";
import CustomerDownloadDrawer from "@/components/customer/CustomerDownloadDrawer";
import CustomerBulkUploadDrawer from "@/components/customer/CustomerBulkUploadDrawer";
import CustomerImportMenu from "@/components/customer/CustomerImportMenu";
import OpeningBalanceImportDrawer from "@/components/customer/OpeningBalanceImportDrawer";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getCustomers, setViewMode } from "@/store/slices/customers/customerSlice";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { useSubscriptionAccess } from "@/hooks/permissions/useSubscriptionAccess";
import { getCustomerSourceOptions } from "@/utils/customer/customerSource.util";
import {
    buildCustomerListParams,
    getCustomerListFetchKey,
} from "@/utils/customer/customerList.util";
import useSelectedStoreId from "@/hooks/store/useSelectedStoreId";

const CustomerListHeader = ({
    searchValue,
    setSearchValue,
    isActive,
    setIsActive,
    source,
    setSource,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    hasDueOnly,
    setHasDueOnly,
    onSuccess,
}) => {
    const dispatch = useAppDispatch();
    const { t } = useTranslation();

    const { viewMode, customers } = useAppSelector((state) => state.customers);
    const { storeId, ready: storeReady } = useSelectedStoreId();

    const hasCustomers = customers.length > 0;

    const { can, loading } = useModulePermissions("customer");
    const { hasAccess, withAccess } = useSubscriptionAccess();

    const canCreate = can("create");
    const canSeeDownload = can("report") || can("read");
    const isReportLocked = !hasAccess("customer", false, true);

    const handleDownloadClick = withAccess(
        "customer",
        () => setShowDownloadDrawer(true),
        false,
        true
    );

    const [showCustomerDrawer, setShowCustomerDrawer] = useState(false);
    const [showDownloadDrawer, setShowDownloadDrawer] = useState(false);
    const [showBulkUploadDrawer, setShowBulkUploadDrawer] = useState(false);
    const [showOpeningBalanceDrawer, setShowOpeningBalanceDrawer] = useState(false);

    useEffect(() => {
        if (!canCreate) setShowCustomerDrawer(false);
    }, [canCreate]);

    const searchInputRef = useRef(null);
    const importMenuRef = useRef(null);
    const lastFetchRef = useRef(null);
    const listFilters = { search: searchValue, isActive, source, startDate, endDate };
    const hasFetchedRef = useRef({
        fetched: false,
        storeId: null,
        search: null,
        active: null,
        source: null,
        startDate: null,
        endDate: null,
    });

    const sourceOptions = useMemo(() => getCustomerSourceOptions(t), [t]);
    const hasActiveFilters = Boolean(isActive || source || startDate || endDate);

    useEffect(() => {
        lastFetchRef.current = null;
        hasFetchedRef.current = {
            fetched: false,
            storeId: null,
            search: null,
            active: null,
            source: null,
            startDate: null,
            endDate: null,
        };
    }, [storeId]);

    const handleClearFilters = () => {
        setIsActive("");
        setSource("");
        setStartDate("");
        setEndDate("");
    };

    const fetchCustomers = useCallback(async () => {
        if (!storeReady || !storeId) return;

        const fetchKey = getCustomerListFetchKey(storeId, listFilters);
        if (lastFetchRef.current === fetchKey) return;

        const last = hasFetchedRef.current;
        if (
            last.fetched &&
            last.storeId === storeId &&
            last.search === searchValue &&
            last.active === isActive &&
            last.source === source &&
            last.startDate === startDate &&
            last.endDate === endDate
        ) {
            return;
        }

        lastFetchRef.current = fetchKey;

        const params = buildCustomerListParams({
            storeId,
            ...listFilters,
            isFreshLoad: true,
        });

        try {
            await dispatch(getCustomers(params));
            hasFetchedRef.current = {
                fetched: true,
                storeId,
                search: searchValue,
                active: isActive,
                source,
                startDate,
                endDate,
            };
        } catch {
            lastFetchRef.current = null;
        }
    }, [dispatch, storeReady, storeId, searchValue, isActive, source, startDate, endDate]);

    useEffect(() => {
        if (!storeReady || !storeId) return;
        const last = hasFetchedRef.current;
        if (
            last.fetched &&
            last.storeId === storeId &&
            last.search === searchValue &&
            last.active === isActive &&
            last.source === source &&
            last.startDate === startDate &&
            last.endDate === endDate
        ) {
            return;
        }

        const timer = setTimeout(() => fetchCustomers(), 350);
        return () => clearTimeout(timer);
    }, [storeReady, storeId, searchValue, isActive, source, startDate, endDate, fetchCustomers]);

    const handleViewModeChange = (mode) => {
        dispatch(setViewMode(mode));
        localStorage.setItem("customers-view-mode", mode);
    };

    const handleCustomerSuccess = (customerData) => {
        setShowCustomerDrawer(false);
        onSuccess?.(customerData);
        fetchCustomers();
    };

    const handleBulkUploadSuccess = useCallback(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    useCommonHotkeys({
        onNew: canCreate ? () => setShowCustomerDrawer(true) : undefined,
        onDownload: canSeeDownload ? handleDownloadClick : undefined,
        onSearch: () => searchInputRef.current?.focus(),
        onViewTable: () => handleViewModeChange("table"),
        onViewGrid: () => handleViewModeChange("card"),
        onClose: () => {
            if (showCustomerDrawer) setShowCustomerDrawer(false);
            else if (showDownloadDrawer) setShowDownloadDrawer(false);
            else if (showBulkUploadDrawer) setShowBulkUploadDrawer(false);
            else if (showOpeningBalanceDrawer) setShowOpeningBalanceDrawer(false);
            else importMenuRef.current?.close?.();
        },
    });

    if (loading) {
        return <div className="h-10 mb-3 animate-pulse bg-[rgb(var(--color-bg-secondary))] rounded-lg" />;
    }

    return (
        <div className="p-5">
            <div className="flex justify-between items-center lg:flex-row gap-4 mb-0">
                <div className="flex flex-1 flex-wrap items-center gap-3 min-w-0">
                    <div className="flex-1 min-w-[200px] max-w-md">
                        <Input
                            ref={searchInputRef}
                            type="text"
                            placeholder={`${t("common.search")} ${t("customers.title").toLowerCase()}...`}
                            value={searchValue}
                            onChange={setSearchValue}
                            leftIcon={Search}
                            className="w-full"
                        />
                    </div>
                    <div className="min-w-[140px]">
                        <Select
                            placeholder={t("common.status") || "Status"}
                            value={isActive}
                            onChange={setIsActive}
                            options={[
                                { value: "", label: t("common.allStatus") },
                                { value: "true", label: t("common.active") },
                                { value: "false", label: t("common.inactive") },
                            ]}
                            clearable
                        />
                    </div>
                    <div className="min-w-[160px]">
                        <Select
                            placeholder={t("customers.source")}
                            value={source}
                            onChange={setSource}
                            options={sourceOptions}
                            clearable
                        />
                    </div>
                    <Button
                        type="button"
                        variant={hasDueOnly ? "primary" : "outline"}
                        size="sm"
                        onClick={() => setHasDueOnly((value) => !value)}
                    >
                        {t("khata.hasDueFilter")}
                    </Button>
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

                <div className="flex gap-3 flex-shrink-0">
                    {hasCustomers && (
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
                    )}

                    {canSeeDownload && (
                        <Button
                            variant="secondary"
                            onClick={handleDownloadClick}
                            className="flex items-center gap-2 h-9 relative"
                        >
                            <Download className="w-4 h-4" />
                            {t("customers.download")}
                            {isReportLocked && (
                                <div className="absolute -top-1 -right-1 bg-[#f59e0b] text-white rounded-full p-0.5 shadow-sm">
                                    <Crown size={8} className="fill-white/20" />
                                </div>
                            )}
                        </Button>
                    )}

                    {canCreate && (
                        <>
                            <CustomerImportMenu
                                ref={importMenuRef}
                                onOpeningBalance={() => setShowOpeningBalanceDrawer(true)}
                                onBulkUpload={() => setShowBulkUploadDrawer(true)}
                            />

                            <Button
                                variant="primary"
                                onClick={() => setShowCustomerDrawer(true)}
                                leftIcon={Plus}
                            >
                                {t("customers.addCustomer")}
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <SideDrawer
                isOpen={showCustomerDrawer}
                onClose={() => setShowCustomerDrawer(false)}
                title={t("customers.addNewCustomer")}
                icon={Users}
                width="w-full md:w-2/3 lg:w-1/2"
            >
                <div className="p-6 h-full">
                    <CreateCustomer
                        onSuccess={handleCustomerSuccess}
                        onCancel={() => setShowCustomerDrawer(false)}
                        showCancelButton={true}
                        autoRedirect={false}
                        mode="drawer"
                    />
                </div>
            </SideDrawer>

            {showDownloadDrawer && (
                <CustomerDownloadDrawer
                    isOpen={showDownloadDrawer}
                    onClose={() => setShowDownloadDrawer(false)}
                />
            )}

            {showBulkUploadDrawer && (
                <CustomerBulkUploadDrawer
                    isOpen={showBulkUploadDrawer}
                    onClose={() => setShowBulkUploadDrawer(false)}
                    onSuccess={handleBulkUploadSuccess}
                />
            )}

            {showOpeningBalanceDrawer && (
                <OpeningBalanceImportDrawer
                    isOpen={showOpeningBalanceDrawer}
                    onClose={() => setShowOpeningBalanceDrawer(false)}
                    onSuccess={handleBulkUploadSuccess}
                />
            )}
        </div>
    );
};

export default CustomerListHeader;
