"use client";
import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { Download, Grid3X3, List, Plus, Search, Upload, Crown, Users } from "lucide-react";
import { Button, Input, Select, SideDrawer } from "@/components/ui";
import { CreateCustomer } from "@/components/customer";
import CustomerDownloadDrawer from "@/components/customer/CustomerDownloadDrawer";
import CustomerBulkUploadDrawer from "@/components/customer/CustomerBulkUploadDrawer";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getCustomers, setViewMode } from "@/store/slices/customers/customerSlice";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { useSubscriptionAccess } from "@/hooks/permissions/useSubscriptionAccess";

const CustomerListHeader = ({
    searchValue,
    setSearchValue,
    isActive,
    setIsActive,
    onSuccess,
}) => {
    const dispatch = useAppDispatch();
    const { t } = useTranslation();

    const { viewMode, customers } = useAppSelector((state) => state.customers);
    const { selectedStore } = useAppSelector((state) => state.profile);
    const storeId = useMemo(
        () => selectedStore?.storeId || selectedStore?._id || selectedStore?.id || "",
        [selectedStore]
    );

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

    useEffect(() => {
        if (!canCreate) setShowCustomerDrawer(false);
    }, [canCreate]);

    const searchInputRef = useRef(null);
    const lastFetchRef = useRef(null);
    const hasFetchedRef = useRef({ fetched: false, storeId: null, search: null, active: null });

    useEffect(() => {
        lastFetchRef.current = null;
        hasFetchedRef.current = { fetched: false, storeId: null, search: null, active: null };
    }, [storeId]);

    const fetchCustomers = useCallback(async () => {
        if (!storeId) return;

        const fetchKey = `${storeId}-${searchValue}-${isActive}`;
        if (lastFetchRef.current === fetchKey) return;

        const last = hasFetchedRef.current;
        if (last.fetched && last.storeId === storeId && last.search === searchValue && last.active === isActive) {
            return;
        }

        lastFetchRef.current = fetchKey;

        const params = {
            store: storeId,
            limit: 20,
            isFreshLoad: true,
            ...(searchValue?.trim() ? { search: searchValue.trim() } : {}),
            ...(isActive !== "" ? { isActive } : {}),
        };

        try {
            await dispatch(getCustomers(params));
            hasFetchedRef.current = { fetched: true, storeId, search: searchValue, active: isActive };
        } catch {
            lastFetchRef.current = null;
        }
    }, [dispatch, storeId, searchValue, isActive]);

    useEffect(() => {
        if (!storeId) return;
        const last = hasFetchedRef.current;
        if (last.fetched && last.storeId === storeId && last.search === searchValue && last.active === isActive) {
            return;
        }

        const timer = setTimeout(() => fetchCustomers(), 350);
        return () => clearTimeout(timer);
    }, [storeId, searchValue, isActive, fetchCustomers]);

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
                            <Button
                                variant="secondary"
                                onClick={() => setShowBulkUploadDrawer(true)}
                                className="flex items-center gap-2 h-9"
                            >
                                <Upload className="w-4 h-4" />
                                {t("customers.bulkUpload", "Bulk Upload")}
                            </Button>

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
        </div>
    );
};

export default CustomerListHeader;
