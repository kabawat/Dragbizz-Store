"use client";
import { DeleteSupplierModalPresentation } from "@dragorbit/features/suppliers";

import { useEffect, useState } from "react";

import { useTranslation } from "@/hooks/ui/useTranslation";

const DeleteSupplierModal = ({
  isOpen,
  onClose,
  supplierToDelete,
  onConfirmDelete,
  isDeleting,
}) => {
  const { t } = useTranslation();

  // Internal success state — no need to bubble up to parent
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [deletedSupplierName, setDeletedSupplierName] = useState("");

  // Reset internal state when modal closes externally
  useEffect(() => {
    if (!isOpen) {
      setShowSuccessModal(false);
      setDeletedSupplierName("");
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    const name = supplierToDelete?.name || "";
    await onConfirmDelete();
    // Show success only after parent confirms deletion (no error)
    setDeletedSupplierName(name);
    setShowSuccessModal(true);
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    setDeletedSupplierName("");
    onClose();
  };

  if (!isOpen && !showSuccessModal) return null;

  return (
    <DeleteSupplierModalPresentation
      model={{
        isOpen,
        showSuccessModal,
        t,
        supplierToDelete,
        onClose,
        isDeleting,
        handleConfirm,
        deletedSupplierName,
        handleCloseSuccess,
      }}
    />
  );
};

export default DeleteSupplierModal;
