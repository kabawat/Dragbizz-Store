"use client";
import { useRouter } from "next/navigation";
import { Package, Plus } from "lucide-react";
import { EmptyState, PageLoader } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getProducts, setViewMode } from "@/store/slices/products/productSlice";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import ProductListHeader from "./components/ProductListHeader";
import ProductListContent from "./components/ProductListContent";
import { useEffect, useState } from "react";

const ProductsPage = () => {
  const { t } = useTranslation();

  useDashboardHeader(t("products.title"), t("products.description"));
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [searchValue, setSearchValue] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [showInCatalog, setShowInCatalog] = useState("");
  const [category, setCategory] = useState("");

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
    onNew: canCreate ? () => router.push("/dashboard/products/create") : undefined,
  });

  const isFiltered = searchValue || sortBy || showInCatalog || category;

  return (
    <div className="overflow-hidden">
      <div className="max-w-8xl mx-auto w-full">
        <ProductListHeader
          canCreate={canCreate}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          sortBy={sortBy}
          setSortBy={setSortBy}
          showInCatalog={showInCatalog}
          setShowInCatalog={setShowInCatalog}
          category={category}
          setCategory={setCategory}
        />

        <div className="px-5">
          {isLoading && products.length === 0 && !error && (<PageLoader />)}

          {!isLoading && products.length === 0 && (
            <EmptyState
              className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))]"
              icon={Package}
              title={t("products.noProducts")}
              description={isFiltered ? t("products.noResultsDescription") : t("products.emptyDescription")}
              actionButton={!isFiltered && canCreate ? {
                label: t("products.addProduct"),
                onClick: () => router.push("/dashboard/products/create"),
                icon: Plus
              } : null}
            />
          )}

          {products.length > 0 && <ProductListContent canEdit={canEdit} canDelete={canDelete} />}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
