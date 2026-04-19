"use client";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { getProducts } from "@/store/slices/products/productSlice";
import { transformProductsArray } from "@/utils/productUtils";
import { useRouter } from "next/navigation";

const ProductListContent = ({ canEdit = false, canDelete = false }) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { showSuccess } = useGlobalToast();

    const { products, isLoading, isFetchingMore, error, pagination, viewMode } = useAppSelector(
        (state) => state.products
    );
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
                if (entries[0].isIntersecting && !isFetchingMoreRef.current && storeIdRef.current) {
                    dispatch(
                        getProducts({
                            store: storeIdRef.current,
                            nextCursor: paginationRef.current.nextCursor,
                            isFreshLoad: false,
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
        (productId) => router.push(`/dashboard/products/${productId}`),
        [router]
    );

    // Stock In
    const handleStockIn = useCallback(
        (productId) => {
            const product = transformedProducts.find((p) => p.id === productId);
            setProductForStockIn(product);
            setShowStockInDrawer(true);
        },
        [transformedProducts]
    );
    const handleCloseStockInDrawer = useCallback(() => {
        setShowStockInDrawer(false);
        setProductForStockIn(null);
    }, []);
    const handleStockInSuccess = useCallback(
        (message) => showSuccess(message),
        [showSuccess]
    );

    // Delete handlers
    const handleDeleteProduct = useCallback(
        (productId) => {
            const product = transformedProducts.find((p) => p.id === productId);
            setProductToDelete({ id: productId, name: product?.name || t("products.product") });
        },
        [transformedProducts, t]
    );
    const handleDeleteClose = useCallback(() => setProductToDelete(null), []);
    const handleDeleteSuccess = useCallback((productName) => {
        setDeletedProductName(productName);
        setShowDeleteSuccessModal(true);
    }, []);

    return (
        <>
            <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary)/0.6)] overflow-hidden">
                <div className="h-[calc(100vh-210px)] overflow-y-auto">
                    {viewMode === "table" ? (
                        <div className="h-auto">
                            <ProductTable
                                products={transformedProducts}
                                onEdit={handleEditProduct}
                                onDelete={handleDeleteProduct}
                                onViewDetails={handleViewProduct}
                                onStockIn={handleStockIn}
                                loading={isLoading}
                                emptyMessage={t("products.noProducts")}
                                hasStoreGst={!!selectedStore?.gst}
                                canEdit={canEdit}
                                canDelete={canDelete}
                            />
                        </div>
                    ) : (
                        <div>
                            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {transformedProducts.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        onEdit={handleEditProduct}
                                        onDelete={handleDeleteProduct}
                                        onViewDetails={handleViewProduct}
                                        onStockIn={handleStockIn}
                                        canEdit={canEdit}
                                        canDelete={canDelete}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Sentinel — IntersectionObserver triggers load more */}
                    {pagination.hasNextPage && (
                        <div ref={sentinelRef} className="h-4 w-full" />
                    )}

                    {/* Infinite scroll loading */}
                    {(isFetchingMore || isLoading) && transformedProducts.length > 0 && (
                        <div className="flex items-center justify-center py-16">
                            <div className="flex items-center gap-3">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[rgb(var(--color-primary))]" />
                                <span className="text-sm text-[rgb(var(--color-text-secondary))]">
                                    {t("common.loadingMore") || "Loading more..."}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-[rgb(var(--color-bg-tertiary))] border-t border-[rgb(var(--color-border-primary))] px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-[rgb(var(--color-text-secondary))]">
                            {pagination.hasNextPage ? (
                                <>
                                    Showing{" "}
                                    <span className="font-semibold text-[rgb(var(--color-text-primary))]">
                                        {transformedProducts.length}
                                    </span>{" "}
                                    products
                                    <span className="ml-2 text-xs text-[rgb(var(--color-primary))]">
                                        • Scroll down to load more
                                    </span>
                                </>
                            ) : (
                                <>
                                    <span className="font-semibold text-[rgb(var(--color-text-primary))]">
                                        {t("products.showingProducts", { count: transformedProducts.length })}
                                    </span>
                                    <span className="ml-2 text-xs text-[rgb(var(--color-text-tertiary))]">
                                        • {t("products.noMore")}
                                    </span>
                                </>
                            )}
                        </div>
                        <div className="text-sm text-[rgb(var(--color-text-secondary))]" />
                    </div>
                </div>
            </div>

            {/* Delete confirmation modal — self-contained */}
            <ProductDeleteConfirmModal
                productToDelete={productToDelete}
                onClose={handleDeleteClose}
                onSuccess={handleDeleteSuccess}
            />

            {/* Delete success modal */}
            <ProductDeleteSuccessModal
                isOpen={showDeleteSuccessModal}
                onClose={() => setShowDeleteSuccessModal(false)}
                productName={deletedProductName}
            />

            {/* Error modal */}
            <ProductErrorModal
                isOpen={showErrorModal}
                onClose={() => setShowErrorModal(false)}
                title={errorDetails?.title}
                message={errorDetails?.message}
                details={errorDetails?.details}
            />

            {/* Stock In Drawer */}
            <StockInDrawer
                isOpen={showStockInDrawer}
                onClose={handleCloseStockInDrawer}
                item={productForStockIn}
                onSuccess={handleStockInSuccess}
                type="product"
            />
        </>
    );
};

export default ProductListContent;
