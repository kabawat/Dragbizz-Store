"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Button, Modal } from "@/components/ui";
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
    const upiDocId = upiToDelete?.id || upiToDelete?._id;
    if (!storeId || !upiDocId) return;

    try {
      setIsDeleting(true);
      await dispatch(
        deleteStoreUpi({ storeId, upiId: upiDocId })
      ).unwrap();
      await dispatch(
        getStoreUpi({ storeId, scope: "agency", forceRefresh: true })
      ).unwrap();
      onSuccess?.(t("settings.upi.deletedSuccess"));
      onClose?.();
    } catch (error) {
      onError?.(
        error?.message || error || "Failed to delete UPI ID"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    if (!isDeleting) onClose?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={t("settings.upi.deleteUpiTitle")}
      size="md"
    >
      <div className="space-y-4">
        <p className="text-[rgb(var(--color-text-secondary))]">
          {t("settings.upi.confirmDelete")}
        </p>
        {upiToDelete && (
          <div className="bg-[rgb(var(--color-bg-secondary))] p-4 rounded-lg border border-[rgb(var(--color-border-primary))]">
            <p className="font-medium text-[rgb(var(--color-text-primary))]">
              {upiToDelete.label ? (
                <>
                  {upiToDelete.label}:{" "}
                  <code className="text-[rgb(var(--color-primary))]">
                    {upiToDelete.upiId}
                  </code>
                </>
              ) : (
                <code className="text-[rgb(var(--color-primary))]">
                  {upiToDelete.upiId}
                </code>
              )}
            </p>
          </div>
        )}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={!!isDeleting}
          >
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

export default UpiDeleteModal;
