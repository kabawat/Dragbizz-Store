"use client";
import { UpiDeleteModalView } from "@dragorbit/features/integrations";

import { useState } from "react";

import { deleteStoreUpi, getStoreUpi } from "@/store/slices/storeUpiSlice";
import { useAppDispatch } from "@/store/hooks";
import { useTranslation } from "@/hooks/ui/useTranslation";

const UpiDeleteModal = ({
  isOpen,
  upiToDelete,
  storeId,
  onClose,
  onSuccess,
  onError,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const upiDocId = upiToDelete?.id;
    if (!storeId || !upiDocId) return;

    try {
      setIsDeleting(true);
      await dispatch(deleteStoreUpi({ storeId, upiId: upiDocId })).unwrap();
      await dispatch(
        getStoreUpi({ storeId, scope: "agency", forceRefresh: true }),
      ).unwrap();
      onSuccess?.(t("settings.upi.deletedSuccess"));
      onClose?.();
    } catch (error) {
      onError?.(error?.message || error || "Failed to delete UPI ID");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    if (!isDeleting) onClose?.();
  };

  return (
    <UpiDeleteModalView
      model={{ isOpen, handleCancel, t, upiToDelete, isDeleting, handleDelete }}
    />
  );
};

export default UpiDeleteModal;
