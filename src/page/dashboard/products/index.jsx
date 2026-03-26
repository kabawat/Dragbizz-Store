"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getProducts, setViewMode } from "@/store/slices/products/productSlice";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import ProductListHeader from "./components/ProductListHeader";
import ProductListContent from "./components/ProductListContent";
import ProductEmptyState from "./components/ProductEmptyState";

const ProductsPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { products, isLoading, error } = useAppSelector((state) => state.products);
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;

  const {
    can,
    create: canCreate,
    edit: canEdit,
    delete: canDelete,
    loading: permissionsLoading
  } = useModulePermissions("product");

  useEffect(() => {
    if (!permissionsLoading && !can("read")) {
      router.push("/dashboard");
    }
  }, [can, permissionsLoading, router]);

  // Restore saved view mode on mount
  useEffect(() => {
    const savedViewMode = localStorage.getItem("products-view-mode");
    if (savedViewMode === "table" || savedViewMode === "card") {
      dispatch(setViewMode(savedViewMode));
    }
  }, [dispatch]);

  useCommonHotkeys({
    onBack: () => router.push("/dashboard"),
  });

  return (
    <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
      <Sidebar />

      <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
        <Header
          title={t("products.title")}
          description={t("products.description")}
        />

        {permissionsLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[rgb(var(--color-text-secondary))] animate-pulse font-medium">{t("common.loadingData")}</p>
          </div>
        ) : (
          <div className="flex-1 p-5">
            <div className="max-w-8xl mx-auto">

              {/* Search, filters, view toggle, add button */}
              <ProductListHeader canCreate={canCreate} />

              {/* State 1: Initial loading */}
              {isLoading && products.length === 0 && !error && (
                <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-8 mb-6 flex justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-[rgb(var(--color-text-secondary))]">{t("common.loading")}</p>
                  </div>
                </div>
              )}

              {/* State 2: Empty state */}
              {!isLoading && products.length === 0 && <ProductEmptyState />}

              {/* State 3: Product list + modals + drawers */}
              {products.length > 0 && <ProductListContent canEdit={canEdit} canDelete={canDelete} />}

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
