"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import storeService from "@/service/retailer/store.service";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { getStoreUpi } from "@/store/slices/storeUpiSlice";
import { UpiHeader, UpiList, UpiAddDrawer, UpiEditDrawer, UpiDeleteModal, } from "@/components/settings/upi";

// Payment tab - shows all agency UPI IDs (not store-specific)
const ManageUpiSettings = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { showError, showSuccess } = useGlobalToast();
  const { stores: reduxStores } = useAppSelector((state) => state.profile);

  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [editingUpi, setEditingUpi] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [upiToDelete, setUpiToDelete] = useState(null);

  const hasFetchedRef = useRef(false);
  const isFetchingRef = useRef(false);

  const storeId = stores[0]?._id || stores[0]?.id;
  const agencyKey = storeId ? `agency_${storeId}` : null;
  const upiData = useAppSelector((state) =>
    agencyKey ? state.storeUpi?.byStoreId?.[agencyKey] : null
  );
  const upiIds = upiData?.upiIds || [];
  const isUpiLoading = useAppSelector(
    (state) =>
      state.storeUpi?.loadingStoreId === storeId && state.storeUpi?.isLoading
  );

  const fetchStores = useCallback(async () => {
    if (hasFetchedRef.current || isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      setIsLoading(true);
      const result = await storeService.getStores();
      if (result?.success) {
        const storesData = result.data?.data || result.data || [];
        setStores(Array.isArray(storesData) ? storesData : []);
        hasFetchedRef.current = true;
      } else {
        if (reduxStores?.length > 0) {
          setStores(reduxStores);
          hasFetchedRef.current = true;
        } else {
          showError(result?.message || "Failed to fetch stores");
          setStores([]);
        }
      }
    } catch (error) {
      if (reduxStores?.length > 0) {
        setStores(reduxStores);
        hasFetchedRef.current = true;
      } else {
        showError(
          error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch stores"
        );
        setStores([]);
      }
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [reduxStores, showError]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  useEffect(() => {
    if (storeId) {
      dispatch(getStoreUpi({ storeId, scope: "agency" }));
    }
  }, [storeId, dispatch]);

  const handleAddUpi = () => setIsAddDrawerOpen(true);
  const handleEditUpi = (item) => {
    setEditingUpi(item);
    setIsEditDrawerOpen(true);
  };
  const handleDeleteUpi = (item) => {
    setUpiToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleSuccess = (message) => {
    showSuccess(message);
    hasFetchedRef.current = false;
    fetchStores();
    if (storeId) {
      dispatch(getStoreUpi({ storeId, scope: "agency", forceRefresh: true }));
    }
  };

  const activeStores = stores.filter((s) => s.status !== "DELETED");

  if (isLoading && stores.length === 0) {
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
    <div className="space-y-6">
      <UpiHeader
        upiCount={upiIds.length}
        isLoading={isUpiLoading}
        onAddUpi={handleAddUpi}
      />
      <UpiList
        upiIds={upiIds}
        stores={activeStores}
        isLoading={isUpiLoading}
        onAddUpi={handleAddUpi}
        onEditUpi={handleEditUpi}
        onDeleteUpi={handleDeleteUpi}
        showSuccess={showSuccess}
      />

      <UpiAddDrawer
        isOpen={isAddDrawerOpen}
        storeId={storeId}
        stores={activeStores}
        onClose={() => setIsAddDrawerOpen(false)}
        onSuccess={handleSuccess}
        onError={showError}
      />

      <UpiEditDrawer
        isOpen={isEditDrawerOpen}
        storeId={storeId}
        editingUpi={editingUpi}
        stores={activeStores}
        onClose={() => {
          setIsEditDrawerOpen(false);
          setEditingUpi(null);
        }}
        onSuccess={handleSuccess}
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
        onSuccess={handleSuccess}
        onError={showError}
      />
    </div>
  );
};

export default ManageUpiSettings;
