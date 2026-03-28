"use client";
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
import { getInventories, removeInventoryLocal } from "@/store/slices/inventory/inventorySlice";
import { useRouter } from "next/navigation";

const InventoryListContent = ({ canEdit = false, canDelete = false, canCreate = false }) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { showSuccess } = useGlobalToast();

    const { inventories, isLoading, isFetchingMore, error, pagination, viewMode } = useAppSelector(
        (state) => state.inventory
    );
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
                if (entries[0].isIntersecting && !isFetchingMoreRef.current && storeIdRef.current) {
                    dispatch(
                        getInventories({
                            store: storeIdRef.current,
                            page: Math.floor(inventories.length / 20) + 1,
                            limit: 20,
                            isFreshLoad: false,
                        })
                    );
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [dispatch, pagination.hasNextPage, inventories.length]);

    // Navigation handlers
    const handleViewStock = useCallback(
        (inventoryId) => router.push(`/dashboard/stock/${inventoryId}`),
        [router]
    );

    const handleDuplicate = useCallback((_inventoryId) => { }, []);

    // Stock In
    const handleStockIn = useCallback(
        (inventoryId) => {
            const inventory = inventories.find((i) => (i.id || i._id) === inventoryId);
            setInventoryForStockIn(inventory);
            setShowStockInDrawer(true);
        },
        [inventories]
    );
    const handleCloseStockInDrawer = useCallback(() => {
        setShowStockInDrawer(false);
        setInventoryForStockIn(null);
    }, []);
    const handleStockInSuccess = useCallback(
        (message) => {
            showSuccess(message);
            if (storeId) {
                dispatch(getInventories({ store: storeId, limit: 20, isFreshLoad: true }));
            }
        },
        [showSuccess, dispatch, storeId]
    );

    // Delete handlers
    const handleDeleteStock = useCallback(
        (inventoryId) => {
            const inventory = inventories.find((i) => (i.id || i._id) === inventoryId);
            setInventoryToDelete({ id: inventoryId, name: inventory?.product?.name || t("products.product") });
            setShowDeleteModal(true);
        },
        [inventories, t]
    );
    const handleDeleteClose = useCallback(() => {
        setInventoryToDelete(null);
        setShowDeleteModal(false);
    }, []);
    const handleDeleteSuccess = useCallback((deletedId) => {
        dispatch(removeInventoryLocal(deletedId));
        setShowDeleteModal(false);
        setInventoryToDelete(null);
    }, [dispatch]);

    return (
        <>
            <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] overflow-hidden">
                <div className="h-[calc(100vh-200px)] overflow-y-auto">
                    {viewMode === "table" ? (
                        <div className="h-auto">
                            <InventoryTable
                                inventories={inventories}
                                onViewDetails={handleViewStock}
                                onDelete={handleDeleteStock}
                                onDuplicate={handleDuplicate}
                                onStockIn={handleStockIn}
                                loading={isLoading}
                                emptyMessage={t("common.noData")}
                                canEdit={canEdit}
                                canDelete={canDelete}
                                canCreate={canCreate}
                            />
                        </div>
                    ) : (
                        <div>
                            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {inventories.map((inventory) => (
                                    <InventoryCard
                                        key={inventory.id || inventory._id}
                                        inventory={inventory}
                                        onViewDetails={handleViewStock}
                                        onDelete={handleDeleteStock}
                                        onDuplicate={handleDuplicate}
                                        onStockIn={handleStockIn}
                                        canEdit={canEdit}
                                        canDelete={canDelete}
                                        canCreate={canCreate}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Sentinel — IntersectionObserver triggers load more */}
                    {pagination.hasNextPage && (
                        <div ref={sentinelRef} className="h-4 w-full" />
                    )}

                    {/* Infinite scroll loading */}
                    {(isFetchingMore || isLoading) && inventories.length > 0 && (
                        <div className="flex items-center justify-center py-16">
                            <div className="flex items-center gap-3">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[rgb(var(--color-primary))]" />
                                <span className="text-sm text-[rgb(var(--color-text-secondary))]">
                                    {t("common.loadingMore") || "Loading more..."}
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
                                    Showing{" "}
                                    <span className="font-semibold text-[rgb(var(--color-text-primary))]">
                                        {inventories.length}
                                    </span>{" "}
                                    stock items
                                    <span className="ml-2 text-xs text-[rgb(var(--color-primary))]">
                                        • Scroll down to load more
                                    </span>
                                </>
                            ) : (
                                <>
                                    Showing{" "}
                                    <span className="font-semibold text-[rgb(var(--color-text-primary))]">
                                        {inventories.length}
                                    </span>{" "}
                                    stock items
                                    <span className="ml-2 text-xs text-[rgb(var(--color-text-tertiary))]">
                                        • No more stock items
                                    </span>
                                </>
                            )}
                        </div>
                        <div className="text-sm text-[rgb(var(--color-text-secondary))]" />
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <DeleteInventoryModal
                isOpen={showDeleteModal}
                onClose={handleDeleteClose}
                inventoryToDelete={inventoryToDelete}
                onDeleteSuccess={handleDeleteSuccess}
            />

            {/* Stock In Drawer */}
            <StockInDrawer
                isOpen={showStockInDrawer}
                onClose={handleCloseStockInDrawer}
                item={inventoryForStockIn}
                onSuccess={handleStockInSuccess}
                type="inventory"
            />
        </>
    );
};

export default InventoryListContent;
