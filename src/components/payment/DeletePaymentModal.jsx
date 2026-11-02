"use client";
import { DeletePaymentModalPresentation } from "@dragorbit/features/payments";

import { formatCurrency } from "./utils";
import { useTranslation } from "@/hooks/ui/useTranslation";

const DeletePaymentModal = ({
  isOpen,
  onClose,
  paymentToDelete,
  onConfirmDelete,
}) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <DeletePaymentModalPresentation
      model={{ t, paymentToDelete, formatCurrency, onClose, onConfirmDelete }}
    />
  );
};

export default DeletePaymentModal;
