"use client";
import { StoreSettingsView } from "@dragorbit/features/settings";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CatalogQRModal } from "@/components/common";
import { FEATURES } from "@/constants/features";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useGlobalToast } from "@/contexts/ToastContext";
import useApiResponse from "@/hooks/useApiResponse";
import { useSubscriptionAccess } from "@/hooks/permissions/useSubscriptionAccess";
import storeService from "@/service/retailer/store.service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getRetailerDetails } from "@/store/slices/profileSlice";
import {
  canUseFeatureQuota,
  getFeatureFromSubscription,
} from "@/utils/subscriptionCapability.util";
import StoreAddDrawer from "./StoreAddDrawer";
import StoreDeleteModal from "./StoreDeleteModal";
import StoreEditDrawer from "./StoreEditDrawer";
import StoreHeader from "./StoreHeader";
import StoreList from "./StoreList";

const StoreSettings = () => {
  const dispatch = useAppDispatch();
  const { selectedStore, agency } = useAppSelector((state) => state.profile);
  const {
    subscription,
    showUpgradeModal,
    isLoading: subscriptionLoading,
  } = useSubscription();
  const { isStaff } = useSubscriptionAccess();
  const {
    execute: fetchStoresApi,
    data,
    loading: isLoading,
  } = useApiResponse();
  const stores = data || [];

  const { showError, showSuccess } = useGlobalToast();

  const storeFeature = useMemo(
    () => getFeatureFromSubscription(subscription, FEATURES.STORE),
    [subscription],
  );

  const canAddStore = useMemo(() => {
    // Avoid flashing upgrade UI while subscription is still loading
    if (subscriptionLoading && !subscription) return true;
    return canUseFeatureQuota(storeFeature, {
      quantity: 1,
      fallbackUsage: stores?.length || 0,
    });
  }, [subscriptionLoading, subscription, storeFeature, stores?.length]);

  const storeLimit = useMemo(() => {
    if (!storeFeature) return null;
    if (storeFeature.usageType === "UNLIMITED" || storeFeature.maxLimit === null) {
      return null;
    }
    return Math.max(0, Number(storeFeature.maxLimit) || 0);
  }, [storeFeature]);

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

    fetchStoresApi(storeService.getStores(), { showToast: false }).finally(
      () => {
        isFetchingRef.current = false;
        hasFetchedRef.current = true;
      },
    );
  }, [fetchStoresApi]);

  // Fetch stores on component mount (only once)
  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // Handle add store — respect plan store quota before opening drawer
  const handleAddStore = () => {
    if (!agency || !agency.agencyId) {
      showError("Agency not found. Please create an agency first.");
      return;
    }

    if (!canAddStore) {
      const limitText =
        storeLimit != null ? ` of ${storeLimit}` : "";
      const message = isStaff
        ? `Your plan allows${limitText} store${storeLimit === 1 ? "" : "s"}. Contact your store admin to upgrade.`
        : `Your plan allows${limitText} store${storeLimit === 1 ? "" : "s"}. Upgrade to add another store.`;
      showUpgradeModal(message, isStaff ? "INFO" : "UPGRADE");
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
        "You must have at least one active store. The last store cannot be deleted.",
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
    <StoreSettingsView
      model={{
        StoreHeader,
        stores,
        isLoading,
        handleAddStore,
        canAddStore,
        storeLimit,
        StoreList,
        selectedStore,
        handleEditStore,
        handleDeleteStore,
        handleShowCatalog,
        StoreAddDrawer,
        isAddDrawerOpen,
        setIsAddDrawerOpen,
        handleAddSuccess,
        showError,
        StoreEditDrawer,
        isEditDrawerOpen,
        editingStore,
        setIsEditDrawerOpen,
        setEditingStore,
        handleEditSuccess,
        showSuccess,
        StoreDeleteModal,
        isDeleteModalOpen,
        storeToDelete,
        setIsDeleteModalOpen,
        setStoreToDelete,
        handleDeleteSuccess,
        CatalogQRModal,
        isCatalogModalOpen,
        setIsCatalogModalOpen,
        setActiveStore,
        activeStore,
      }}
    />
  );
};

export default StoreSettings;
