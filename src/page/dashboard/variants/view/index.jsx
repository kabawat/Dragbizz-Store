"use client";

import { AlertTriangle, ArrowLeft, Edit, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { VariantForm } from "@/components/variant";
import { Button, PageLoader } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useApiResponse } from "@/hooks/useApiResponse";
import { productService, variantService } from "@/service";
import { useAppSelector } from "@/store/hooks";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import {
  getInitialVariantFormData,
  mapImageRecords,
  normalizeVariantRecord,
  unwrapVariantRecord,
  variantDisplayLabel,
} from "@/utils/variantForm";

const ViewVariantPage = ({ variantId }) => {
  const { t } = useTranslation();
  useDashboardHeader(
    t("products.viewVariant") || "View Variant",
    t("products.viewVariantDescription") || "Variant details"
  );
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId || "";
  const { can, loading: permissionsLoading } = useModulePermissions("product");
  const hasFetched = useRef(false);
  const [formData, setFormData] = useState(() =>
    getInitialVariantFormData(storeId)
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { execute: executeFetch, loading: fetching } = useApiResponse();
  const { execute: executeDelete, loading: isDeleting } = useApiResponse();

  useEffect(() => {
    if (!permissionsLoading && !can("read")) {
      router.push("/dashboard");
    }
  }, [can, permissionsLoading, router]);

  useEffect(() => {
    const load = async () => {
      if (!variantId || !storeId || hasFetched.current) return;
      hasFetched.current = true;
      const result = await executeFetch(
        variantService.getVariants({ store: storeId, id: variantId }),
        { showToast: false }
      );
      if (result?.success) {
        const record = unwrapVariantRecord(result.data);
        if (record) {
          const normalized = normalizeVariantRecord(record);
          try {
            const imagesRes = await productService.getProductImages({
              entityId: variantId,
              entityType: "Variant",
              store: storeId,
            });
            const imagesPayload =
              imagesRes?.data?.data ?? imagesRes?.data ?? imagesRes;
            normalized.images = mapImageRecords(imagesPayload);
          } catch {
            normalized.images = [];
          }
          setFormData(normalized);
        }
      }
    };
    load();
  }, [variantId, storeId, executeFetch]);

  const handleConfirmDelete = async () => {
    const result = await executeDelete(
      variantService.deleteVariant(variantId, storeId),
      {
        message:
          t("products.variantDeleteSuccess") || "Variant deleted successfully",
      }
    );
    if (result?.success) {
      setShowDeleteModal(false);
      router.push("/dashboard/variants");
    }
  };

  if (fetching && !formData.id) {
    return <PageLoader />;
  }

  return (
    <div className="overflow-hidden">
      <div className="max-w-8xl mx-auto w-full">
        <div className="p-5 w-full mx-auto flex items-center justify-between gap-4 flex-wrap">
          <Link
            href="/dashboard/variants"
            className="inline-flex items-center space-x-2 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-primary))] rounded-lg transition-all duration-200 border border-transparent hover:border-[rgb(var(--color-border-primary))]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">
              {t("products.backToVariants") || "Back to variants"}
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {can("edit") && (
              <Button
                variant="outline"
                leftIcon={Edit}
                onClick={() =>
                  router.push(`/dashboard/variants/edit/${variantId}`)
                }
              >
                {t("common.edit") || "Edit"}
              </Button>
            )}
            {can("delete") && (
              <Button
                variant="danger"
                leftIcon={Trash2}
                onClick={() => setShowDeleteModal(true)}
              >
                {t("common.delete") || "Delete"}
              </Button>
            )}
          </div>
        </div>

        <div className="h-[calc(100vh-180px)] overflow-y-auto px-5 pb-6">
          <VariantForm
            formData={formData}
            fieldErrors={{}}
            storeId={storeId}
            readOnly
            lockProduct
            variantId={variantId}
          />
        </div>
      </div>

      {showDeleteModal && (
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
                  <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                    {t("modals.deleteConfirmMessage") ||
                      "This action cannot be undone"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !isDeleting && setShowDeleteModal(false)}
                className="p-2 hover:bg-[rgb(var(--color-bg-tertiary))] rounded-lg"
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
                  {variantDisplayLabel(formData)}
                </span>
                ?
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
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

export default ViewVariantPage;
