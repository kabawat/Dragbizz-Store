"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Layers } from "lucide-react";
import { EmptyState, PageLoader } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { useAppSelector } from "@/store/hooks";
import useApiResponse from "@/hooks/useApiResponse";
import { variantService } from "@/service";

function unwrapList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.variants)) return data.variants;
  return [];
}

const VariantsPage = () => {
  const { t } = useTranslation();
  useDashboardHeader(
    t("sidebar.variants"),
    t("sidebar.variantsDescription") || "Product variants and pricing"
  );
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;
  const { can, loading: permissionsLoading } = useModulePermissions("product");
  const { execute, loading } = useApiResponse();
  const [variants, setVariants] = useState([]);

  const fetchVariants = useCallback(async () => {
    if (!storeId) return;
    const result = await execute(
      variantService.getVariants({ store: storeId, limit: 200 }),
      { showToast: false }
    );
    setVariants(unwrapList(result?.data));
  }, [storeId, execute]);

  useEffect(() => {
    if (!permissionsLoading && !can("read")) {
      router.push("/dashboard");
    }
  }, [can, permissionsLoading, router]);

  useEffect(() => {
    fetchVariants();
  }, [fetchVariants]);

  return (
    <div className="overflow-hidden">
      <div className="max-w-8xl mx-auto w-full">
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <h1 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
              {t("sidebar.variants")}
            </h1>
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">
              {variants.length} {t("common.items") || "items"}
            </p>
          </div>
        </div>

        <div className="px-5 pb-6">
          {loading && variants.length === 0 && <PageLoader />}

          {!loading && variants.length === 0 && (
            <EmptyState
              className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))]"
              icon={Layers}
              title={t("sidebar.noVariants") || "No variants yet"}
              description={
                t("sidebar.noVariantsDescription") ||
                "Variants are created when you add products"
              }
            />
          )}

          {variants.length > 0 && (
            <div className="rounded-xl border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[rgb(var(--color-bg-secondary))] text-left text-[rgb(var(--color-text-secondary))]">
                  <tr>
                    <th className="px-4 py-3 font-medium">{t("sidebar.products")}</th>
                    <th className="px-4 py-3 font-medium">{t("products.sku") || "SKU"}</th>
                    <th className="px-4 py-3 font-medium">{t("products.mrp") || "MRP"}</th>
                    <th className="px-4 py-3 font-medium">
                      {t("products.sellingPrice") || "Selling Price"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgb(var(--color-border-primary))]">
                  {variants.map((v) => (
                    <tr key={v._id || v.id}>
                      <td className="px-4 py-3 font-medium text-[rgb(var(--color-text-primary))]">
                        {v.product?.name || v.name || "—"}
                      </td>
                      <td className="px-4 py-3 text-[rgb(var(--color-text-secondary))]">
                        {v.sku || "—"}
                      </td>
                      <td className="px-4 py-3 text-[rgb(var(--color-text-secondary))]">
                        ₹{(parseFloat(v.mrp) || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-[rgb(var(--color-text-secondary))]">
                        ₹{(parseFloat(v.sellingPrice) || 0).toFixed(2)}
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

export default VariantsPage;
