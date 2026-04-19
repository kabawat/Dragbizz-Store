"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getSuppliers, removeSupplier } from "@/store/slices/supplier/supplierSlice";
import { useApiResponse } from "@/hooks/useApiResponse";
import { supplierService } from "@/service";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import {
    DeleteSupplierModal,
    EditSupplierDrawer,
    SupplierCard,
    SupplierTable,
} from "@/components/supplier";

const SupplierListContent = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const dispatch = useAppDispatch();

    const { suppliers, isLoading, isFetchingMore, pagination, viewMode } = useAppSelector(
        (state) => state.suppliers
    );

    const { selectedStore } = useAppSelector((state) => state.profile);
    const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id || "";

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
                if (entries[0].isIntersecting && !isFetchingMoreRef.current && storeIdRef.current) {
                    dispatch(
                        getSuppliers({
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

    // Action Handlers
    const handleEditSupplier = useCallback((supplierId) => {
        if (!canEdit) return;
        setEditingSupplierId(supplierId);
        setShowEditSupplierDrawer(true);
    }, [canEdit]);

    const handleViewSupplier = useCallback((supplierId) => {
        router.push(`/dashboard/suppliers/${supplierId}`);
    }, [router]);

    const handlePrintSupplier = useCallback((supplierId) => {
        router.push(`/dashboard/suppliers/${supplierId}?print=true`);
    }, [router]);

    const handleDeleteSupplier = useCallback((supplierId) => {
        if (!canDelete) return;
        const supplier = suppliers.find((s) => s.id === supplierId || s._id === supplierId);
        setSupplierToDelete({ id: supplierId, name: supplier?.name || "Supplier" });
        setShowDeleteModal(true);
    }, [suppliers, canDelete]);

    const handleConfirmDelete = useCallback(async () => {
        if (!supplierToDelete) return;

        const result = await executeDelete(
            supplierService.deleteSupplier(supplierToDelete.id, storeId),
            { message: `${supplierToDelete.name} deleted successfully`, showToast: true }
        );

        if (result?.success || result?.data?.success) {
            dispatch(removeSupplier(supplierToDelete.id));
        }
        setShowDeleteModal(false);
        setSupplierToDelete(null);
    }, [dispatch, supplierToDelete, storeId, executeDelete]);

    const handleSupplierSuccess = useCallback(() => {
        dispatch(getSuppliers({ store: storeId, limit: 20, nextCursor: null, isFreshLoad: true }));
    }, [dispatch, storeId]);

    return (
        <>
            <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary)/0.6)] overflow-hidden">
                <div className="h-[calc(100vh-210px)] overflow-y-auto">
                    {viewMode === "table" ? (
                        <div className="h-auto">
                            <SupplierTable
                                suppliers={suppliers}
                                onEdit={canEdit ? handleEditSupplier : undefined}
                                onDelete={canDelete ? handleDeleteSupplier : undefined}
                                onViewDetails={handleViewSupplier}
                                onPrint={handlePrintSupplier}
                                loading={isLoading && suppliers.length === 0}
                                emptyMessage={t("suppliers.noSuppliers")}
                                canEdit={canEdit}
                                canDelete={canDelete}
                            />
                        </div>
                    ) : (
                        <div>
                            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {suppliers.map((supplier) => (
                                    <SupplierCard
                                        key={supplier.id || supplier._id}
                                        supplier={supplier}
                                        onEdit={canEdit ? handleEditSupplier : undefined}
                                        onDelete={canDelete ? handleDeleteSupplier : undefined}
                                        onViewDetails={handleViewSupplier}
                                        onPrint={handlePrintSupplier}
                                        canEdit={canEdit}
                                        canDelete={canDelete}
                                        onSelect={(id, checked) => {
                                            setSelectedSupplierIds((prev) =>
                                                checked ? [...new Set([...prev, id])] : prev.filter((x) => x !== id)
                                            );
                                        }}
                                        selected={selectedSupplierIds.includes(supplier.id || supplier._id)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {pagination.hasNextPage && (
                        <div ref={sentinelRef} className="h-4 w-full" />
                    )}

                    {(isFetchingMore || isLoading) && suppliers.length > 0 && (
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
                                    Showing <span className="font-semibold text-[rgb(var(--color-text-primary))]">{suppliers.length}</span> suppliers
                                    <span className="ml-2 text-xs text-[rgb(var(--color-primary))]">• Scroll down to load more</span>
                                </>
                            ) : (
                                <>
                                    Showing <span className="font-semibold text-[rgb(var(--color-text-primary))]">{suppliers.length}</span> suppliers
                                    <span className="ml-2 text-xs text-[rgb(var(--color-text-tertiary))]">• No more suppliers</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <DeleteSupplierModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSupplierToDelete(null);
                }}
                supplierToDelete={supplierToDelete}
                onConfirmDelete={handleConfirmDelete}
                isDeleting={isDeleting}
            />

            <EditSupplierDrawer
                isOpen={showEditSupplierDrawer}
                onClose={() => {
                    setShowEditSupplierDrawer(false);
                    setEditingSupplierId(null);
                }}
                supplierId={editingSupplierId}
                onSuccess={handleSupplierSuccess}
            />
        </>
    );
};

export default SupplierListContent;
