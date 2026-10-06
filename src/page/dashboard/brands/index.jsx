"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Award, Plus } from "lucide-react";
import dynamic from "next/dynamic";
import { Button, EmptyState, PageLoader } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { useAppSelector } from "@/store/hooks";
import useApiResponse from "@/hooks/useApiResponse";
import { brandService } from "@/service";

const BrandDrawer = dynamic(() => import("@/components/product/BrandDrawer"), {
  ssr: false,
});

function unwrapList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.brands)) return data.brands;
  return [];
}

const BrandsPage = () => {
  const { t } = useTranslation();
  useDashboardHeader(
    t("sidebar.brands"),
    t("sidebar.brandsDescription") || "Manage product brands"
  );
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;
  const { can, create: canCreate, loading: permissionsLoading } = useModulePermissions("product");
  const { execute, loading } = useApiResponse();

  const [brands, setBrands] = useState([]);
  const [showDrawer, setShowDrawer] = useState(false);

  const fetchBrands = useCallback(async () => {
    if (!storeId) return;
    const result = await execute(
      brandService.getBrands({ store: storeId, limit: 200 }),
      { showToast: false }
    );
    setBrands(unwrapList(result?.data));
  }, [storeId, execute]);

  useEffect(() => {
    if (!permissionsLoading && !can("read")) {
      router.push("/dashboard");
    }
  }, [can, permissionsLoading, router]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  return (
    <div className="overflow-hidden">
      <div className="max-w-8xl mx-auto w-full">
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <h1 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
              {t("sidebar.brands")}
            </h1>
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">
              {brands.length} {t("common.items") || "items"}
            </p>
          </div>
          {canCreate && (
            <Button leftIcon={Plus} onClick={() => setShowDrawer(true)}>
              {t("products.addNewBrand") || "Add Brand"}
            </Button>
          )}
        </div>

        <div className="px-5 pb-6">
          {loading && brands.length === 0 && <PageLoader />}

          {!loading && brands.length === 0 && (
            <EmptyState
              className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))]"
              icon={Award}
              title={t("sidebar.noBrands") || "No brands yet"}
              description={
                t("sidebar.noBrandsDescription") ||
                "Create brands to organize your products"
              }
              actionButton={
                canCreate
                  ? {
                      label: t("products.addNewBrand") || "Add Brand",
                      onClick: () => setShowDrawer(true),
                      icon: Plus,
                    }
                  : null
              }
            />
          )}

          {brands.length > 0 && (
            <div className="rounded-xl border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[rgb(var(--color-bg-secondary))] text-left text-[rgb(var(--color-text-secondary))]">
                  <tr>
                    <th className="px-4 py-3 font-medium">{t("common.name") || "Name"}</th>
                    <th className="px-4 py-3 font-medium">
                      {t("common.description") || "Description"}
                    </th>
                    <th className="px-4 py-3 font-medium">{t("sidebar.products")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgb(var(--color-border-primary))]">
                  {brands.map((brand) => (
                    <tr key={brand.id || brand._id || brand.name}>
                      <td className="px-4 py-3 font-medium text-[rgb(var(--color-text-primary))]">
                        {brand.name}
                      </td>
                      <td className="px-4 py-3 text-[rgb(var(--color-text-secondary))]">
                        {brand.description || "—"}
                      </td>
                      <td className="px-4 py-3 text-[rgb(var(--color-text-secondary))]">
                        {brand.productCount || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <BrandDrawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        storeId={storeId}
        onBrandAdded={() => {
          setShowDrawer(false);
          fetchBrands();
        }}
      />
    </div>
  );
};

export default BrandsPage;
