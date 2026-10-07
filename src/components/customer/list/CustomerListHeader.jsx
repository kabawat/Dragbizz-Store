"use client";
import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { Grid3X3, List, Search, Crown, Users } from "lucide-react";
import { Input, Select, SideDrawer, DateRangeFilter } from "@/components/ui";
import { CreateCustomer } from "@/components/customer";
import CustomerDownloadDrawer from "@/components/customer/CustomerDownloadDrawer";
import CustomerBulkUploadDrawer from "@/components/customer/CustomerBulkUploadDrawer";
import CustomerImportMenu from "@/components/customer/CustomerImportMenu";
import OpeningBalanceImportDrawer from "@/components/customer/OpeningBalanceImportDrawer";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getCustomers,
  setViewMode,
} from "@/store/slices/customers/customerSlice";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { useSubscriptionAccess } from "@/hooks/permissions/useSubscriptionAccess";
import { getCustomerSourceOptions } from "@/utils/customer/customerSource.util";
import {
  buildCustomerListParams,
  getCustomerListFetchKey,
} from "@/utils/customer/customerList.util";
import { TableToolbar } from "@dragorbit/ui/table";
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
  balanceFilter,
  setBalanceFilter,
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
  const [showOpeningBalanceDrawer, setShowOpeningBalanceDrawer] =
    useState(false);

  useEffect(() => {
    if (!canCreate) setShowCustomerDrawer(false);
  }, [canCreate]);

  const searchInputRef = useRef(null);
  const importMenuRef = useRef(null);
  const lastFetchRef = useRef(null);
  const listFilters = useMemo(
    () => ({ search: searchValue, isActive, source, startDate, endDate }),
    [searchValue, isActive, source, startDate, endDate]
  );
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
  const hasActiveFilters = Boolean(
    isActive || source || startDate || endDate || balanceFilter
  );

  const balanceFilterOptions = useMemo(
    () => [
      { value: "both", label: t("khata.balanceFilterBoth") },
      { value: "due", label: t("khata.due") },
      { value: "advance", label: t("khata.advance") },
    ],
    [t]
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: Reset the request cache whenever the selected store changes.
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
    setBalanceFilter("");
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
  }, [
    dispatch,
    storeReady,
    storeId,
    searchValue,
    isActive,
    source,
    startDate,
    endDate,
    listFilters,
  ]);

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
  }, [
    storeReady,
    storeId,
    searchValue,
    isActive,
    source,
    startDate,
    endDate,
    fetchCustomers,
  ]);

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
    return (
      <div className="h-10 mb-3 animate-pulse bg-[rgb(var(--color-bg-secondary))] rounded-lg" />
    );
  }

  return (
    <>
      <TableToolbar
        searchSlot={
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
        }
        filters={
          <>
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
            <div className="min-w-[150px]">
              <Select
                placeholder={t("khata.balanceFilter")}
                value={balanceFilter}
                onChange={setBalanceFilter}
                options={balanceFilterOptions}
                clearable
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
          </>
        }
        clearFilters={{
          visible: hasActiveFilters,
          label: t("common.clearFilters"),
          onClick: handleClearFilters,
        }}
        viewSwitcher={
          hasCustomers && (
            <div className="flex bg-[rgb(var(--color-bg-secondary))] rounded-lg">
              <button
                type="button"
                onClick={() => handleViewModeChange("table")}
                className={`px-3 cursor-pointer py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  viewMode === "table"
                    ? "bg-[rgb(var(--color-primary))] text-white"
                    : "text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]"
                }`}
              >
                <List className="w-4 h-4" />
                {t("common.tableView")}
              </button>
              <button
                type="button"
                onClick={() => handleViewModeChange("card")}
                className={`px-3 cursor-pointer py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  viewMode === "card"
                    ? "bg-[rgb(var(--color-primary))] text-white"
                    : "text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]"
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
                {t("common.cardView")}
              </button>
            </div>
          )
        }
        download={{
          label: t("customers.download"),
          hidden: !canSeeDownload,
          onClick: handleDownloadClick,
          badge: isReportLocked ? (
            <div className="absolute -top-1 -right-1 bg-[#f59e0b] text-white rounded-full p-0.5 shadow-sm">
              <Crown size={8} className="fill-white/20" />
            </div>
          ) : undefined,
        }}
        actions={
          canCreate ? (
            <CustomerImportMenu
              ref={importMenuRef}
              onOpeningBalance={() => setShowOpeningBalanceDrawer(true)}
              onBulkUpload={() => setShowBulkUploadDrawer(true)}
            />
          ) : null
        }
        create={{
          label: t("customers.addCustomer"),
          hidden: !canCreate,
          onClick: () => setShowCustomerDrawer(true),
        }}
      />

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
    </>
  );
};

export default CustomerListHeader;
