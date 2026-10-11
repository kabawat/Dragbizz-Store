"use client";
import { GatewayDeleteModalView } from "@dragorbit/features/integrations";

import { useState } from "react";

import {
  deleteStorePaymentGateway,
  getStorePaymentGateways,
} from "@/store/slices/storePaymentGatewaySlice";
import { useAppDispatch } from "@/store/hooks";
import { useTranslation } from "@/hooks/ui/useTranslation";

const GatewayDeleteModal = ({
  isOpen,
  gatewayToDelete,
  storeId,
  onClose,
  onSuccess,
  onError,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const gatewayDocId = gatewayToDelete?.id;
    if (!storeId || !gatewayDocId) return;

    try {
      setIsDeleting(true);
      await dispatch(
        deleteStorePaymentGateway({ storeId, gatewayId: gatewayDocId }),
      ).unwrap();
      await dispatch(
        getStorePaymentGateways({
          storeId,
          scope: "agency",
          forceRefresh: true,
        }),
      ).unwrap();
      onSuccess?.(t("settings.paymentGateway.deletedSuccess"));
      onClose?.();
    } catch (error) {
      onError?.(error?.message || error || "Failed to delete payment gateway");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    if (!isDeleting) onClose?.();
  };

  const displayName =
    gatewayToDelete?.label ||
    t(
      `settings.paymentGateway.types.${gatewayToDelete?.gatewayType}`,
      gatewayToDelete?.gatewayType,
    );

  return (
    <GatewayDeleteModalView
      model={{
        isOpen,
        handleCancel,
        t,
        gatewayToDelete,
        displayName,
        isDeleting,
        handleDelete,
      }}
    />
  );
};

export default GatewayDeleteModal;
