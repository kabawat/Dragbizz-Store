"use client";
import { SupplierListContentView } from "@dragorbit/features/suppliers";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  DeleteSupplierModal,
  EditSupplierDrawer,
  SupplierCard,
  SupplierTable,
} from "@/components/supplier";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useApiResponse } from "@/hooks/useApiResponse";
import { supplierService } from "@/service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getSuppliers,
  removeSupplier,
} from "@/store/slices/supplier/supplierSlice";
import { pickStoreId } from "@/utils/store.util";

const SupplierListContent = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { suppliers, isLoading, isFetchingMore, pagination, viewMode } =
    useAppSelector((state) => state.suppliers);

  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = pickStoreId(selectedStore) || "";

  const { can } = useModulePermissions("supplier");
  const canEdit = can("edit");
  const canDelete = can("delete");

  // Contextual Component Variables
  const [selectedSupplierIds, setSelectedSupplierIds] = useState([]);

  // Deletion Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);

  const { execute: executeDelete, loading: isDeleting } = useApiResponse();

  // Editor Drawer
  const [showEditSupplierDrawer, setShowEditSupplierDrawer] = useState(false);
  const [editingSupplierId, setEditingSupplierId] = useState(null);

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
            getSuppliers({
              store: storeIdRef.current,
              limit: 20,
              nextCursor: paginationRef.current.nextCursor,
              isFreshLoad: false,
            })
          );
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [dispatch, pagination.hasNextPage]);

  // Action Handlers
  const handleEditSupplier = useCallback(
    (supplierId) => {
      if (!canEdit) return;
      setEditingSupplierId(supplierId);
      setShowEditSupplierDrawer(true);
    },
    [canEdit]
  );

  const handleViewSupplier = useCallback(
    (supplierId) => {
      router.push(`/dashboard/suppliers/${supplierId}`);
    },
    [router]
  );

  const handlePrintSupplier = useCallback(
    (supplierId) => {
      router.push(`/dashboard/suppliers/${supplierId}?print=true`);
    },
    [router]
  );

  const handleDeleteSupplier = useCallback(
    (supplierId) => {
      if (!canDelete) return;
      const supplier = suppliers.find(
        (s) => s.id === supplierId || s._id === supplierId
      );
      setSupplierToDelete({
        id: supplierId,
        name: supplier?.name || "Supplier",
      });
      setShowDeleteModal(true);
    },
    [suppliers, canDelete]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!supplierToDelete) return;

    const result = await executeDelete(
      supplierService.deleteSupplier(supplierToDelete.id, storeId),
      {
        message: `${supplierToDelete.name} deleted successfully`,
        showToast: true,
      }
    );

    if (result?.success || result?.data?.success) {
      dispatch(removeSupplier(supplierToDelete.id));
    }
    setShowDeleteModal(false);
    setSupplierToDelete(null);
  }, [dispatch, supplierToDelete, storeId, executeDelete]);

  const handleSupplierSuccess = useCallback(() => {
    dispatch(
      getSuppliers({
        store: storeId,
        limit: 20,
        nextCursor: null,
        isFreshLoad: true,
      })
    );
  }, [dispatch, storeId]);

  return (
    <SupplierListContentView
      model={{
        viewMode,
        SupplierTable,
        suppliers,
        canEdit,
        handleEditSupplier,
        canDelete,
        handleDeleteSupplier,
        handleViewSupplier,
        handlePrintSupplier,
        isLoading,
        t,
        SupplierCard,
        setSelectedSupplierIds,
        selectedSupplierIds,
        pagination,
        sentinelRef,
        isFetchingMore,
        DeleteSupplierModal,
        showDeleteModal,
        setShowDeleteModal,
        setSupplierToDelete,
        supplierToDelete,
        handleConfirmDelete,
        isDeleting,
        EditSupplierDrawer,
        showEditSupplierDrawer,
        setShowEditSupplierDrawer,
        setEditingSupplierId,
        editingSupplierId,
        handleSupplierSuccess,
      }}
    />
  );
};

export default SupplierListContent;
