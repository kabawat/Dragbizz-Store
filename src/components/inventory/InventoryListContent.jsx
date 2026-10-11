"use client";
import { InventoryListContentView } from "@dragorbit/features/inventory";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  InventoryCard,
  InventoryTable,
  DeleteInventoryModal,
} from "@/components/inventory";
import { StockInDrawer } from "@/components/ui";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getInventories,
  removeInventoryLocal,
} from "@/store/slices/inventory/inventorySlice";
import { useRouter } from "next/navigation";

const InventoryListContent = ({
  canEdit = false,
  canDelete = false,
  canCreate = false,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { showSuccess } = useGlobalToast();

  const {
    inventories,
    isLoading,
    isFetchingMore,
    error,
    pagination,
    viewMode,
  } = useAppSelector((state) => state.inventory);
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId || "";

  // Local state
  const [inventoryToDelete, setInventoryToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStockInDrawer, setShowStockInDrawer] = useState(false);
  const [inventoryForStockIn, setInventoryForStockIn] = useState(null);

  // ─── Refs for stable IntersectionObserver callback ───────────────────────
  const sentinelRef = useRef(null);
  const isFetchingMoreRef = useRef(isFetchingMore);
  const storeIdRef = useRef(storeId);
  const paginationRef = useRef(pagination);
  isFetchingMoreRef.current = isFetchingMore;
  storeIdRef.current = storeId;
  paginationRef.current = pagination;

  // ─── Infinite scroll via IntersectionObserver ─────────────────────────────
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !pagination.hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !isFetchingMoreRef.current &&
          storeIdRef.current
        ) {
          dispatch(
            getInventories({
              store: storeIdRef.current,
              page: Math.floor(inventories.length / 20) + 1,
              limit: 20,
              isFreshLoad: false,
            }),
          );
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [dispatch, pagination.hasNextPage, inventories.length]);

  // Navigation handlers
  const handleViewStock = useCallback(
    (inventoryId) => router.push(`/dashboard/stock/${inventoryId}`),
    [router],
  );

  const handleDuplicate = useCallback((_inventoryId) => {}, []);

  // Stock In
  const handleStockIn = useCallback(
    (inventoryId) => {
      const inventory = inventories.find(
        (i) => (i.id || i._id) === inventoryId,
      );
      setInventoryForStockIn(inventory);
      setShowStockInDrawer(true);
    },
    [inventories],
  );

  const stockInItem = inventoryForStockIn?.product
    ? inventoryForStockIn
    : inventoryForStockIn?.productId
      ? {
          ...inventoryForStockIn,
          product: {
            id: inventoryForStockIn.productId,
            name: inventoryForStockIn?.product?.name,
            sku: inventoryForStockIn?.product?.sku,
          },
        }
      : inventoryForStockIn;
  const handleCloseStockInDrawer = useCallback(() => {
    setShowStockInDrawer(false);
    setInventoryForStockIn(null);
  }, []);
  const handleStockInSuccess = useCallback(
    (message) => {
      showSuccess(message);
      if (storeId) {
        dispatch(
          getInventories({ store: storeId, limit: 20, isFreshLoad: true }),
        );
      }
    },
    [showSuccess, dispatch, storeId],
  );

  // Delete handlers
  const handleDeleteStock = useCallback(
    (inventoryId) => {
      const inventory = inventories.find(
        (i) => (i.id || i._id) === inventoryId,
      );
      setInventoryToDelete({
        id: inventoryId,
        name: inventory?.product?.name || t("products.product"),
      });
      setShowDeleteModal(true);
    },
    [inventories, t],
  );
  const handleDeleteClose = useCallback(() => {
    setInventoryToDelete(null);
    setShowDeleteModal(false);
  }, []);
  const handleDeleteSuccess = useCallback(
    (deletedId) => {
      dispatch(removeInventoryLocal(deletedId));
      setShowDeleteModal(false);
      setInventoryToDelete(null);
    },
    [dispatch],
  );

  return (
    <InventoryListContentView
      model={{
        StockInDrawer,
        viewMode,
        InventoryTable,
        inventories,
        handleViewStock,
        handleDeleteStock,
        handleDuplicate,
        handleStockIn,
        isLoading,
        t,
        canEdit,
        canDelete,
        canCreate,
        InventoryCard,
        pagination,
        sentinelRef,
        isFetchingMore,
        DeleteInventoryModal,
        showDeleteModal,
        handleDeleteClose,
        inventoryToDelete,
        handleDeleteSuccess,
        showStockInDrawer,
        handleCloseStockInDrawer,
        stockInItem,
        handleStockInSuccess,
      }}
    />
  );
};

export default InventoryListContent;
