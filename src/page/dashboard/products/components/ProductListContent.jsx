"use client";
import { ProductListContentView } from "@dragorbit/features/products";
import { useParams, useRouter } from "next/navigation";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ProductCard,
  ProductDeleteConfirmModal,
  ProductDeleteSuccessModal,
  ProductErrorModal,
  ProductTable,
} from "@/components/product";
import { StockInDrawer } from "@/components/ui";

import { useGlobalToast } from "@/contexts/ToastContext";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getProducts, setViewMode } from "@/store/slices/products/productSlice";
import { transformProductsArray } from "@/utils/productUtils";
import ProductMasterDetailLayout from "./ProductMasterDetailLayout";

const ProductListContent = ({
  canEdit = false,
  canDelete = false,
  initialProductId = null,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const params = useParams();
  const { showSuccess } = useGlobalToast();

  const routeProductId = params?.id || null;
  const effectiveInitialProductId = initialProductId || routeProductId;

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

  const transformedProducts = useMemo(
    () => transformProductsArray(products),
    [products]
  );

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
              includeVariants: false,
              lightweight: "true",
            })
          );
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [dispatch, pagination.hasNextPage]);

  // Navigation handlers
  const handleEditProduct = useCallback(
    (productId) => router.push(`/dashboard/products/${productId}/edit`),
    [router]
  );
  const handleViewProduct = useCallback(
    (productId) => {
      dispatch(setViewMode("split"));
      router.push(`/dashboard/products/${productId}`);
    },
    [dispatch, router]
  );

  // Stock In
  const handleStockIn = useCallback(
    (productOrId) => {
      const targetId =
        typeof productOrId === "object" && productOrId !== null
          ? (productOrId.id ?? productOrId._id)
          : productOrId;

      const product =
        typeof productOrId === "object" && productOrId !== null
          ? productOrId
          : transformedProducts.find((p) => (p.id ?? p._id) === targetId);

      setProductForStockIn(product || (targetId ? { id: targetId } : null));
      setShowStockInDrawer(true);
    },
    [transformedProducts]
  );
  const handleCloseStockInDrawer = useCallback(() => {
    setShowStockInDrawer(false);
    setProductForStockIn(null);
  }, []);
  const handleStockInSuccess = useCallback(
    (message) => {
      showSuccess(message);
      if (storeId) {
        dispatch(
          getProducts({
            store: storeId,
            limit: pagination?.limit || 20,
            isFreshLoad: true,
            includeVariants: false,
            lightweight: "true",
          })
        );
      }
    },
    [showSuccess, dispatch, storeId, pagination?.limit]
  );

  // Delete handlers
  const handleDeleteProduct = useCallback(
    (productOrId) => {
      const targetId =
        typeof productOrId === "object" && productOrId !== null
          ? (productOrId.id ?? productOrId._id ?? productOrId.localId)
          : productOrId;

      const product =
        typeof productOrId === "object" && productOrId !== null
          ? productOrId
          : transformedProducts.find((p) => (p.id ?? p._id) === targetId);

      setProductToDelete({
        id: targetId,
        name: product?.name || t("products.product"),
      });
    },
    [transformedProducts, t]
  );
  const handleDeleteClose = useCallback(() => setProductToDelete(null), []);
  const handleDeleteSuccess = useCallback((productName) => {
    setDeletedProductName(productName);
    setShowDeleteSuccessModal(true);
  }, []);

  // Render Split Master-Detail view as primary view
  if (viewMode === "split") {
    return (
      <ProductMasterDetailLayout
        initialProductId={effectiveInitialProductId}
        products={transformedProducts}
        rawProducts={products}
        isLoading={isLoading}
        isFetchingMore={isFetchingMore}
        pagination={pagination}
        sentinelRef={sentinelRef}
        canEdit={canEdit}
        canDelete={canDelete}
        onStockIn={handleStockIn}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
        storeId={storeId}
        selectedStore={selectedStore}
        t={t}
        StockInDrawer={StockInDrawer}
        showStockInDrawer={showStockInDrawer}
        handleCloseStockInDrawer={handleCloseStockInDrawer}
        productForStockIn={productForStockIn}
        handleStockInSuccess={handleStockInSuccess}
        ProductDeleteConfirmModal={ProductDeleteConfirmModal}
        productToDelete={productToDelete}
        handleDeleteClose={handleDeleteClose}
        handleDeleteSuccess={handleDeleteSuccess}
        ProductDeleteSuccessModal={ProductDeleteSuccessModal}
        showDeleteSuccessModal={showDeleteSuccessModal}
        setShowDeleteSuccessModal={setShowDeleteSuccessModal}
        deletedProductName={deletedProductName}
        ProductErrorModal={ProductErrorModal}
        showErrorModal={showErrorModal}
        setShowErrorModal={setShowErrorModal}
        errorDetails={errorDetails}
      />
    );
  }

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
