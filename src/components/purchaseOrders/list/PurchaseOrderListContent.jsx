"use client";
import { PurchaseOrderListContentView } from "@dragorbit/features/purchase-orders";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BillDeleteConfirmModal as PurchaseOrderDeleteConfirmModal } from "@/components/bills";
import AdvancePaymentDrawer from "@/components/purchaseOrders/AdvancePaymentDrawer";
import CreateBillDrawer from "@/components/purchaseOrders/CreateBillDrawer";
import PurchaseOrderGrid from "@/components/purchaseOrders/PurchaseOrderGrid";
import PurchaseOrderTable from "@/components/purchaseOrders/PurchaseOrderTable";

import { useToast } from "@/hooks/ui/useToast";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { purchaseOrderService } from "@/service/retailer";
import {
  getPurchaseOrders as getPOs,
  removePurchaseOrder,
} from "@/store/slices/purchaseOrdersSlice";
import { formatCurrency } from "@/utils/currencyFormatter";
import { formatDateShort as formatDate } from "@/utils/dateFormatter";
import { normalizePurchaseOrder } from "@/utils/purchaseOrder";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";

const PurchaseOrderListContent = ({
  searchValue = "",
  startDate = "",
  endDate = "",
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    list: purchaseOrders,
    pagination,
    isLoading,
    isFetchingMore,
    viewMode,
  } = useAppSelector((state) => state.purchaseOrders);
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId || "";
  const { toasts, showToast, removeToast } = useToast();
  const { can } = useModulePermissions("purchase_order");
  const canEdit = can("edit");
  const canDelete = can("delete");
  const canView = can("read");

  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRefs = useRef({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [poToDelete, setPoToDelete] = useState(null);
  const scrollRef = useRef(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingDeleteIds, setPendingDeleteIds] = useState([]);

  // Drawers state
  const [showCreateBillDrawer, setShowCreateBillDrawer] = useState(false);
  const [selectedPOForBill, setSelectedPOForBill] = useState(null);
  const [showAdvancePaymentDrawer, setShowAdvancePaymentDrawer] =
    useState(false);
  const [selectedPOForPayment, setSelectedPOForPayment] = useState(null);

  // ─── Refs for stable IntersectionObserver callback ───────────────────────
  const sentinelRef = useRef(null);
  const isFetchingMoreRef = useRef(isFetchingMore);
  const storeIdRef = useRef(storeId);
  const paginationRef = useRef(pagination);
  const searchRef = useRef(searchValue);
  const startDateRef = useRef(startDate);
  const endDateRef = useRef(endDate);
  isFetchingMoreRef.current = isFetchingMore;
  storeIdRef.current = storeId;
  paginationRef.current = pagination;
  searchRef.current = searchValue;
  startDateRef.current = startDate;
  endDateRef.current = endDate;

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
            getPOs({
              store: storeIdRef.current,
              limit: 20,
              cursor: paginationRef.current.nextCursor,
              search: searchRef.current || undefined,
              startDate: startDateRef.current || undefined,
              endDate: endDateRef.current || undefined,
              isFreshLoad: false,
            }),
          );
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [dispatch, pagination.hasNextPage]);

  // Close contextual menu on blur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        openMenuId &&
        menuRefs.current[openMenuId] &&
        !menuRefs.current[openMenuId].contains(event.target)
      ) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  // Clean pending deletes across state changes
  useEffect(() => {
    if (pendingDeleteIds.length === 0) return;
    setPendingDeleteIds((prev) =>
      prev.filter((id) =>
        purchaseOrders.some((po) => (po._id || po.id) === id),
      ),
    );
  }, [purchaseOrders, pendingDeleteIds.length]);

  const handleMenuToggle = useCallback((id) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
  }, []);

  const handleMenuAction = useCallback(
    (id, action) => {
      const po = purchaseOrders.find((b) => (b._id || b.id) === id);
      if (!po) return;
      const poStatus = (po.status || "").toUpperCase();
      const isDeleted = poStatus === "DELETED";

      switch (action) {
        case "view":
          if (!canView) return;
          router.push(`/dashboard/purchase-orders/${po._id || po.id}`);
          break;
        case "edit":
          if (isDeleted || !canEdit) return;
          router.push(`/dashboard/purchase-orders/${po._id || po.id}/edit`);
          break;
        case "createBill":
          if (isDeleted || !canEdit) return;
          setSelectedPOForBill(po);
          setShowCreateBillDrawer(true);
          setOpenMenuId(null);
          break;
        case "advancePayment":
          if (isDeleted || !canEdit) return;
          setSelectedPOForPayment(po);
          setShowAdvancePaymentDrawer(true);
          setOpenMenuId(null);
          break;
        case "delete":
          if (!canDelete) return;
          handleDelete(po);
          break;
        default:
          break;
      }
      setOpenMenuId(null);
    },
    [purchaseOrders, router],
  );

  const handleDelete = useCallback((po) => {
    setPoToDelete(po);
    setShowDeleteModal(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!poToDelete || isDeleting) return;

    const poId = poToDelete._id || poToDelete.id;
    if (!poId) return;

    try {
      setIsDeleting(true);
      const result = await purchaseOrderService.deletePurchaseOrder(
        poId,
        storeId,
      );

      // Immediately sync Redux cache
      dispatch(removePurchaseOrder(poId));

      setPendingDeleteIds((prev) =>
        prev.includes(poId) ? prev : [...prev, poId],
      );
      setShowDeleteModal(false);
      setPoToDelete(null);

      const friendlyPo = poToDelete?.poNumber || poToDelete?.billNumber || poId;
      const poNumber = result?.data?.poNumber || friendlyPo;

      showToast(
        `Purchase Order ${poNumber} deletion has been scheduled.`,
        "success",
        3000,
      );
    } catch (error) {
      showToast(
        error?.message || "Failed to delete purchase order",
        "error",
        3000,
      );
    } finally {
      setIsDeleting(false);
    }
  }, [poToDelete, isDeleting, storeId, dispatch, showToast]);

  const pendingDeleteSet = useMemo(
    () => new Set(pendingDeleteIds),
    [pendingDeleteIds],
  );

  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter(
      (po) => !pendingDeleteSet.has(po._id || po.id),
    );
  }, [purchaseOrders, pendingDeleteSet]);

  const normalizedPOs = useMemo(
    () => filteredPOs.map(normalizePurchaseOrder),
    [filteredPOs],
  );

  return (
    <PurchaseOrderListContentView
      model={{
        scrollRef,
        viewMode,
        PurchaseOrderTable,
        normalizedPOs,
        handleDelete,
        isLoading,
        purchaseOrders,
        t,
        handleMenuAction,
        formatCurrency,
        formatDate,
        showToast,
        canView,
        canEdit,
        canDelete,
        PurchaseOrderGrid,
        openMenuId,
        handleMenuToggle,
        menuRefs,
        pagination,
        sentinelRef,
        isFetchingMore,
        PurchaseOrderDeleteConfirmModal,
        showDeleteModal,
        setShowDeleteModal,
        confirmDelete,
        poToDelete,
        isDeleting,
        CreateBillDrawer,
        showCreateBillDrawer,
        setShowCreateBillDrawer,
        setSelectedPOForBill,
        selectedPOForBill,
        AdvancePaymentDrawer,
        showAdvancePaymentDrawer,
        setShowAdvancePaymentDrawer,
        setSelectedPOForPayment,
        selectedPOForPayment,
        storeId,
        dispatch,
        getPOs,
        toasts,
        removeToast,
        onRoute0: (value0) =>
          router.push("/dashboard/purchase-orders/" + String(value0) + "/edit"),
        onRoute1: (value0) =>
          router.push("/dashboard/purchase-orders/" + String(value0) + ""),
        onRoute2: (value0) =>
          router.push("/dashboard/purchase-orders/" + String(value0) + "/edit"),
        onRoute3: (value0) =>
          router.push("/dashboard/purchase-orders/" + String(value0) + ""),
      }}
    />
  );
};

export default PurchaseOrderListContent;
