"use client";
import { useState } from "react";
import { CustomerTable, CustomerCard } from "@/components/customer";
import CustomerDeleteModal from "./CustomerDeleteModal";
import { useAppDispatch } from "@/store/hooks";
import { deleteCustomer } from "@/store/slices/customersSlice";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useCommonHotkeys } from "@/hooks/useCommonHotkeys";

const CustomerListContent = ({
    customers,
    setCustomers,
    viewMode,
    isLoading,
    isLoadingMore,
    pagination,
    onLoadMore,
    onEdit,
    onViewDetails,
    scrollRef,
    selectedStore,
    t,
}) => {
    const dispatch = useAppDispatch();
    const { showSuccess, showError } = useGlobalToast();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = (customerId) => {
        const customer = customers.find((c) => c.id === customerId);
        setCustomerToDelete({ id: customerId, name: customer?.name || "Customer" });
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!customerToDelete) return;

        setIsDeleting(true);
        try {
            const storeId = selectedStore?.storeId;
            const result = await dispatch(
                deleteCustomer({
                    customerId: customerToDelete.id,
                    storeId: storeId,
                })
            );

            if (result.payload?.success) {
                showSuccess(t("modals.deletedSuccessfully", { item: t("common.customer") }));
                setCustomers((prev) => prev.filter((c) => c.id !== customerToDelete.id));
            } else {
                showError(result.payload?.message || t("common.error"));
            }
        } catch (_error) {
            showError(t("common.error"));
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
            setCustomerToDelete(null);
        }
    };

    useCommonHotkeys({
        onClose: () => {
            if (showDeleteModal) setShowDeleteModal(false);
        }
    });

    if (!isLoading && customers.length === 0) return null;

    return (
        <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] overflow-hidden">
            <div
                className="h-[calc(100vh-200px)] overflow-y-auto"
                ref={scrollRef}
            >
                {viewMode === "table" ? (
                    <div className="h-full">
                        <CustomerTable
                            customers={customers}
                            onEdit={onEdit}
                            onDelete={handleDeleteClick}
                            onViewDetails={onViewDetails}
                            loading={isLoading}
                            emptyMessage={t("customers.noCustomers")}
                            hasMore={pagination.hasNextPage}
                            onLoadMore={onLoadMore}
                            isLoadingMore={isLoadingMore}
                        />
                    </div>
                ) : (
                    <div>
                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {customers.map((customer) => (
                                <CustomerCard
                                    key={customer.id}
                                    customer={customer}
                                    onEdit={onEdit}
                                    onDelete={handleDeleteClick}
                                    onViewDetails={onViewDetails}
                                />
                            ))}

                            {isLoadingMore && (
                                <div className="col-span-full flex items-center justify-center py-8">
                                    <div className="flex items-center gap-3">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[rgb(var(--color-primary))]"></div>
                                        <span className="text-sm text-[rgb(var(--color-text-secondary))]">
                                            Loading more customers...
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-[rgb(var(--color-bg-tertiary))] border-t border-[rgb(var(--color-border-primary))] px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="text-sm text-[rgb(var(--color-text-secondary))]">
                        Showing{" "}
                        <span className="font-semibold text-[rgb(var(--color-text-primary))]">
                            {customers.length}
                        </span>{" "}
                        customers
                        {pagination.hasNextPage && (
                            <span className="ml-2 text-xs text-[rgb(var(--color-primary))]">
                                • Scroll down to load more
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <CustomerDeleteModal
                isOpen={showDeleteModal}
                customerName={customerToDelete?.name}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleConfirmDelete}
                isDeleting={isDeleting}
                t={t}
            />
        </div>
    );
};

export default CustomerListContent;
