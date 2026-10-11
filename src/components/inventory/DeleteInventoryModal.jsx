"use client";
import { DeleteInventoryModalPresentation } from "@dragorbit/features/inventory";

import { useApiResponse } from "@/hooks/useApiResponse";
import inventoryService from "@/service/retailer/inventory.service";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppSelector } from "@/store/hooks";

const DeleteInventoryModal = ({
  isOpen,
  onClose,
  inventoryToDelete,
  onDeleteSuccess,
}) => {
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId || "";
  const { t } = useTranslation();
  const { execute, loading: isDeleting } = useApiResponse();

  if (!isOpen) return null;

  const handleConfirmDelete = async () => {
    if (!inventoryToDelete) return;

    const result = await execute(
      inventoryService.deleteInventory(inventoryToDelete.id, storeId),
      {
        message: t("inventory.deleteSuccess", {
          defaultValue: "Stock deleted successfully.",
        }),
      },
    );

    if (result?.success) {
      onDeleteSuccess?.(inventoryToDelete.id);
      onClose();
    }
  };

  return (
    <DeleteInventoryModalPresentation
      model={{ inventoryToDelete, onClose, isDeleting, handleConfirmDelete }}
    />
  );
};

export default DeleteInventoryModal;
