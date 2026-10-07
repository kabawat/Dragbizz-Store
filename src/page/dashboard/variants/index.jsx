"use client";
import { DataTable, TableRowActions } from "@dragorbit/ui/table";
import { AlertTriangle, Edit, Layers, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button, EmptyState, PageLoader } from "@/components/ui";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useTranslation } from "@/hooks/ui/useTranslation";
import useApiResponse from "@/hooks/useApiResponse";
import { variantService } from "@/service";
import { useAppSelector } from "@/store/hooks";
import { unwrapVariantList, variantDisplayLabel } from "@/utils/variantForm";

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
  const { execute: executeDelete, loading: isDeleting } = useApiResponse();
  const [variants, setVariants] = useState([]);
  const [variantToDelete, setVariantToDelete] = useState(null);

  const fetchVariants = useCallback(async () => {
    if (!storeId) return;
    const result = await execute(
      variantService.getVariants({ store: storeId, limit: 200 }),
      { showToast: false }
    );
    setVariants(unwrapVariantList(result?.data));
  }, [storeId, execute]);

  useEffect(() => {
    if (!permissionsLoading && !can("read")) {
      router.push("/dashboard");
    }
  }, [can, permissionsLoading, router]);

  useEffect(() => {
    fetchVariants();
  }, [fetchVariants]);

  const handleConfirmDelete = async () => {
    if (!variantToDelete) return;
    const id = variantToDelete._id || variantToDelete.id;
    const result = await executeDelete(
      variantService.deleteVariant(id, storeId),
      {
        message:
          t("products.variantDeleteSuccess") || "Variant deleted successfully",
      }
    );
    if (result?.success) {
      setVariantToDelete(null);
      fetchVariants();
    }
  };

  return (
    <div className="overflow-hidden">
      <div className="max-w-8xl mx-auto w-full">
        <div className="flex items-center justify-between px-5 py-4 gap-4 flex-wrap">
          <div>
            <h1 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
              {t("sidebar.variants")}
            </h1>
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">
              {variants.length} {t("common.items") || "items"}
            </p>
          </div>
          {can("create") && (
            <Button
              variant="primary"
              leftIcon={Plus}
              onClick={() => router.push("/dashboard/variants/add")}
            >
              {t("products.addVariant") || "Add variant"}
            </Button>
          )}
        </div>

        <div className="px-5 pb-6">
          <DataTable
            caption={t("sidebar.variants")}
            rows={variants}
            getRowKey={(row) => row._id || row.id || row.name}
            columns={[
              {
                id: "name",
                header: t("products.displayName") || "Display name",
                width: "24%",
                cell: (variant) => (
                  <>
                    <button
                      type="button"
                      className="font-semibold text-left hover:text-[rgb(var(--color-primary))]"
                      onClick={(event) => {
                        event.stopPropagation();
                        router.push(
                          `/dashboard/variants/view/${variant._id || variant.id}`
                        );
                      }}
                    >
                      {variant.displayName || "—"}
                    </button>
                    {variant.isDefault && (
                      <span className="ml-2 text-xs text-[rgb(var(--color-text-secondary))]">
                        ({t("products.default") || "default"})
                      </span>
                    )}
                  </>
                ),
              },
              {
                id: "product",
                header: t("sidebar.products"),
                width: "22%",
                cell: (variant) => variant.product?.name || "—",
              },
              {
                id: "sku",
                header: t("products.sku") || "SKU",
                width: "18%",
                cell: (variant) => variant.sku || "—",
              },
              {
                id: "mrp",
                header: t("products.mrp") || "MRP",
                align: "right",
                cell: (variant) =>
                  `₹${(parseFloat(variant.mrp) || 0).toFixed(2)}`,
              },
              {
                id: "price",
                header: t("products.sellingPrice") || "Selling Price",
                align: "right",
                cell: (variant) =>
                  `₹${(parseFloat(variant.sellingPrice) || 0).toFixed(2)}`,
              },
              {
                id: "actions",
                header: t("common.actions") || "Actions",
                width: 100,
                align: "center",
                pin: "right",
                hidden: !can("edit") && !can("delete"),
                cellProps: () => ({
                  onClick: (event) => event.stopPropagation(),
                }),
                cell: (variant) => (
                  <TableRowActions
                    label={`${t("common.actions")}: ${variantDisplayLabel(variant)}`}
                    actions={[
                      {
                        id: "edit",
                        label: t("common.edit"),
                        icon: Edit,
                        hidden: !can("edit"),
                        onClick: () =>
                          router.push(
                            `/dashboard/variants/edit/${variant._id || variant.id}`
                          ),
                      },
                      {
                        id: "delete",
                        label: t("common.delete"),
                        icon: Trash2,
                        tone: "danger",
                        hidden: !can("delete"),
                        onClick: () => setVariantToDelete(variant),
                      },
                    ]}
                  />
                ),
              },
            ]}
            minWidth={1000}
            maxHeight="calc(100vh - 240px)"
            loading={loading && variants.length === 0}
            loadingContent={<PageLoader />}
            emptyContent={
              <EmptyState
                className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))]"
                icon={Layers}
                title={t("sidebar.noVariants") || "No variants yet"}
                description={
                  t("sidebar.noVariantsDescription") ||
                  "Variants are created when you add products, or create one here"
                }
                actionButton={
                  can("create")
                    ? {
                        label: t("products.addVariant") || "Add variant",
                        icon: Plus,
                        onClick: () => router.push("/dashboard/variants/add"),
                      }
                    : undefined
                }
              />
            }
            rowProps={(variant) => ({
              className: "cursor-pointer",
              onClick: () =>
                router.push(
                  `/dashboard/variants/view/${variant._id || variant.id}`
                ),
            })}
          />
        </div>
      </div>

      {variantToDelete && (
        <div className="fixed inset-0 backdrop-blur-[2px] bg-black/10 flex items-center justify-center z-[9999]">
          <div className="bg-[rgb(var(--color-bg-primary))] rounded-2xl border border-[rgb(var(--color-border-primary))] shadow-2xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-[rgb(var(--color-border-primary))] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                    {t("products.deleteVariant") || "Delete variant"}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !isDeleting && setVariantToDelete(null)}
                className="p-2 rounded-lg hover:bg-[rgb(var(--color-bg-tertiary))]"
                disabled={isDeleting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-6">
                {t("products.variantDeleteConfirm") ||
                  "Are you sure you want to delete"}{" "}
                <span className="font-medium text-[rgb(var(--color-text-primary))]">
                  {variantDisplayLabel(variantToDelete)}
                </span>
                ?
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setVariantToDelete(null)}
                  disabled={isDeleting}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  variant="danger"
                  onClick={handleConfirmDelete}
                  loading={isDeleting}
                  leftIcon={Trash2}
                >
                  {t("common.delete")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VariantsPage;
