"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { EditCustomer, CustomerTable, CustomerCard } from "@/components/customer";
import CustomerDeleteModal from "./CustomerDeleteModal";
import { SideDrawer } from "@/components/ui";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getCustomers } from "@/store/slices/customers/customerSlice";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { Users } from "lucide-react";

const CustomerListContent = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { t } = useTranslation();

    const { customers, viewMode, isLoading, isFetchingMore, pagination } =
        useAppSelector((state) => state.customers);
    const { selectedStore } = useAppSelector((state) => state.profile);
    const storeId = selectedStore?.storeId;

    const { can } = useModulePermissions("customer");
    const canEdit = can("edit");
    const canDelete = can("delete");

    // ─── Refs for stable IntersectionObserver callback ───────────────────────
    const sentinelRef = useRef(null);
    const isFetchingMoreRef = useRef(isFetchingMore);
    const storeIdRef = useRef(storeId);
    const paginationRef = useRef(pagination);
    isFetchingMoreRef.current = isFetchingMore;
    storeIdRef.current = storeId;
    paginationRef.current = pagination;

    // ─── Edit drawer state ────────────────────────────────────────────────────
    const [editCustomerId, setEditCustomerId] = useState(null);

    // ─── Delete modal ref (self-contained) ───────────────────────────────────
    const deleteModalRef = useRef(null);

    // ─── Infinite scroll via IntersectionObserver ─────────────────────────────
    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel || !pagination.hasNextPage) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isFetchingMoreRef.current && storeIdRef.current) {
                    dispatch(
                        getCustomers({
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

    useCommonHotkeys({
        onClose: () => {
            if (editCustomerId) setEditCustomerId(null);
        },
    });

    if (!isLoading && customers.length === 0) return null;

    return (
        <>
            <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary)/0.6)] overflow-hidden">
                <div className="h-[calc(100vh-210px)] overflow-y-auto">
                    {viewMode === "table" ? (
                        <div className="h-auto">
                            <CustomerTable
                                customers={customers}
                                onEdit={canEdit ? setEditCustomerId : undefined}
                                onDelete={canDelete ? (id) => deleteModalRef.current?.open(id) : undefined}
                                onViewDetails={(id) => router.push(`/dashboard/customers/${id}`)}
                                canEdit={canEdit}
                                canDelete={canDelete}
                            />
                        </div>
                    ) : (
                        <div className="h-auto">
                            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {customers.map((customer) => (
                                    <CustomerCard
                                        key={customer.id}
                                        customer={customer}
                                        onEdit={canEdit ? setEditCustomerId : undefined}
                                        onDelete={canDelete ? (id) => deleteModalRef.current?.open(id) : undefined}
                                        onViewDetails={(id) => router.push(`/dashboard/customers/${id}`)}
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

                    {(isFetchingMore || isLoading) && customers.length > 0 && (
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
                    <div className="text-sm text-[rgb(var(--color-text-secondary))]">
                        {t("common.showing") || "Showing"}{" "}
                        <span className="font-semibold text-[rgb(var(--color-text-primary))]">
                            {customers.length}
                        </span>{" "}
                        {t("customers.title").toLowerCase()}
                        {pagination.hasNextPage && (
                            <span className="ml-2 text-xs text-[rgb(var(--color-primary))]">
                                • {t("common.scrollToLoadMore") || "Scroll down to load more"}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete modal — fully self-contained via ref */}
            <CustomerDeleteModal ref={deleteModalRef} />

            {/* Edit Customer Drawer */}
            <SideDrawer
                isOpen={!!editCustomerId}
                onClose={() => setEditCustomerId(null)}
                title={t("customers.editCustomer") || "Edit Customer"}
                icon={Users}
                width="w-full md:w-2/3 lg:w-1/2"
            >
                <div className="p-6 h-full">
                    {editCustomerId && (
                        <EditCustomer
                            customerId={editCustomerId}
                            onSuccess={() => setEditCustomerId(null)}
                            onCancel={() => setEditCustomerId(null)}
                            showCancelButton={true}
                            mode="drawer"
                        />
                    )}
                </div>
            </SideDrawer>
        </>
    );
};

export default CustomerListContent;
