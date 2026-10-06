"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Tags } from "lucide-react";
import dynamic from "next/dynamic";
import { Button, EmptyState, PageLoader } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { useAppSelector } from "@/store/hooks";
import useApiResponse from "@/hooks/useApiResponse";
import { categoryService } from "@/service";

const CategoryDrawer = dynamic(() => import("@/components/product/CategoryDrawer"), {
  ssr: false,
});

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
  const { can, create: canCreate, loading: permissionsLoading } = useModulePermissions("product");
  const { execute, loading } = useApiResponse();

  const [categories, setCategories] = useState([]);
  const [showDrawer, setShowDrawer] = useState(false);

  const fetchCategories = useCallback(async () => {
    if (!storeId) return;
    const result = await execute(
      categoryService.getCategories({ store: storeId, limit: 200 }),
      { showToast: false }
    );
    setCategories(unwrapList(result?.data));
  }, [storeId, execute]);

  useEffect(() => {
    if (!permissionsLoading && !can("read")) {
      router.push("/dashboard");
    }
  }, [can, permissionsLoading, router]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <div className="overflow-hidden">
      <div className="max-w-8xl mx-auto w-full">
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <h1 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
              {t("sidebar.categories")}
            </h1>
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">
              {categories.length} {t("common.items") || "items"}
            </p>
          </div>
          {canCreate && (
            <Button leftIcon={Plus} onClick={() => setShowDrawer(true)}>
              {t("products.addNewCategory") || "Add Category"}
            </Button>
          )}
        </div>

        <div className="px-5 pb-6">
          {loading && categories.length === 0 && <PageLoader />}

          {!loading && categories.length === 0 && (
            <EmptyState
              className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))]"
              icon={Tags}
              title={t("sidebar.noCategories") || "No categories yet"}
              description={t("sidebar.noCategoriesDescription") || "Create categories to organize products"}
              actionButton={
                canCreate
                  ? {
                      label: t("products.addNewCategory") || "Add Category",
                      onClick: () => setShowDrawer(true),
                      icon: Plus,
                    }
                  : null
              }
            />
          )}

          {categories.length > 0 && (
            <div className="rounded-xl border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[rgb(var(--color-bg-secondary))] text-left text-[rgb(var(--color-text-secondary))]">
                  <tr>
                    <th className="px-4 py-3 font-medium">{t("common.name") || "Name"}</th>
                    <th className="px-4 py-3 font-medium">{t("common.description") || "Description"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgb(var(--color-border-primary))]">
                  {categories.map((cat) => (
                    <tr key={cat._id || cat.id || cat.name}>
                      <td className="px-4 py-3 font-medium text-[rgb(var(--color-text-primary))]">
                        {cat.name}
                      </td>
                      <td className="px-4 py-3 text-[rgb(var(--color-text-secondary))]">
                        {cat.description || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <CategoryDrawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        storeId={storeId}
        onCategoryAdded={() => {
          setShowDrawer(false);
          fetchCategories();
        }}
      />
    </div>
  );
};

export default CategoriesPage;
