"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useGlobalToast } from "@/contexts/ToastContext";
import storeService from "@/service/retailer/store.service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getRetailerDetails } from "@/store/slices/profileSlice";
import StoreAddDrawer from "./StoreAddDrawer";
import StoreDeleteModal from "./StoreDeleteModal";
import StoreEditDrawer from "./StoreEditDrawer";
import StoreHeader from "./StoreHeader";
import StoreList from "./StoreList";
import { CatalogQRModal } from "@/components/common";
import useApiResponse from "@/hooks/useApiResponse";

const StoreSettings = () => {
  const dispatch = useAppDispatch();
  const {
    selectedStore,
    agency,
  } = useAppSelector((state) => state.profile);
  const { execute: fetchStoresApi, data, loading: isLoading } = useApiResponse();
  const stores = data || [];

  const { showError, showSuccess } = useGlobalToast();

  // Drawer/Modal state
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState(null);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [activeStore, setActiveStore] = useState(null);

  // Refs to prevent duplicate API calls
  const hasFetchedRef = useRef(false);
  const isFetchingRef = useRef(false);

  // Fetch stores from API
  const fetchStores = useCallback(() => {
    if (hasFetchedRef.current || isFetchingRef.current) {
      return;
    }
    isFetchingRef.current = true;

    fetchStoresApi(storeService.getStores(), { showToast: false })
      .finally(() => {
        isFetchingRef.current = false;
        hasFetchedRef.current = true;
      });
  }, [fetchStoresApi]);

  // Fetch stores on component mount (only once)
  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // Handle add store - open drawer
  const handleAddStore = () => {
    if (!agency || !agency.agencyId) {
      showError("Agency not found. Please create an agency first.");
      return;
    }
    setIsAddDrawerOpen(true);
  };

  // Handle edit store - open drawer
  const handleEditStore = (store) => {
    setEditingStore(store);
    setIsEditDrawerOpen(true);
  };

  // Handle delete store - open modal
  const handleDeleteStore = (store) => {
    if (!store) return;

    // Frontend guard: don't allow deleting the only store
    if (stores?.length <= 1) {
      showError(
        "You must have at least one active store. The last store cannot be deleted."
      );
      return;
    }

    setStoreToDelete(store);
    setIsDeleteModalOpen(true);
  };

  // Handle show catalog QR
  const handleShowCatalog = (store) => {
    setActiveStore(store);
    setIsCatalogModalOpen(true);
  };

  // Handle success callbacks
  const handleAddSuccess = (message) => {
    showSuccess(message);
    hasFetchedRef.current = false;
    fetchStores();
    dispatch(getRetailerDetails({ forceRefresh: true }));
  };

  const handleEditSuccess = (message) => {
    showSuccess(message);
    hasFetchedRef.current = false;
    fetchStores();
    // Refresh global retailer profile after store update
    dispatch(getRetailerDetails({ forceRefresh: true }));
  };

  const handleDeleteSuccess = (message) => {
    showSuccess(message);
    hasFetchedRef.current = false;
    fetchStores();
    dispatch(getRetailerDetails({ forceRefresh: true }));
  };

  return (
    <div className="space-y-6">
      <StoreHeader
        storesCount={stores?.length}
        isLoading={isLoading}
        onAddStore={handleAddStore}
      />

      <StoreList
        stores={stores}
        isLoading={isLoading}
        selectedStore={selectedStore}
        onAddStore={handleAddStore}
        onEditStore={handleEditStore}
        onDeleteStore={handleDeleteStore}
        onShowCatalog={handleShowCatalog}
      />

      <StoreAddDrawer
        isOpen={isAddDrawerOpen}
        onClose={() => setIsAddDrawerOpen(false)}
        onSuccess={handleAddSuccess}
        onError={showError}
      />

      <StoreEditDrawer
        isOpen={isEditDrawerOpen}
        editingStore={editingStore}
        onClose={() => {
          setIsEditDrawerOpen(false);
          setEditingStore(null);
        }}
        onSuccess={handleEditSuccess}
        onError={showError}
        showSuccess={showSuccess}
      />

      <StoreDeleteModal
        isOpen={isDeleteModalOpen}
        storeToDelete={storeToDelete}
        stores={stores}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setStoreToDelete(null);
        }}
        onSuccess={handleDeleteSuccess}
        onError={showError}
      />

      <CatalogQRModal
        isOpen={isCatalogModalOpen}
        onClose={() => {
          setIsCatalogModalOpen(false);
          setActiveStore(null);
        }}
        store={activeStore}
      />
    </div>
  );
};

export default StoreSettings;
