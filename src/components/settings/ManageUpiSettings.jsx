"use client";
import { EmptyState, TableSkeleton } from "@dragorbit/ui";
import { ManageUpiSettingsView } from "@dragorbit/features/integrations";

import { useCallback, useEffect, useState } from "react";
import {
  UpiAddDrawer,
  UpiDeleteModal,
  UpiEditDrawer,
  UpiHeader,
  UpiList,
} from "@/components/settings/upi";
import { useGlobalToast } from "@/contexts/ToastContext";
import useSelectedStoreId from "@/hooks/store/useSelectedStoreId";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getStoreUpi } from "@/store/slices/storeUpiSlice";

const ManageUpiSettings = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { showError, showSuccess } = useGlobalToast();
  const { stores } = useAppSelector((state) => state.profile);
  const { storeId, ready: storeReady } = useSelectedStoreId();

  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [editingUpi, setEditingUpi] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [upiToDelete, setUpiToDelete] = useState(null);

  const agencyKey = storeId ? `agency_${storeId}` : null;
  const upiData = useAppSelector((state) =>
    agencyKey ? state.storeUpi?.byStoreId?.[agencyKey] : null,
  );
  const upiIds = upiData?.upiIds || [];
  const requestLoading = useAppSelector(
    (state) =>
      state.storeUpi?.loadingStoreId === storeId && state.storeUpi?.isLoading,
  );
  const requestError = useAppSelector((state) => state.storeUpi?.error);
  const isUpiLoading = requestLoading || (!upiData && !requestError);

  useEffect(() => {
    if (storeReady && storeId) {
      dispatch(getStoreUpi({ storeId, scope: "agency" }));
    }
  }, [storeReady, storeId, dispatch]);

  const handleAddUpi = () => setIsAddDrawerOpen(true);
  const handleEditUpi = (item) => {
    setEditingUpi(item);
    setIsEditDrawerOpen(true);
  };
  const handleDeleteUpi = (item) => {
    setUpiToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleMutationSuccess = useCallback(
    (message) => {
      showSuccess(message);
      if (storeId) {
        dispatch(getStoreUpi({ storeId, scope: "agency", forceRefresh: true }));
      }
    },
    [dispatch, showSuccess, storeId],
  );

  if (!storeReady) {
    return (
      <TableSkeleton />
    );
  }

  if (stores.length === 0) {
    return <EmptyState fullHeight title={t("settings.noStoresFound")} description={t("settings.getStartedByAddingFirstStore")} />;
  }

  if (requestError && !upiData) return <EmptyState fullHeight type="error" title={t("common.error")} description={String(requestError)} />;

  return (
    <ManageUpiSettingsView
      model={{
        UpiHeader,
        upiIds,
        isUpiLoading,
        handleAddUpi,
        UpiList,
        stores,
        handleEditUpi,
        handleDeleteUpi,
        UpiAddDrawer,
        isAddDrawerOpen,
        storeId,
        setIsAddDrawerOpen,
        handleMutationSuccess,
        showError,
        UpiEditDrawer,
        isEditDrawerOpen,
        editingUpi,
        setIsEditDrawerOpen,
        setEditingUpi,
        UpiDeleteModal,
        isDeleteModalOpen,
        upiToDelete,
        setIsDeleteModalOpen,
        setUpiToDelete,
      }}
    />
  );
};

export default ManageUpiSettings;
