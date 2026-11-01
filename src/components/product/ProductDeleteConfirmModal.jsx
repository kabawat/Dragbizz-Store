"use client";
import { ProductDeleteConfirmModalView } from "@dragorbit/features/products";

import { useCallback } from "react";

import { useTranslation } from "@/hooks/ui/useTranslation";
import useApiResponse from "@/hooks/useApiResponse";
import { productService } from "@/service/retailer";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { removeProduct } from "@/store/slices/products/productSlice";

// Product delete confirmation modal
const ProductDeleteConfirmModal = ({
  productToDelete, // { id, name } | null
  onClose, // () => void
  onSuccess, // (productName: string) => void
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId || "";

  const isOpen = Boolean(productToDelete);
  const { execute, loading: isDeleting } = useApiResponse();

  const handleConfirm = useCallback(async () => {
    if (!productToDelete) return;

    const targetId =
      typeof productToDelete.id === "object" && productToDelete.id !== null
        ? (productToDelete.id.id ?? productToDelete.id._id)
        : (productToDelete.id ?? productToDelete._id);

    if (!targetId || typeof targetId !== "string") {
      console.error(
        "Invalid targetId for product deletion:",
        targetId,
        productToDelete
      );
      return;
    }

    const result = await execute(
      productService.deleteProduct(targetId, storeId),
      { showToast: false }
    );

    if (result?.success) {
      // Update state locally
      dispatch(removeProduct(targetId));
      onSuccess?.(productToDelete.name);
      onClose?.();
    }
  }, [productToDelete, storeId, dispatch, onClose, onSuccess, execute]);

  const handleClose = useCallback(() => {
    if (isDeleting) return;
    onClose?.();
  }, [isDeleting, onClose]);

  if (!isOpen) return null;

  return (
    <ProductDeleteConfirmModalView
      model={{ t, handleClose, isDeleting, productToDelete, handleConfirm }}
    />
  );
};

export default ProductDeleteConfirmModal;
