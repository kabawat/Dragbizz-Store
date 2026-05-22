"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, Grid3X3, List, Mic, Plus, Search, Upload, Crown } from "lucide-react";
import { Button, Input, Select, SideDrawer } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getSuppliers, setViewMode } from "@/store/slices/supplier/supplierSlice";
import { AddSupplierDrawer } from "@/components/supplier";
import SupplierDownloadDrawer from "@/components/supplier/SupplierDownloadDrawer";
import SupplierBulkUploadDrawer from "@/components/supplier/SupplierBulkUploadDrawer";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { useSubscriptionAccess } from "@/hooks/permissions/useSubscriptionAccess";

const SupplierListHeader = ({
    searchValue,
    setSearchValue,
    accountStatus,
    setAccountStatus,
    riskLevel,
    setRiskLevel,
    isActive,
    setIsActive,
    showAddSupplierDrawer,
    setShowAddSupplierDrawer
}) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();

    const { viewMode, suppliers } = useAppSelector((state) => state.suppliers);
    const { selectedStore } = useAppSelector((state) => state.profile);
    const storeId = useMemo(() => selectedStore?.storeId || selectedStore?._id || selectedStore?.id || "",
        [selectedStore]);

    // Internal Drawers
    const [showDownloadDrawer, setShowDownloadDrawer] = useState(false);
    const [showBulkUploadDrawer, setShowBulkUploadDrawer] = useState(false);

    const { can, loading } = useModulePermissions("supplier");
    const { hasAccess, withAccess } = useSubscriptionAccess();

    const canCreate = can("create");
    // Button is shown if user has report OR read permission
    const canSeeDownload = can("report") || can("read");
    // Check if subscription blocks reports
    const isReportLocked = !hasAccess("supplier", false, true);

    const handleDownloadClick = withAccess(
        "supplier",
        () => setShowDownloadDrawer(true),
        false,
        true
    );

    useEffect(() => {
        if (!canCreate) {
            setShowAddSupplierDrawer(false);
            setShowBulkUploadDrawer(false);
        }
    }, [canCreate]);

    const searchInputRef = useRef(null);
    const lastFetchRef = useRef(null);
    const hasFetchedRef = useRef({ fetched: false, storeId: null, search: null, status: null, risk: null, active: null });

    useEffect(() => {
        lastFetchRef.current = null;
        hasFetchedRef.current = { fetched: false, storeId: null, search: null, status: null, risk: null, active: null };
    }, [storeId]);

    const fetchSuppliers = useCallback(async () => {
        if (!storeId) return;

        const fetchKey = `${storeId}-${searchValue}-${accountStatus}-${riskLevel}-${isActive}`;
        if (lastFetchRef.current === fetchKey) return;

        const last = hasFetchedRef.current;
        if (last.fetched && last.storeId === storeId && last.search === searchValue && last.status === accountStatus && last.risk === riskLevel && last.active === isActive) return;

        lastFetchRef.current = fetchKey;

        const params = {
            store: storeId,
            search: searchValue,
            limit: 20,
            nextCursor: null,
            isFreshLoad: true,
            accountStatus: accountStatus || undefined,
            riskLevel: riskLevel || undefined,
            isActive: isActive === "" ? undefined : isActive,
        };

        try {
            await dispatch(getSuppliers(params));
            hasFetchedRef.current = { fetched: true, storeId, search: searchValue, status: accountStatus, risk: riskLevel, active: isActive };
        } catch {
            lastFetchRef.current = null;
        }
    }, [dispatch, storeId, searchValue, accountStatus, riskLevel, isActive]);

    useEffect(() => {
        if (!storeId) return;
        const last = hasFetchedRef.current;
        if (last.fetched && last.storeId === storeId && last.search === searchValue && last.status === accountStatus && last.risk === riskLevel && last.active === isActive) return;

        const timer = setTimeout(() => fetchSuppliers(), 350);
        return () => clearTimeout(timer);
    }, [storeId, searchValue, accountStatus, riskLevel, isActive, fetchSuppliers]);

    const handleViewModeChange = useCallback((mode) => {
        dispatch(setViewMode(mode));
        localStorage.setItem("suppliers-view-mode", mode);
    }, [dispatch]);

    useCommonHotkeys({
        onNew: canCreate ? () => setShowAddSupplierDrawer(true) : undefined,
        onClose: () => {
            if (showAddSupplierDrawer) setShowAddSupplierDrawer(false);
            if (showDownloadDrawer) setShowDownloadDrawer(false);
            if (showBulkUploadDrawer) setShowBulkUploadDrawer(false);
        },
        onSearch: () => searchInputRef.current?.focus(),
        onViewTable: () => handleViewModeChange("table"),
        onViewGrid: () => handleViewModeChange("card"),
        onDownload: canSeeDownload ? handleDownloadClick : undefined,
    });

    const handleSupplierSuccess = useCallback(() => {
        if (!storeId) return;
        dispatch(getSuppliers({ store: storeId, limit: 20, isFreshLoad: true }));
    }, [dispatch, storeId]);

    if (loading) return <div className="h-10 mb-3 animate-pulse bg-[rgb(var(--color-bg-secondary))] rounded-lg" />;

    return (
        <div className="p-5">
            <div className="flex justify-between items-center lg:flex-row gap-4 mb-0">
                <div className="w-100">
                    <Input
                        type="text"
                        ref={searchInputRef}
                        placeholder={`${t("common.search")} ${t("suppliers.title").toLowerCase()}...`}
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target?.value ?? e)}
                        leftIcon={Search}
                        className="w-100"
                    />
                </div>

                <div className="flex flex-wrap gap-3 items-center">
                    <div className="min-w-[160px]">
                        <Select
                            placeholder="Account Status"
                            value={accountStatus}
                            onChange={setAccountStatus}
                            options={[
                                { value: "", label: "All statuses" },
                                { value: "ACTIVE", label: "Active" },
                                { value: "INACTIVE", label: "Inactive" },
                                { value: "SUSPENDED", label: "Suspended" },
                            ]}
                            clearable
                        />
                    </div>
                    <div className="min-w-[150px]">
                        <Select
                            placeholder="Risk Level"
                            value={riskLevel}
                            onChange={setRiskLevel}
                            options={[
                                { value: "", label: "All risk levels" },
                                { value: "LOW", label: "Low" },
                                { value: "MEDIUM", label: "Medium" },
                                { value: "HIGH", label: "High" },
                            ]}
                            clearable
                        />
                    </div>
                    <div className="min-w-[140px]">
                        <Select
                            placeholder="Status"
                            value={isActive}
                            onChange={setIsActive}
                            options={[
                                { value: "", label: "All" },
                                { value: "true", label: "Active" },
                                { value: "false", label: "Inactive" },
                            ]}
                            clearable
                        />
                    </div>

                    {suppliers.length > 0 && (
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
                    {canCreate && (
                        <Button
                            variant="secondary"
                            onClick={() => setShowBulkUploadDrawer(true)}
                            leftIcon={Upload}
                        >
                            {t("suppliers.bulkUpload", "Bulk Upload")}
                        </Button>
                    )}

                    {canSeeDownload && (
                        <Button
                            variant="secondary"
                            onClick={handleDownloadClick}
                            className="flex items-center gap-2 h-9 relative"
                        >
                            <Download className="w-4 h-4" />
                            {t("common.download")}
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
                                variant="primary"
                                onClick={() => setShowAddSupplierDrawer(true)}
                                leftIcon={Plus}
                            >
                                {t("suppliers.addSupplier")}
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <AddSupplierDrawer
                isOpen={showAddSupplierDrawer}
                onClose={() => setShowAddSupplierDrawer(false)}
                onSuccess={handleSupplierSuccess}
            />

            <SupplierDownloadDrawer
                isOpen={showDownloadDrawer}
                onClose={() => setShowDownloadDrawer(false)}
            />

            {showBulkUploadDrawer && (
                <SupplierBulkUploadDrawer
                    isOpen={showBulkUploadDrawer}
                    onClose={() => setShowBulkUploadDrawer(false)}
                    onSuccess={handleSupplierSuccess}
                />
            )}
        </div>
    );
};

export default SupplierListHeader;
