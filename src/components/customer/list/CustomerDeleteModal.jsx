"use client";
import { forwardRef, useImperativeHandle, useState } from "react";
import { Button } from "@/components/ui";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { removeCustomer } from "@/store/slices/customers/customerSlice";
import { customerService } from "@/service";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useTranslation } from "@/hooks/ui/useTranslation";
import useApiResponse from "@/hooks/useApiResponse";

const CustomerDeleteModal = forwardRef((_props, ref) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { showSuccess, showError } = useGlobalToast();
    const { customers } = useAppSelector((state) => state.customers);
    const { selectedStore } = useAppSelector((state) => state.profile);
    const storeId = selectedStore?.storeId;

    const [isOpen, setIsOpen] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState(null);
    const { execute, loading: isDeleting } = useApiResponse();

    // Expose open(customerId) to parent via ref
    useImperativeHandle(ref, () => ({
        open: (customerId) => {
            const customer = customers.find((c) => c.id === customerId);
            setCustomerToDelete({ id: customerId, name: customer?.name || "Customer" });
            setIsOpen(true);
        },
    }));

    const handleClose = () => {
        if (isDeleting) return;
        setIsOpen(false);
        setCustomerToDelete(null);
    };

    const handleConfirm = async () => {
        if (!customerToDelete) return;

        const result = await execute(
            customerService.deleteCustomer(customerToDelete.id, storeId),
            { showToast: false }
        );

        if (result?.success) {
            dispatch(removeCustomer(customerToDelete.id));
            showSuccess(t("modals.deletedSuccessfully", { item: t("common.customer") }) || "Customer deleted successfully");
            handleClose();
        } else {
            showError(result?.message || "Failed to delete customer");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
            <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4">
                    {t("customers.deleteCustomer") || "Delete Customer"}
                </h3>
                <p className="text-[rgb(var(--color-text-secondary))] mb-6">
                    Are you sure you want to delete <b>{customerToDelete?.name}</b> ? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={handleClose} disabled={isDeleting}>
                        {t("common.cancel")}
                    </Button>
                    <Button variant="danger" onClick={handleConfirm} loading={isDeleting}>
                        {t("common.delete")}
                    </Button>
                </div>
            </div>
        </div>
    );
});

CustomerDeleteModal.displayName = "CustomerDeleteModal";

export default CustomerDeleteModal;
