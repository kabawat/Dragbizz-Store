"use client";
import { useRef, useState, useCallback, useEffect } from "react";
import { Download, Grid3X3, List, Mic, Plus, Search, Users, Upload, Crown } from "lucide-react";
import { Button, Input, SideDrawer } from "@/components/ui";
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
    onSuccess,
    onSearchChange, // optional: notify parent if needed
}) => {
    const dispatch = useAppDispatch();
    const { t } = useTranslation();

    // viewMode, selectedStore & customers come from Redux directly
    const { viewMode, customers } = useAppSelector((state) => state.customers);
    const { selectedStore } = useAppSelector((state) => state.profile);
    const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id;

    const hasCustomers = customers.length > 0;

    const { can, loading } = useModulePermissions("customer");
    const { hasAccess, withAccess } = useSubscriptionAccess();

    const canCreate = can("create");
    // Button is shown if user has report OR read permission
    const canSeeDownload = can("report") || can("read");
    // Check if subscription blocks reports
    const isReportLocked = !hasAccess("customer", false, true);

    const handleDownloadClick = withAccess(
        "customer",
        () => setShowDownloadDrawer(true),
        false,
        true
    );

    // search state lives here
    const [searchValue, setSearchValue] = useState("");

    const [showCustomerDrawer, setShowCustomerDrawer] = useState(false);
    const [showDownloadDrawer, setShowDownloadDrawer] = useState(false);
    const [showBulkUploadDrawer, setShowBulkUploadDrawer] = useState(false);

    useEffect(() => {
        if (!canCreate) setShowCustomerDrawer(false);
    }, [canCreate]);

    const searchInputRef = useRef(null);

    const handleSearchChange = (value) => {
        setSearchValue(value);
        onSearchChange?.(value);
    };

    const handleViewModeChange = (mode) => {
        dispatch(setViewMode(mode));
        localStorage.setItem("customers-view-mode", mode);
    };

    const handleCustomerSuccess = (customerData) => {
        setShowCustomerDrawer(false);
        onSuccess?.(customerData);
    };

    const handleBulkUploadSuccess = useCallback(() => {
        if (!storeId) return;
        dispatch(getCustomers({ store: storeId, limit: 20, isFreshLoad: true }));
    }, [dispatch, storeId]);

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

    if (loading) return <div className="h-10 mb-3 animate-pulse bg-[rgb(var(--color-bg-secondary))] rounded-lg" />;

    return (
        <div className="p-5">
            <div className="flex justify-between items-center lg:flex-row gap-4 mb-0">
                <div className="w-100">
                    <Input
                        ref={searchInputRef}
                        type="text"
                        placeholder={`${t("common.search")} ${t("customers.title").toLowerCase()}...`}
                        value={searchValue}
                        onChange={handleSearchChange}
                        leftIcon={Search}
                        className="w-100"
                    />
                </div>

                <div className="flex gap-3">
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

            {/* Create Customer Drawer */}
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

            {/* Download Drawer */}
            {showDownloadDrawer && (
                <CustomerDownloadDrawer
                    isOpen={showDownloadDrawer}
                    onClose={() => setShowDownloadDrawer(false)}
                />
            )}

            {/* Bulk Upload Drawer */}
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
