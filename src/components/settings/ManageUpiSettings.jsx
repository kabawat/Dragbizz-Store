"use client";
import { ManageUpiSettingsView } from "@dragorbit/features/integrations";

import { Loader2 } from "lucide-react";
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
  const isUpiLoading = useAppSelector(
    (state) =>
      state.storeUpi?.loadingStoreId === storeId && state.storeUpi?.isLoading,
  );

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
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-[rgb(var(--color-primary))]" />
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-12 text-center">
        <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
          {t("settings.noStoresFound")}
        </h3>
        <p className="text-sm text-[rgb(var(--color-text-secondary))]">
          {t("settings.getStartedByAddingFirstStore")}
        </p>
      </div>
    );
  }

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
