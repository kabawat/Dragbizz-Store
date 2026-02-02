"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import useErrorHandling from "@/hooks/useErrorHandling";
import storeService from "@/service/retailer/store.service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getRetailerDetails } from "@/store/slices/profileSlice";
import StoreAddDrawer from "./StoreAddDrawer";
import StoreDeleteModal from "./StoreDeleteModal";
import StoreEditDrawer from "./StoreEditDrawer";
import StoreHeader from "./StoreHeader";
import StoreList from "./StoreList";
import StoreUpiDrawer from "./StoreUpiDrawer";
import { CatalogQRModal } from "@/components/common";

const StoreSettings = () => {
  const dispatch = useAppDispatch();
  const {
    stores: reduxStores,
    selectedStore,
    agency,
  } = useAppSelector((state) => state.profile);
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showError, showSuccess } = useErrorHandling();

  // Drawer/Modal state
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [editingStoreId, setEditingStoreId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState(null);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [activeStore, setActiveStore] = useState(null);
  const [isUpiDrawerOpen, setIsUpiDrawerOpen] = useState(false);
  const [upiDrawerStore, setUpiDrawerStore] = useState(null);

  // Refs to prevent duplicate API calls
  const hasFetchedRef = useRef(false);
  const isFetchingRef = useRef(false);

  // Fetch stores from API
  const fetchStores = useCallback(async () => {
    // Prevent duplicate calls
    if (hasFetchedRef.current || isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;

    try {
      setIsLoading(true);
      const result = await storeService.getStores();

      if (result?.success) {
        const storesData = result.data?.data || result.data || [];
        setStores(storesData);
        hasFetchedRef.current = true;
      } else {
        if (reduxStores && reduxStores.length > 0) {
          setStores(reduxStores);
          hasFetchedRef.current = true;
        } else {
          showError(result?.message || "Failed to fetch stores");
          setStores([]);
        }
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "An unexpected error occurred";

      if (reduxStores && reduxStores.length > 0) {
        setStores(reduxStores);
        hasFetchedRef.current = true;
      } else {
        showError(errorMessage);
        setStores([]);
      }
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [reduxStores, showError]);

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
  const handleEditStore = (storeId) => {
    setEditingStoreId(storeId);
    setIsEditDrawerOpen(true);
  };

  // Handle delete store - open modal
  const handleDeleteStore = (store) => {
    if (!store) return;

    // Frontend guard: don't allow deleting the only store
    if (stores.filter((s) => s.status !== "DELETED").length <= 1) {
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

  // Handle manage UPI
  const handleManageUpi = (store) => {
    setUpiDrawerStore(store);
    setIsUpiDrawerOpen(true);
  };

  // Handle success callbacks
  const handleAddSuccess = (message) => {
    showSuccess(message);
    hasFetchedRef.current = false;
    fetchStores();
    // Refresh global retailer profile so Redux stores/selectedStore stay in sync
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
    // Refresh global retailer profile after store delete
    dispatch(getRetailerDetails({ forceRefresh: true }));
  };

  return (
    <div className="space-y-6">
      <StoreHeader
        storesCount={stores.length}
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
        onManageUpi={handleManageUpi}
      />

      <StoreAddDrawer
        isOpen={isAddDrawerOpen}
        agency={agency}
        onClose={() => setIsAddDrawerOpen(false)}
        onSuccess={handleAddSuccess}
        onError={showError}
      />

      <StoreEditDrawer
        isOpen={isEditDrawerOpen}
        editingStoreId={editingStoreId}
        onClose={() => {
          setIsEditDrawerOpen(false);
          setEditingStoreId(null);
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

      <StoreUpiDrawer
        isOpen={isUpiDrawerOpen}
        store={upiDrawerStore}
        onClose={() => {
          setIsUpiDrawerOpen(false);
          setUpiDrawerStore(null);
        }}
        onSuccess={() => {}}
        onError={showError}
        showSuccess={showSuccess}
      />
    </div>
  );
};

export default StoreSettings;
