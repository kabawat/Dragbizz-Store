"use client";
import { SupplierListHeaderView } from "@dragorbit/features/suppliers";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useTranslation } from "@/hooks/ui/useTranslation";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getSuppliers,
  setViewMode,
} from "@/store/slices/supplier/supplierSlice";
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
  setShowAddSupplierDrawer,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const { viewMode, suppliers } = useAppSelector((state) => state.suppliers);
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = useMemo(
    () =>
      selectedStore?.storeId || selectedStore?._id || selectedStore?.id || "",
    [selectedStore],
  );

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
    true,
  );

  useEffect(() => {
    if (!canCreate) {
      setShowAddSupplierDrawer(false);
      setShowBulkUploadDrawer(false);
    }
  }, [canCreate]);

  const searchInputRef = useRef(null);
  const lastFetchRef = useRef(null);
  const hasFetchedRef = useRef({
    fetched: false,
    storeId: null,
    search: null,
    status: null,
    risk: null,
    active: null,
  });

  useEffect(() => {
    lastFetchRef.current = null;
    hasFetchedRef.current = {
      fetched: false,
      storeId: null,
      search: null,
      status: null,
      risk: null,
      active: null,
    };
  }, [storeId]);

  const fetchSuppliers = useCallback(async () => {
    if (!storeId) return;

    const fetchKey = `${storeId}-${searchValue}-${accountStatus}-${riskLevel}-${isActive}`;
    if (lastFetchRef.current === fetchKey) return;

    const last = hasFetchedRef.current;
    if (
      last.fetched &&
      last.storeId === storeId &&
      last.search === searchValue &&
      last.status === accountStatus &&
      last.risk === riskLevel &&
      last.active === isActive
    )
      return;

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
      hasFetchedRef.current = {
        fetched: true,
        storeId,
        search: searchValue,
        status: accountStatus,
        risk: riskLevel,
        active: isActive,
      };
    } catch {
      lastFetchRef.current = null;
    }
  }, [dispatch, storeId, searchValue, accountStatus, riskLevel, isActive]);

  useEffect(() => {
    if (!storeId) return;
    const last = hasFetchedRef.current;
    if (
      last.fetched &&
      last.storeId === storeId &&
      last.search === searchValue &&
      last.status === accountStatus &&
      last.risk === riskLevel &&
      last.active === isActive
    )
      return;

    const timer = setTimeout(() => fetchSuppliers(), 350);
    return () => clearTimeout(timer);
  }, [
    storeId,
    searchValue,
    accountStatus,
    riskLevel,
    isActive,
    fetchSuppliers,
  ]);

  const handleViewModeChange = useCallback(
    (mode) => {
      dispatch(setViewMode(mode));
      localStorage.setItem("suppliers-view-mode", mode);
    },
    [dispatch],
  );

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

  if (loading)
    return (
      <div className="h-10 mb-3 animate-pulse bg-[rgb(var(--color-bg-secondary))] rounded-lg" />
    );

  return (
    <SupplierListHeaderView
      model={{
        searchInputRef,
        t,
        searchValue,
        setSearchValue,
        accountStatus,
        setAccountStatus,
        riskLevel,
        setRiskLevel,
        isActive,
        setIsActive,
        suppliers,
        handleViewModeChange,
        viewMode,
        canCreate,
        setShowBulkUploadDrawer,
        canSeeDownload,
        handleDownloadClick,
        isReportLocked,
        setShowAddSupplierDrawer,
        AddSupplierDrawer,
        showAddSupplierDrawer,
        handleSupplierSuccess,
        SupplierDownloadDrawer,
        showDownloadDrawer,
        setShowDownloadDrawer,
        showBulkUploadDrawer,
        SupplierBulkUploadDrawer,
      }}
    />
  );
};

export default SupplierListHeader;
