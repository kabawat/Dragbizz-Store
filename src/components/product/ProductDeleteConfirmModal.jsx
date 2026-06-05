"use client";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { useCallback } from "react";
import { Button } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { removeProduct } from "@/store/slices/products/productSlice";
import { productService } from "@/service/retailer";
import useApiResponse from "@/hooks/useApiResponse";

// Product delete confirmation modal
const ProductDeleteConfirmModal = ({
  productToDelete,  // { id, name } | null
  onClose,          // () => void
  onSuccess,        // (productName: string) => void
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId || "";

  const isOpen = Boolean(productToDelete);
  const { execute, loading: isDeleting } = useApiResponse();

  const handleConfirm = useCallback(async () => {
    if (!productToDelete) return;

    const result = await execute(
      productService.deleteProduct(productToDelete.id, storeId),
      { showToast: false }
    );

    if (result?.success) {
      // Update state locally
      dispatch(removeProduct(productToDelete.id));
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
    <div className="fixed inset-0 backdrop-blur-[2px] bg-black/10 flex items-center justify-center z-[9999] transition-all duration-300">
      <div className="bg-gradient-to-br from-[rgb(var(--color-bg-primary))] to-[rgb(var(--color-bg-secondary))] rounded-2xl border border-[rgb(var(--color-border-primary))] shadow-2xl max-w-md w-full mx-4 transform transition-all duration-500">

        {/* Header */}
        <div className="px-6 py-4 border-b border-[rgb(var(--color-border-primary))]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                  {t("products.deleteProduct")}
                </h2>
                <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                  {t("modals.deleteConfirmMessage")}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-[rgb(var(--color-bg-tertiary))] rounded-lg transition-colors duration-200"
              disabled={isDeleting}
            >
              <X className="w-5 h-5 text-[rgb(var(--color-text-secondary))]" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <div className="mb-6">
            <p className="text-[rgb(var(--color-text-primary))] mb-2">
              {t("products.deleteConfirm")}
            </p>
            <div className="bg-[rgb(var(--color-bg-tertiary))] rounded-lg p-3 border border-[rgb(var(--color-border-primary))]">
              <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                &ldquo;{productToDelete?.name}&rdquo;
              </p>
              <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-1">
                {t("modals.deleteConfirmMessage")}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 h-10 text-sm font-semibold border-2 border-[rgb(var(--color-border-primary))] text-[rgb(var(--color-text-primary))]"
              disabled={isDeleting}
            >
              {t("common.cancel")}
            </Button>

            <Button
              variant="danger"
              onClick={handleConfirm}
              className="flex-1 h-10 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white"
              leftIcon={Trash2}
              loading={isDeleting}
              disabled={isDeleting}
            >
              {isDeleting ? t("common.loading") : t("products.deleteProduct")}
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[rgb(var(--color-bg-tertiary))] border-t border-[rgb(var(--color-border-primary))] rounded-b-2xl">
          <p className="text-xs text-[rgb(var(--color-text-tertiary))] text-center">
            {t("products.deletePermanentlyWarning")}
          </p>
        </div>

      </div>
    </div>
  );
};

export default ProductDeleteConfirmModal;
