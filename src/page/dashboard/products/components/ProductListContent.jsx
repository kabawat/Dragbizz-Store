"use client";
import { StockInDrawer } from "@/components/ui";
import { ProductListContentView } from "@dragorbit/features/products";

import { useCallback, useEffect, useRef, useState } from "react";
import {
	ProductCard,
	ProductDeleteConfirmModal,
	ProductDeleteSuccessModal,
	ProductErrorModal,
	ProductTable,
} from "@/components/product";

import { useGlobalToast } from "@/contexts/ToastContext";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getProducts } from "@/store/slices/products/productSlice";
import { transformProductsArray } from "@/utils/productUtils";
import { useRouter } from "next/navigation";

const ProductListContent = ({ canEdit = false, canDelete = false }) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const router = useRouter();
	const { showSuccess } = useGlobalToast();

	const { products, isLoading, isFetchingMore, error, pagination, viewMode } =
		useAppSelector((state) => state.products);
	const { selectedStore } = useAppSelector((state) => state.profile);
	const storeId = selectedStore?.storeId || "";

	// Local state
	const [productToDelete, setProductToDelete] = useState(null);
	const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
	const [deletedProductName, setDeletedProductName] = useState("");
	const [showErrorModal, setShowErrorModal] = useState(false);
	const [errorDetails, setErrorDetails] = useState(null);
	const [showStockInDrawer, setShowStockInDrawer] = useState(false);
	const [productForStockIn, setProductForStockIn] = useState(null);

	// ─── Refs for stable IntersectionObserver callback ───────────────────────
	const sentinelRef = useRef(null);
	const isFetchingMoreRef = useRef(isFetchingMore);
	const storeIdRef = useRef(storeId);
	const paginationRef = useRef(pagination);
	isFetchingMoreRef.current = isFetchingMore;
	storeIdRef.current = storeId;
	paginationRef.current = pagination;

	const transformedProducts = transformProductsArray(products);

	// Show error modal on Redux error
	useEffect(() => {
		if (error) {
			setErrorDetails({
				title: t("products.errorLoading"),
				message: error,
				details: t("common.tryAgain"),
			});
			setShowErrorModal(true);
		}
	}, [error, t]);

	// ─── Infinite scroll via IntersectionObserver ─────────────────────────────
	useEffect(() => {
		const sentinel = sentinelRef.current;
		if (!sentinel || !pagination.hasNextPage) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (
					entries[0].isIntersecting &&
					!isFetchingMoreRef.current &&
					storeIdRef.current
				) {
					dispatch(
						getProducts({
							store: storeIdRef.current,
							nextCursor: paginationRef.current.nextCursor,
							isFreshLoad: false,
						}),
					);
				}
			},
			{ threshold: 0.1 },
		);

		observer.observe(sentinel);
		return () => observer.disconnect();
	}, [dispatch, pagination.hasNextPage]);

	// Navigation handlers
	const handleEditProduct = useCallback(
		(productId) => router.push(`/dashboard/products/${productId}/edit`),
		[router],
	);
	const handleViewProduct = useCallback(
		(productId) => router.push(`/dashboard/products/${productId}`),
		[router],
	);

	// Stock In
	const handleStockIn = useCallback(
		(productId) => {
			const product = transformedProducts.find((p) => p.id === productId);
			setProductForStockIn(product);
			setShowStockInDrawer(true);
		},
		[transformedProducts],
	);
	const handleCloseStockInDrawer = useCallback(() => {
		setShowStockInDrawer(false);
		setProductForStockIn(null);
	}, []);
	const handleStockInSuccess = useCallback(
		(message) => showSuccess(message),
		[showSuccess],
	);

	// Delete handlers
	const handleDeleteProduct = useCallback(
		(productId) => {
			const product = transformedProducts.find((p) => p.id === productId);
			setProductToDelete({
				id: productId,
				name: product?.name || t("products.product"),
			});
		},
		[transformedProducts, t],
	);
	const handleDeleteClose = useCallback(() => setProductToDelete(null), []);
	const handleDeleteSuccess = useCallback((productName) => {
		setDeletedProductName(productName);
		setShowDeleteSuccessModal(true);
	}, []);

	return (
		<ProductListContentView
			model={{
				StockInDrawer,
				viewMode,
				ProductTable,
				transformedProducts,
				handleEditProduct,
				handleDeleteProduct,
				handleViewProduct,
				handleStockIn,
				isLoading,
				t,
				selectedStore,
				canEdit,
				canDelete,
				ProductCard,
				pagination,
				sentinelRef,
				isFetchingMore,
				ProductDeleteConfirmModal,
				productToDelete,
				handleDeleteClose,
				handleDeleteSuccess,
				ProductDeleteSuccessModal,
				showDeleteSuccessModal,
				setShowDeleteSuccessModal,
				deletedProductName,
				ProductErrorModal,
				showErrorModal,
				setShowErrorModal,
				errorDetails,
				showStockInDrawer,
				handleCloseStockInDrawer,
				productForStockIn,
				handleStockInSuccess,
			}}
		/>
	);
};

export default ProductListContent;
