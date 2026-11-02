"use client";
import { BillListContentView } from "@dragorbit/features/bills";
import { useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BillDeleteConfirmModal,
  BillGrid,
  BillPaymentDrawer,
  BillTable,
} from "@/components/bills";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useApiResponse } from "@/hooks/useApiResponse";
import { billService } from "@/service/retailer";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getBills, removeBill } from "@/store/slices/billsSlice";
import { formatCurrency } from "@/utils/currencyFormatter";
import { formatDateShort as formatDate } from "@/utils/dateFormatter";
import { pickStoreId } from "@/utils/store.util";

const BillListContent = ({
  searchValue = "",
  startDate = "",
  endDate = "",
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { bills, pagination, isLoading, isFetchingMore, viewMode } =
    useAppSelector((state) => state.bills);
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = useMemo(
    () => pickStoreId(selectedStore) || "",
    [selectedStore]
  );

  const { can } = useModulePermissions("billing");
  const canEdit = can("edit");
  const canDelete = can("delete");
  const canView = can("read");

  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRefs = useRef({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [billToDelete, setBillToDelete] = useState(null);
  const [showPaymentDrawer, setShowPaymentDrawer] = useState(false);
  const [selectedBillForPayment, setSelectedBillForPayment] = useState(null);

  const { execute: executeDelete, loading: isDeleting } = useApiResponse();

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
            getBills({
              store: storeIdRef.current,
              limit: 20,
              cursor: paginationRef.current.nextCursor,
              search: searchRef.current || undefined,
              startDate: startDateRef.current || undefined,
              endDate: endDateRef.current || undefined,
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

  const billsMap = useMemo(() => {
    const map = new Map();
    for (const b of bills) {
      map.set(b._id || b.id, b);
    }
    return map;
  }, [bills]);

  // Close contextual menu on outside click
  useEffect(() => {
    if (!openMenuId) return undefined;
    const handleClickOutside = (event) => {
      if (
        menuRefs.current[openMenuId] &&
        !menuRefs.current[openMenuId].contains(event.target)
      ) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  const handleMenuToggle = useCallback((id) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
  }, []);

  const handleDelete = useCallback((bill) => {
    setBillToDelete(bill);
    setShowDeleteModal(true);
  }, []);

  const handleMenuAction = useCallback(
    (id, action) => {
      const bill = billsMap.get(id);
      if (!bill) return;

      switch (action) {
        case "view":
          if (!canView) return;
          router.push(`/dashboard/bills/${bill._id || bill.id}`);
          break;
        case "edit":
          if (!canEdit) return;
          router.push(`/dashboard/bills/${bill._id || bill.id}/edit`);
          break;
        case "payment":
          if (!canEdit) return; // Payment is an edit/update action
          setSelectedBillForPayment(bill);
          setShowPaymentDrawer(true);
          setOpenMenuId(null);
          break;
        case "delete":
          if (!canDelete) return;
          handleDelete(bill);
          break;
        default:
          break;
      }
      setOpenMenuId(null);
    },
    [billsMap, router, canEdit, canDelete, canView, handleDelete]
  );

  const confirmDelete = useCallback(async () => {
    if (!billToDelete) return;

    const billId = billToDelete._id || billToDelete.id;

    const result = await executeDelete(
      billService.deleteBill(billId, storeId),
      { message: t("bills.billDeletedSuccessfully") }
    );

    if (result?.success) {
      dispatch(removeBill(billId));
      setShowDeleteModal(false);
      setBillToDelete(null);
    }
  }, [billToDelete, storeId, executeDelete, dispatch, t]);

  const onRoute0 = useCallback(
    (value0) => router.push(`/dashboard/bills/${String(value0)}/edit`),
    [router]
  );
  const onRoute1 = useCallback(
    (value0) => router.push(`/dashboard/bills/${String(value0)}`),
    [router]
  );
  const onRoute2 = useCallback(
    (value0) => router.push(`/dashboard/bills/${String(value0)}/edit`),
    [router]
  );
  const onRoute3 = useCallback(
    (value0) => router.push(`/dashboard/bills/${String(value0)}`),
    [router]
  );

  const model = useMemo(
    () => ({
      viewMode,
      BillTable,
      bills,
      canEdit,
      canDelete,
      handleDelete,
      isLoading,
      t,
      handleMenuAction,
      formatCurrency,
      formatDate,
      BillGrid,
      openMenuId,
      handleMenuToggle,
      menuRefs,
      pagination,
      sentinelRef,
      isFetchingMore,
      BillDeleteConfirmModal,
      showDeleteModal,
      setShowDeleteModal,
      confirmDelete,
      billToDelete,
      isDeleting,
      BillPaymentDrawer,
      showPaymentDrawer,
      setShowPaymentDrawer,
      setSelectedBillForPayment,
      selectedBillForPayment,
      storeId,
      dispatch,
      getBills,
      onRoute0,
      onRoute1,
      onRoute2,
      onRoute3,
    }),
    [
      viewMode,
      bills,
      canEdit,
      canDelete,
      handleDelete,
      isLoading,
      t,
      handleMenuAction,
      openMenuId,
      handleMenuToggle,
      pagination,
      isFetchingMore,
      showDeleteModal,
      confirmDelete,
      billToDelete,
      isDeleting,
      showPaymentDrawer,
      selectedBillForPayment,
      storeId,
      dispatch,
      onRoute0,
      onRoute1,
      onRoute2,
      onRoute3,
    ]
  );

  return <BillListContentView model={model} />;
};

export default memo(BillListContent);
