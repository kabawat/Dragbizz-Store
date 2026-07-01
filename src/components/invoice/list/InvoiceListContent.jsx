"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
    InvoiceCard,
    InvoiceDeleteConfirmModal,
    InvoiceTable,
    ReleaseInvoiceModal,
    UpdatePaymentStatusModal,
} from "@/components/invoice";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getInvoices } from "@/store/slices/invoicesSlice";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";

const InvoiceListContent = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const dispatch = useAppDispatch();

    // Permission Management
    const { can } = useModulePermissions("invoice");
    const canEdit = can("edit");
    const canDelete = can("delete");
    const canRead = can("read");

    // Using Redux state instead of props
    const { invoices, viewMode, isLoading, isFetchingMore, pagination } = useAppSelector((state) => state.invoices);
    const { selectedStore } = useAppSelector((state) => state.profile);
    const storeId = selectedStore?.storeId;

    // ─── Refs for stable IntersectionObserver callback ───────────────────────
    const sentinelRef = useRef(null);
    const isFetchingMoreRef = useRef(isFetchingMore);
    const storeIdRef = useRef(storeId);
    const paginationRef = useRef(pagination);
    isFetchingMoreRef.current = isFetchingMore;
    storeIdRef.current = storeId;
    paginationRef.current = pagination;

    // Local state for modals
    const [invoiceToUpdatePayment, setInvoiceToUpdatePayment] = useState(null);
    const [invoiceToRelease, setInvoiceToRelease] = useState(null);
    const [invoiceToDelete, setInvoiceToDelete] = useState(null);

    // ─── Infinite scroll via IntersectionObserver ─────────────────────────────
    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel || !pagination.hasNextPage) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isFetchingMoreRef.current && storeIdRef.current) {
                    dispatch(
                        getInvoices({
                            store: storeIdRef.current,
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

    const handleEditInvoice = (invoiceId) => {
        router.push(`/dashboard/invoices/${invoiceId}/edit`);
    };

    const handleViewInvoice = (invoiceId) => {
        router.push(`/dashboard/invoices/${invoiceId}`);
    };

    const handlePrintInvoice = (invoiceId) => {
        router.push(`/dashboard/invoices/${invoiceId}`);
    };

    const handleReleaseInvoice = (invoice) => {
        if (invoice?.invoiceStatus === "DRAFT" && invoice?.id) {
            router.push(`/dashboard/collect-payment/${invoice.id}?source=release`);
            return;
        }
        setInvoiceToRelease(invoice);
    };

    const handleCancelRelease = () => {
        setInvoiceToRelease(null);
    };

    const handleUpdatePaymentStatus = (_invoiceId, invoice) => {
        setInvoiceToUpdatePayment(invoice);
    };

    const handleDeleteInvoice = (invoice) => {
        setInvoiceToDelete(invoice);
    };

    const handleLoadMore = () => { };

    return (
        <>
            <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary)/0.6)] overflow-hidden">
                <div className="h-[calc(100vh-210px)] overflow-y-auto">
                    {viewMode === "table" ? (
                        <div className="min-h-full">
                            <InvoiceTable
                                invoices={invoices}
                                onEdit={canEdit ? handleEditInvoice : undefined}
                                onDelete={canDelete ? handleDeleteInvoice : undefined}
                                onViewDetails={canRead ? handleViewInvoice : undefined}
                                onPrint={canRead ? handlePrintInvoice : undefined}
                                onRelease={canEdit ? handleReleaseInvoice : undefined}
                                onUpdatePaymentStatus={canEdit ? handleUpdatePaymentStatus : undefined}
                                loading={isLoading}
                                emptyMessage={t("common.noResults")}
                                hasMore={pagination?.hasNextPage}
                            />
                        </div>
                    ) : (
                        <div>
                            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {invoices.map((invoice) => (
                                    <InvoiceCard
                                        key={invoice.id || invoice._id}
                                        invoice={invoice}
                                        onEdit={canEdit ? handleEditInvoice : undefined}
                                        onDelete={canDelete ? handleDeleteInvoice : undefined}
                                        onViewDetails={canRead ? handleViewInvoice : undefined}
                                        onPrint={canRead ? handlePrintInvoice : undefined}
                                        onRelease={canEdit ? handleReleaseInvoice : undefined}
                                        onUpdatePaymentStatus={canEdit ? handleUpdatePaymentStatus : undefined}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Sentinel — IntersectionObserver triggers load more */}
                    {pagination.hasNextPage && (
                        <div ref={sentinelRef} className="h-4 w-full" />
                    )}

                    {(isFetchingMore || isLoading) && invoices.length > 0 && (
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

                <div className="bg-[rgb(var(--color-bg-tertiary))] border-t border-[rgb(var(--color-border-primary))] px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-[rgb(var(--color-text-secondary))]">
                            {pagination?.hasNextPage ? (
                                <>
                                    Showing{" "}
                                    <span className="font-semibold text-[rgb(var(--color-text-primary))]">
                                        {invoices.length}
                                    </span>{" "}
                                    invoices
                                    <span className="ml-2 text-xs text-[rgb(var(--color-primary))]">
                                        • Scroll down to load more
                                    </span>
                                </>
                            ) : (
                                <>
                                    Showing{" "}
                                    <span className="font-semibold text-[rgb(var(--color-text-primary))]">
                                        {invoices.length}
                                    </span>{" "}
                                    invoices
                                    <span className="ml-2 text-xs text-[rgb(var(--color-text-tertiary))]">
                                        • No more invoices
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete confirmation modal */}
            {invoiceToDelete && (
                <InvoiceDeleteConfirmModal
                    onClose={() => setInvoiceToDelete(null)}
                    invoice={invoiceToDelete}
                />
            )}

            {/* Release confirmation modal */}
            {invoiceToRelease && (
                <ReleaseInvoiceModal
                    onClose={() => setInvoiceToRelease(null)}
                    invoice={invoiceToRelease}
                />
            )}

            {/* Payment Status Update Modal */}
            {invoiceToUpdatePayment && (
                <UpdatePaymentStatusModal
                    onClose={() => setInvoiceToUpdatePayment(null)}
                    invoice={invoiceToUpdatePayment}
                />
            )}
        </>
    );
};

export default InvoiceListContent;
