"use client";
import { CategoriesScreen } from "@dragorbit/features/categories";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useTranslation } from "@/hooks/ui/useTranslation";
import useApiResponse from "@/hooks/useApiResponse";
import { categoryService } from "@/service";
import { useAppSelector } from "@/store/hooks";

const CategoryDrawer = dynamic(
  () => import("@/components/product/CategoryDrawer"),
  {
    ssr: false,
  }
);

function unwrapList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.categories)) return data.categories;
  return [];
}

const CategoriesPage = () => {
  const { t } = useTranslation();
  useDashboardHeader(
    t("sidebar.categories"),
    t("sidebar.categoriesDescription") || "Manage product categories"
  );
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;
  const {
    can,
    create: canCreate,
    edit: canEdit,
    delete: canDelete,
    loading: permissionsLoading,
  } = useModulePermissions("product");
  const { execute, loading: requestLoading } = useApiResponse();
  const { execute: executeDelete, loading: isDeleting } = useApiResponse();
  const [resolvedStoreId, setResolvedStoreId] = useState(null);
  const [error, setError] = useState(null);
  const loading = requestLoading || resolvedStoreId !== storeId;

  const [categories, setCategories] = useState([]);
  const [showDrawer, setShowDrawer] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const fetchCategories = useCallback(async () => {
    if (!storeId) return;
    setError(null);
    const result = await execute(
      categoryService.getCategories({ store: storeId, limit: 200 }),
      { showToast: false }
    );
    if (!result || result.success === false || result.status === false) {
      setError(result?.message || t("products.loadFailed"));
    } else {
      setCategories(unwrapList(result?.data));
    }
    setResolvedStoreId(storeId);
  }, [storeId, execute, t]);

  useEffect(() => {
    if (!permissionsLoading && !can("read")) {
      router.push("/dashboard");
    }
  }, [can, permissionsLoading, router]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleEditCategory = useCallback((category) => {
    setCategoryToEdit(category);
    setShowDrawer(true);
  }, []);

  const handleCreateCategory = useCallback(() => {
    setCategoryToEdit(null);
    setShowDrawer(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!categoryToDelete) return;
    const categoryId = categoryToDelete.id || categoryToDelete._id;
    const result = await executeDelete(
      categoryService.deleteCategory(categoryId, storeId),
      {
        message:
          t("products.categoryDeleteSuccess") ||
          "Category deleted successfully",
      }
    );
    if (result?.success) {
      setCategoryToDelete(null);
      fetchCategories();
    }
  }, [categoryToDelete, executeDelete, storeId, t, fetchCategories]);

  return (
    <CategoriesScreen
      model={{
        t,
        categories: resolvedStoreId === storeId ? categories : [],
        can,
        canCreate,
        canEdit: can("edit") ?? canEdit,
        canDelete: can("delete") ?? canDelete,
        setShowDrawer,
        loading,
        error,
        CategoryDrawer,
        showDrawer,
        storeId,
        fetchCategories,
        categoryToEdit,
        setCategoryToEdit,
        categoryToDelete,
        setCategoryToDelete,
        onEdit: handleEditCategory,
        onCreate: handleCreateCategory,
        isDeleting,
        handleConfirmDelete,
      }}
    />
  );
};

export default CategoriesPage;
