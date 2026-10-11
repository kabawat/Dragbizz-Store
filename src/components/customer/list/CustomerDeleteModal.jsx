"use client";
import { ListCustomerDeleteModalPresentation } from "@dragorbit/features/customers";

import { forwardRef, useImperativeHandle, useState } from "react";

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
      setCustomerToDelete({
        id: customerId,
        name: customer?.name || "Customer",
      });
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
      { showToast: false },
    );

    if (result?.success) {
      dispatch(removeCustomer(customerToDelete.id));
      showSuccess(
        t("modals.deletedSuccessfully", { item: t("common.customer") }) ||
          "Customer deleted successfully",
      );
      handleClose();
    } else {
      showError(result?.message || "Failed to delete customer");
    }
  };

  if (!isOpen) return null;

  return (
    <ListCustomerDeleteModalPresentation
      model={{ t, customerToDelete, handleClose, isDeleting, handleConfirm }}
    />
  );
});

CustomerDeleteModal.displayName = "CustomerDeleteModal";

export default CustomerDeleteModal;
