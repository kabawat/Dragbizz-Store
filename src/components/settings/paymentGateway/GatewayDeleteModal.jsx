"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Button, Modal } from "@/components/ui";
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
      await dispatch(deleteStorePaymentGateway({ storeId, gatewayId: gatewayDocId })).unwrap();
      await dispatch(
        getStorePaymentGateways({ storeId, scope: "agency", forceRefresh: true }),
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
    t(`settings.paymentGateway.types.${gatewayToDelete?.gatewayType}`, gatewayToDelete?.gatewayType);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={t("settings.paymentGateway.deleteTitle")}
      size="md"
    >
      <div className="space-y-4">
        <p className="text-[rgb(var(--color-text-secondary))]">
          {t("settings.paymentGateway.confirmDelete")}
        </p>
        {gatewayToDelete && (
          <div className="bg-[rgb(var(--color-bg-secondary))] p-4 rounded-lg border border-[rgb(var(--color-border-primary))]">
            <p className="font-medium text-[rgb(var(--color-text-primary))]">
              <span className="text-xs uppercase tracking-wide text-[rgb(var(--color-text-tertiary))] mr-2">
                {gatewayToDelete.gatewayType}
              </span>
              {displayName}
            </p>
          </div>
        )}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleCancel} disabled={!!isDeleting}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={!!isDeleting}
            leftIcon={Trash2}
            loading={!!isDeleting}
          >
            {isDeleting ? t("common.deleting") : t("common.delete")}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default GatewayDeleteModal;
