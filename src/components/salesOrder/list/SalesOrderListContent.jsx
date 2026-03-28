"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useApiResponse } from "@/hooks/useApiResponse";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { salesOrderService } from "@/service/retailer";
import { getSalesOrders } from "@/store/slices/salesOrdersSlice";
import SalesOrderTable from "@/components/salesOrder/SalesOrderTable";
import SalesOrderCard from "@/components/salesOrder/SalesOrderCard";

const SalesOrderListContent = ({ canCreate = false, canEdit = false, canDelete = false }) => {
    const { t } = useTranslation();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { showError, showSuccess } = useGlobalToast();

    // Redux strictly providing the list and state variables organically
    const { list: orders, pagination, isLoading, isFetchingMore, viewMode } = useAppSelector(
        (state) => state.salesOrders
    );
    const { selectedStore } = useAppSelector((state) => state.profile);
    const storeId = selectedStore?.storeId || "";

    const { execute: executeUpdate, loading: updatingStatus } = useApiResponse();
    const scrollRef = useRef(null);

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
                        getSalesOrders({
                            store: storeIdRef.current,
                            limit: 20,
                            nextCursor: paginationRef.current.nextCursor,
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

    const handleViewDetails = useCallback((id) => {
        router.push(`/dashboard/sales-order/${id}`);
    }, [router]);

    const handleUpdateStatus = useCallback(async (orderId, status, payload = {}) => {
        if (!orderId || !storeId) return;

        const result = await executeUpdate(
            salesOrderService.updateStatus(orderId, { status, ...payload }, { store: storeId }),
            { showToast: true, message: "Order updated successfully" }
        );

        if (result?.success) {
            // Immediately refresh fresh data upon local side effect completion
            dispatch(getSalesOrders({ store: storeId, limit: 20, cursor: null, isFreshLoad: true }));
        }
    }, [dispatch, storeId, executeUpdate]);

    const handlePrint = useCallback((order) => {
        // Implementation for printing
    }, []);

    return (
        <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] overflow-hidden">
            <div className="h-[calc(100vh-200px)] overflow-y-auto" ref={scrollRef}>
                {viewMode === "table" ? (
                    <div className="h-auto">
                        <SalesOrderTable
                            orders={orders}
                            onViewDetails={handleViewDetails}
                            onUpdateStatus={handleUpdateStatus}
                            onPrint={handlePrint}
                            canEdit={canEdit}
                            canDelete={canDelete}
                        />
                    </div>
                ) : (
                    <div>
                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {orders.map((order, index) => (
                                <SalesOrderCard
                                    key={order?.id || order?._id || index}
                                    order={order}
                                    onViewDetails={handleViewDetails}
                                    onUpdateStatus={handleUpdateStatus}
                                    onPrint={handlePrint}
                                    canEdit={canEdit}
                                    canDelete={canDelete}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Sentinel — IntersectionObserver triggers load more */}
                {pagination.hasNextPage && (
                    <div ref={sentinelRef} className="h-4 w-full" />
                )}

                {/* Infinite scroll loading indicator */}
                {(isFetchingMore || (isLoading && orders.length > 0)) && (
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
                                {t("common.showing")} <span className="font-semibold text-[rgb(var(--color-text-primary))]">{orders.length}</span> {t("sidebar.sellOrders").toLowerCase()}
                                <span className="ml-2 text-xs text-[rgb(var(--color-primary))]">• Scroll down to load more</span>
                            </>
                        ) : (
                            <>
                                {t("common.showing")} <span className="font-semibold text-[rgb(var(--color-text-primary))]">{orders.length}</span> {t("sidebar.sellOrders").toLowerCase()}
                                <span className="ml-2 text-xs text-[rgb(var(--color-text-tertiary))]">• No more orders</span>
                            </>
                        )}
                    </div>
                    <div className="text-sm text-[rgb(var(--color-text-secondary))]" />
                </div>
            </div>
        </div>
    );
};

export default SalesOrderListContent;
