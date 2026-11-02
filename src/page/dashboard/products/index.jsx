"use client";
import { ProductsScreen } from "@dragorbit/features/products";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setViewMode } from "@/store/slices/products/productSlice";
import ProductListContent from "./components/ProductListContent";
import ProductListHeader from "./components/ProductListHeader";

const ProductsPage = ({ initialProductId = null }) => {
  const { t } = useTranslation();

  useDashboardHeader(t("products.title"), t("products.description"));
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [searchValue, setSearchValue] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [showInCatalog, setShowInCatalog] = useState("");
  const [category, setCategory] = useState("");

  const {
    products,
    isLoading: requestLoading,
    hasLoaded,
    error,
  } = useAppSelector((state) => state.products);
  const isLoading = requestLoading || (!hasLoaded && !error);

  const {
    can,
    create: canCreate,
    edit: canEdit,
    delete: canDelete,
    loading: permissionsLoading,
  } = useModulePermissions("product");

  useEffect(() => {
    if (!permissionsLoading && !can("read")) {
      router.push("/dashboard");
    }
  }, [can, permissionsLoading, router]);

  // Set default view mode to split
  useEffect(() => {
    dispatch(setViewMode("split"));
    localStorage.setItem("products-view-mode", "split");
  }, [dispatch]);

  useCommonHotkeys({
    onBack: () => router.push("/dashboard"),
    onNew: canCreate
      ? () => router.push("/dashboard/products/create")
      : undefined,
  });

  const isFiltered = searchValue || sortBy || showInCatalog || category;

  return (
    <ProductsScreen
      model={{
        ProductListHeader,
        canCreate,
        searchValue,
        setSearchValue,
        sortBy,
        setSortBy,
        showInCatalog,
        setShowInCatalog,
        category,
        setCategory,
        isLoading,
        products,
        error,
        t,
        isFiltered,
        ProductListContent,
        initialProductId,
        canEdit,
        canDelete,
        onCreate: () => router.push("/dashboard/products/create"),
      }}
    />
  );
};

export default ProductsPage;
