"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { getStoreUpi } from "@/store/slices/storeUpiSlice";
import {
  UpiHeader,
  UpiList,
  UpiAddDrawer,
  UpiEditDrawer,
  UpiDeleteModal,
} from "@/components/settings/upi";
import useSelectedStoreId from "@/hooks/store/useSelectedStoreId";

const ManageUpiPage = () => {
  const { t } = useTranslation();

  useDashboardHeader(t("payments.manageUpiIds"), t("settings.upi.manageUpiDescription"));
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
    agencyKey ? state.storeUpi?.byStoreId?.[agencyKey] : null
  );
  const upiIds = upiData?.upiIds || [];
  const isUpiLoading = useAppSelector(
    (state) =>
      state.storeUpi?.loadingStoreId === storeId && state.storeUpi?.isLoading
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
    [dispatch, showSuccess, storeId]
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-5 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {!storeReady ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-[rgb(var(--color-primary))]" />
            </div>
          ) : stores.length === 0 ? (
            <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-12 text-center">
              <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                {t("settings.noStoresFound")}
              </h3>
              <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                {t("settings.getStartedByAddingFirstStore")}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <UpiHeader
                upiCount={upiIds.length}
                isLoading={isUpiLoading}
                onAddUpi={handleAddUpi}
              />
              <UpiList
                upiIds={upiIds}
                stores={stores}
                isLoading={isUpiLoading}
                onAddUpi={handleAddUpi}
                onEditUpi={handleEditUpi}
                onDeleteUpi={handleDeleteUpi}
                showSuccess={showSuccess}
              />
            </div>
          )}
        </div>
      </div>

      <UpiAddDrawer
        isOpen={isAddDrawerOpen}
        storeId={storeId}
        stores={stores}
        onClose={() => setIsAddDrawerOpen(false)}
        onSuccess={handleMutationSuccess}
        onError={showError}
      />

      <UpiEditDrawer
        isOpen={isEditDrawerOpen}
        storeId={storeId}
        editingUpi={editingUpi}
        stores={stores}
        onClose={() => {
          setIsEditDrawerOpen(false);
          setEditingUpi(null);
        }}
        onSuccess={handleMutationSuccess}
        onError={showError}
      />

      <UpiDeleteModal
        isOpen={isDeleteModalOpen}
        upiToDelete={upiToDelete}
        storeId={storeId}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setUpiToDelete(null);
        }}
        onSuccess={handleMutationSuccess}
        onError={showError}
      />
    </div>
  );
};

export default ManageUpiPage;
