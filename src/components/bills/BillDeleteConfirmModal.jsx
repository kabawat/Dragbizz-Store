"use client";
import { BillDeleteConfirmModalPresentation } from "@dragorbit/features/bills";

import { useTranslation } from "@/hooks/ui/useTranslation";

const BillDeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  billToDelete,
  formatCurrency,
  isDeleting = false,
}) => {
  const { t } = useTranslation();

  return (
    <BillDeleteConfirmModalPresentation
      model={{
        isOpen,
        onClose,
        t,
        billToDelete,
        formatCurrency,
        isDeleting,
        onConfirm,
      }}
    />
  );
};

export default BillDeleteConfirmModal;
