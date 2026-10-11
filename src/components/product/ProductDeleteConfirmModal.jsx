"use client";
import { ProductDeleteConfirmModalView } from "@dragorbit/features/products";

import { useCallback } from "react";

import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { removeProduct } from "@/store/slices/products/productSlice";
import { productService } from "@/service/retailer";
import useApiResponse from "@/hooks/useApiResponse";

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

		const result = await execute(
			productService.deleteProduct(productToDelete.id, storeId),
			{ showToast: false },
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
		<ProductDeleteConfirmModalView
			model={{ t, handleClose, isDeleting, productToDelete, handleConfirm }}
		/>
	);
};

export default ProductDeleteConfirmModal;
