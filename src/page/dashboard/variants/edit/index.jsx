"use client";

import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { VariantForm } from "@/components/variant";
import { Button, PageLoader } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useApiResponse } from "@/hooks/useApiResponse";
import { variantService } from "@/service";
import { useAppSelector } from "@/store/hooks";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import {
  buildVariantPayload,
  getInitialVariantFormData,
  normalizeVariantRecord,
  unwrapVariantRecord,
  validateVariantForm,
} from "@/utils/variantForm";

const EditVariantPage = ({ variantId }) => {
  const { t } = useTranslation();
  useDashboardHeader(
    t("products.editVariant") || "Edit Variant",
    t("products.editVariantDescription") || "Update variant details"
  );
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId || "";
  const { can, loading: permissionsLoading } = useModulePermissions("product");
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!permissionsLoading && !can("edit")) {
      router.push("/dashboard/variants");
    }
  }, [can, permissionsLoading, router]);

  const {
    execute,
    loading,
    fieldErrors,
    setFieldErrors,
    clearAll: clearFieldErrors,
  } = useApiResponse();
  const { execute: executeFetch, loading: fetching } = useApiResponse();

  const [formData, setFormData] = useState(() =>
    getInitialVariantFormData(storeId)
  );

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
          setFormData(normalizeVariantRecord(record));
        }
      }
    };
    load();
  }, [variantId, storeId, executeFetch]);

  const handleFormDataChange = (fieldName, value) => {
    if (typeof fieldName !== "string") return;

    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }

    setFormData((prev) => {
      const next = { ...prev };
      const getNewValue = (current) =>
        typeof value === "function" ? value(current) : value;

      if (fieldName.includes(".")) {
        const [parent, child] = fieldName.split(".");
        next[parent] = {
          ...(next[parent] || {}),
          [child]: getNewValue(next[parent]?.[child]),
        };
      } else {
        next[fieldName] = getNewValue(next[fieldName]);
      }
      return next;
    });
  };

  const handleSave = async () => {
    clearFieldErrors();
    const localErrors = validateVariantForm(formData, { requireProduct: false });
    if (Object.keys(localErrors).length) {
      setFieldErrors(localErrors);
      return;
    }

    const payload = buildVariantPayload(formData, { includeProduct: false });
    const result = await execute(
      variantService.updateVariant(variantId, payload, storeId),
      {
        message:
          t("products.variantUpdateSuccess") || "Variant updated successfully",
      }
    );

    if (!result?.success) return;

    setTimeout(() => {
      router.push(`/dashboard/variants/view/${variantId}`);
    }, 800);
  };

  if (fetching && !formData.id) {
    return <PageLoader />;
  }

  return (
    <div className="overflow-hidden">
      <div className="max-w-8xl mx-auto w-full">
        <div className="p-5 w-full mx-auto">
          <Link
            href={`/dashboard/variants/view/${variantId}`}
            className="inline-flex items-center space-x-2 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-primary))] rounded-lg transition-all duration-200 border border-transparent hover:border-[rgb(var(--color-border-primary))]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">
              {t("products.backToVariant") || "Back to variant"}
            </span>
          </Link>
        </div>

        <div className="overflow-hidden">
          <div className="h-[calc(100vh-210px)] overflow-y-auto px-5">
            <VariantForm
              formData={formData}
              onChange={handleFormDataChange}
              fieldErrors={fieldErrors}
              storeId={storeId}
              lockProduct
            />
          </div>

          <div className="bg-[rgb(var(--color-bg-tertiary))] border-t border-[rgb(var(--color-border-primary))] px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 ml-auto">
                <Button
                  variant="outline"
                  onClick={() =>
                    router.push(`/dashboard/variants/view/${variantId}`)
                  }
                  disabled={loading}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  variant="success"
                  onClick={handleSave}
                  disabled={loading}
                  loading={loading}
                  leftIcon={Save}
                >
                  {t("products.updateVariant") || "Update variant"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditVariantPage;
