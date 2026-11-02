"use client";
import { ViewComponentsDeleteModalPresentation } from "@dragorbit/features/customers";

import { useTranslation } from "@/hooks/ui/useTranslation";

const DeleteModal = ({
  isOpen,
  customerName,
  onCancel,
  onConfirm,
  isDeleting,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <ViewComponentsDeleteModalPresentation
      model={{ t, customerName, onCancel, isDeleting, onConfirm }}
    />
  );
};

export default DeleteModal;
