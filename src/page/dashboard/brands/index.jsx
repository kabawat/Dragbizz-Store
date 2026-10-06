"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Award } from "lucide-react";
import { EmptyState, PageLoader } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { useAppSelector } from "@/store/hooks";
import useApiResponse from "@/hooks/useApiResponse";
import { productService } from "@/service";

function unwrapList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.products)) return data.products;
  return [];
}

const BrandsPage = () => {
  const { t } = useTranslation();
  useDashboardHeader(
    t("sidebar.brands"),
    t("sidebar.brandsDescription") || "Brands used across your products"
  );
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;
  const { can, loading: permissionsLoading } = useModulePermissions("product");
  const { execute, loading } = useApiResponse();
  const [products, setProducts] = useState([]);

  const fetchProducts = useCallback(async () => {
    if (!storeId) return;
    const result = await execute(
      productService.getProducts({ store: storeId, limit: 500, lightweight: true }),
      { showToast: false }
    );
    setProducts(unwrapList(result?.data));
  }, [storeId, execute]);

  useEffect(() => {
    if (!permissionsLoading && !can("read")) {
      router.push("/dashboard");
    }
  }, [can, permissionsLoading, router]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const brands = useMemo(() => {
    const map = new Map();
    products.forEach((p) => {
      const name = (p.brand || "").trim();
      if (!name) return;
      const key = name.toLowerCase();
      map.set(key, { name, count: (map.get(key)?.count || 0) + 1 });
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

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
                "Brands appear here when you add them on products"
              }
            />
          )}

          {brands.length > 0 && (
            <div className="rounded-xl border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[rgb(var(--color-bg-secondary))] text-left text-[rgb(var(--color-text-secondary))]">
                  <tr>
                    <th className="px-4 py-3 font-medium">{t("sidebar.brands")}</th>
                    <th className="px-4 py-3 font-medium">{t("sidebar.products")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgb(var(--color-border-primary))]">
                  {brands.map((brand) => (
                    <tr key={brand.name}>
                      <td className="px-4 py-3 font-medium text-[rgb(var(--color-text-primary))]">
                        {brand.name}
                      </td>
                      <td className="px-4 py-3 text-[rgb(var(--color-text-secondary))]">
                        {brand.count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrandsPage;
