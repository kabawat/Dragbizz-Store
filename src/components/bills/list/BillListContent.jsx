"use client";
import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { BillDeleteConfirmModal, BillGrid, BillPaymentDrawer, BillTable } from "@/components/bills";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { billService } from "@/service/retailer";
import { getBills, removeBill } from "@/store/slices/billsSlice";
import { formatCurrency } from "@/utils/currencyFormatter";
import { formatDateShort as formatDate } from "@/utils/dateFormatter";
import { useApiResponse } from "@/hooks/useApiResponse";
import { useState } from "react";

const BillListContent = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { bills, pagination, isLoading, isFetchingMore, viewMode } = useAppSelector(
    (state) => state.bills
  );
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId || "";

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
  isFetchingMoreRef.current = isFetchingMore;
  storeIdRef.current = storeId;
  paginationRef.current = pagination;

  // ─── Infinite scroll via IntersectionObserver ─────────────────────────────
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !pagination.hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingMoreRef.current && storeIdRef.current) {
          dispatch(getBills({
            store: storeIdRef.current,
            limit: 20,
            cursor: paginationRef.current.nextCursor,
            isFreshLoad: false,
          }));
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [dispatch, pagination.hasNextPage]);

  // Close contextual menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && menuRefs.current[openMenuId] && !menuRefs.current[openMenuId].contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  const handleMenuToggle = useCallback((id) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
  }, []);

  const handleMenuAction = useCallback((id, action) => {
    const bill = bills.find((b) => (b._id || b.id) === id);
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
  }, [bills, router, canEdit, canDelete, canView, handleDelete]);

  const handleDelete = useCallback((bill) => {
    setBillToDelete(bill);
    setShowDeleteModal(true);
  }, []);

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

  return (
    <>
      <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] overflow-hidden">
        <div className="h-[calc(100vh-200px)] overflow-y-auto">
          {viewMode === "table" ? (
            <BillTable
              bills={bills}
              onEdit={(billId) => router.push(`/dashboard/bills/${billId}/edit`)}
              onDelete={handleDelete}
              onViewDetails={(billId) => router.push(`/dashboard/bills/${billId}`)}
              loading={isLoading && bills.length === 0}
              emptyMessage={t("bills.noBills")}
              openMenuId={openMenuId}
              onMenuToggle={handleMenuToggle}
              onMenuAction={handleMenuAction}
              menuRefs={menuRefs}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
            />
          ) : (
            <BillGrid
              bills={bills}
              onEdit={(billId) => router.push(`/dashboard/bills/${billId}/edit`)}
              onDelete={handleDelete}
              onViewDetails={(billId) => router.push(`/dashboard/bills/${billId}`)}
              openMenuId={openMenuId}
              onMenuToggle={handleMenuToggle}
              onMenuAction={handleMenuAction}
              menuRefs={menuRefs}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
            />
          )}

          {/* Sentinel — IntersectionObserver triggers load more */}
          {pagination.hasNextPage && (
            <div ref={sentinelRef} className="h-4 w-full" />
          )}

          {/* Infinite scroll loading indicator */}
          {(isFetchingMore || isLoading) && (
            <div className="col-span-full flex items-center justify-center py-8">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[rgb(var(--color-primary))]" />
                <span className="text-sm text-[rgb(var(--color-text-secondary))]">
                  {t("common.loadingMore")}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[rgb(var(--color-bg-tertiary))] border-t border-[rgb(var(--color-border-primary))] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-[rgb(var(--color-text-secondary))]">
              {pagination.hasNextPage ? (
                <>
                  Showing <span className="font-semibold text-[rgb(var(--color-text-primary))]">{bills.length}</span> bills
                  <span className="ml-2 text-xs text-[rgb(var(--color-primary))]">• Scroll down to load more</span>
                </>
              ) : (
                <>
                  Showing <span className="font-semibold text-[rgb(var(--color-text-primary))]">{bills.length}</span> bills
                  <span className="ml-2 text-xs text-[rgb(var(--color-text-tertiary))]">• {t("bills.noMore")}</span>
                </>
              )}
            </div>
            <div className="text-sm text-[rgb(var(--color-text-secondary))]" />
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <BillDeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        billToDelete={billToDelete}
        formatCurrency={formatCurrency}
        isDeleting={isDeleting}
      />

      {/* Payment Drawer */}
      <BillPaymentDrawer
        isOpen={showPaymentDrawer}
        onClose={() => {
          setShowPaymentDrawer(false);
          setSelectedBillForPayment(null);
        }}
        bill={selectedBillForPayment}
        onSuccess={() => {
          if (storeId) {
            dispatch(getBills({ store: storeId, limit: 20, cursor: null, isFreshLoad: true }));
          }
        }}
      />
    </>
  );
};

export default BillListContent;
