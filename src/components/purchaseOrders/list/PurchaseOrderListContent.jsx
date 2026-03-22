"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BillDeleteConfirmModal as PurchaseOrderDeleteConfirmModal } from "@/components/bills";
import AdvancePaymentDrawer from "@/components/purchaseOrders/AdvancePaymentDrawer";
import CreateBillDrawer from "@/components/purchaseOrders/CreateBillDrawer";
import PurchaseOrderGrid from "@/components/purchaseOrders/PurchaseOrderGrid";
import PurchaseOrderTable from "@/components/purchaseOrders/PurchaseOrderTable";
import { ToastContainer } from "@/components/ui";
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

const PurchaseOrderListContent = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { list: purchaseOrders, pagination, isLoading, isFetchingMore, viewMode } = useAppSelector(
        (state) => state.purchaseOrders
    );
    const { selectedStore } = useAppSelector((state) => state.profile);
    const storeId = selectedStore?.storeId || "";
    const { toasts, showToast, removeToast } = useToast();

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
    const [showAdvancePaymentDrawer, setShowAdvancePaymentDrawer] = useState(false);
    const [selectedPOForPayment, setSelectedPOForPayment] = useState(null);

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
                    dispatch(
                        getPOs({
                            store: storeIdRef.current,
                            limit: 20,
                            cursor: paginationRef.current.nextCursor,
                            isFreshLoad: false
                        })
                    );
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [dispatch, pagination.hasNextPage]);


    // Close contextual menu on blur
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (openMenuId && menuRefs.current[openMenuId] && !menuRefs.current[openMenuId].contains(event.target)) {
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
            prev.filter((id) => purchaseOrders.some((po) => (po._id || po.id) === id))
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
                    router.push(`/dashboard/purchase-orders/${po._id || po.id}`);
                    break;
                case "edit":
                    if (isDeleted) return;
                    router.push(`/dashboard/purchase-orders/${po._id || po.id}/edit`);
                    break;
                case "createBill":
                    if (isDeleted) return;
                    setSelectedPOForBill(po);
                    setShowCreateBillDrawer(true);
                    setOpenMenuId(null);
                    break;
                case "advancePayment":
                    if (isDeleted) return;
                    setSelectedPOForPayment(po);
                    setShowAdvancePaymentDrawer(true);
                    setOpenMenuId(null);
                    break;
                case "delete":
                    handleDelete(po);
                    break;
                default:
                    break;
            }
            setOpenMenuId(null);
        },
        [purchaseOrders, router]
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
            const result = await purchaseOrderService.deletePurchaseOrder(poId, storeId);

            // Immediately sync Redux cache
            dispatch(removePurchaseOrder(poId));

            setPendingDeleteIds((prev) =>
                prev.includes(poId) ? prev : [...prev, poId]
            );
            setShowDeleteModal(false);
            setPoToDelete(null);

            const friendlyPo = poToDelete?.poNumber || poToDelete?.billNumber || poId;
            const poNumber = result?.data?.poNumber || friendlyPo;

            showToast(`Purchase Order ${poNumber} deletion has been scheduled.`, "success", 3000);
        } catch (error) {
            showToast(error?.message || "Failed to delete purchase order", "error", 3000);
        } finally {
            setIsDeleting(false);
        }
    }, [poToDelete, isDeleting, storeId, dispatch, showToast]);

    const pendingDeleteSet = useMemo(() => new Set(pendingDeleteIds), [pendingDeleteIds]);

    const filteredPOs = useMemo(() => {
        return purchaseOrders.filter(
            (po) => !pendingDeleteSet.has(po._id || po.id)
        );
    }, [purchaseOrders, pendingDeleteSet]);

    const normalizedPOs = useMemo(() => filteredPOs.map(normalizePurchaseOrder), [filteredPOs]);

    return (
        <>
            <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] overflow-hidden">
                <div className="h-[calc(100vh-200px)] overflow-y-auto" ref={scrollRef}>
                    {viewMode === "table" ? (
                        <div className="h-auto">
                            <PurchaseOrderTable
                                bills={normalizedPOs}
                                onEdit={(id) => router.push(`/dashboard/purchase-orders/${id}/edit`)}
                                onDelete={handleDelete}
                                onViewDetails={(id) => router.push(`/dashboard/purchase-orders/${id}`)}
                                loading={isLoading && purchaseOrders.length === 0}
                                emptyMessage={t("purchaseOrders.noPurchaseOrders")}
                                openMenuId={openMenuId}
                                onMenuToggle={handleMenuToggle}
                                onMenuAction={handleMenuAction}
                                menuRefs={menuRefs}
                                formatCurrency={formatCurrency}
                                formatDate={formatDate}
                                enableSendMenu={true}
                            />
                        </div>
                    ) : (
                        <div>
                            <PurchaseOrderGrid
                                purchaseOrders={normalizedPOs}
                                onEdit={(id) => router.push(`/dashboard/purchase-orders/${id}/edit`)}
                                onDelete={handleDelete}
                                onViewDetails={(id) => router.push(`/dashboard/purchase-orders/${id}`)}
                                openMenuId={openMenuId}
                                onMenuToggle={handleMenuToggle}
                                onMenuAction={handleMenuAction}
                                menuRefs={menuRefs}
                                formatCurrency={formatCurrency}
                                formatDate={formatDate}
                                enableSendMenu={true}
                            />
                        </div>
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
                                    Showing <span className="font-semibold text-[rgb(var(--color-text-primary))]">{normalizedPOs.length}</span> purchase orders
                                    <span className="ml-2 text-xs text-[rgb(var(--color-primary))]">• Scroll down to load more</span>
                                </>
                            ) : (
                                <>
                                    Showing <span className="font-semibold text-[rgb(var(--color-text-primary))]">{normalizedPOs.length}</span> purchase orders
                                    <span className="ml-2 text-xs text-[rgb(var(--color-text-tertiary))]">• No more purchase orders</span>
                                </>
                            )}
                        </div>
                        <div className="text-sm text-[rgb(var(--color-text-secondary))]" />
                    </div>
                </div>
            </div>

            {/* Drawers and Modals */}
            <PurchaseOrderDeleteConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                billToDelete={poToDelete}
                formatCurrency={formatCurrency}
                isDeleting={isDeleting}
            />

            <CreateBillDrawer
                isOpen={showCreateBillDrawer}
                onClose={() => {
                    setShowCreateBillDrawer(false);
                    setSelectedPOForBill(null);
                }}
                purchaseOrder={selectedPOForBill}
                onSuccess={() => { }}
            />

            <AdvancePaymentDrawer
                isOpen={showAdvancePaymentDrawer}
                onClose={() => {
                    setShowAdvancePaymentDrawer(false);
                    setSelectedPOForPayment(null);
                }}
                purchaseOrder={selectedPOForPayment}
                onSuccess={() => {
                    if (storeId) {
                        dispatch(getPOs({ store: storeId, limit: 20, cursor: null, isFreshLoad: true }));
                    }
                }}
            />

            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </>
    );
};

export default PurchaseOrderListContent;
