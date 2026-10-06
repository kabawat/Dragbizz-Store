"use client";

import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { VariantForm } from "@/components/variant";
import { Button } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useApiResponse } from "@/hooks/useApiResponse";
import { variantService } from "@/service";
import { useAppSelector } from "@/store/hooks";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import {
  buildVariantPayload,
  getInitialVariantFormData,
  validateVariantForm,
} from "@/utils/variantForm";

const AddVariantPage = () => {
  const { t } = useTranslation();
  useDashboardHeader(
    t("products.addVariant") || "Add Variant",
    t("products.addVariantDescription") || "Create a new product variant"
  );
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId || "";
  const { can, loading: permissionsLoading } = useModulePermissions("product");

  useEffect(() => {
    if (!permissionsLoading && !can("create")) {
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

  const [formData, setFormData] = useState(() =>
    getInitialVariantFormData(storeId)
  );

  useEffect(() => {
    if (storeId) {
      setFormData((prev) => ({ ...prev, store: storeId }));
    }
  }, [storeId]);

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
    const localErrors = validateVariantForm(formData, { requireProduct: true });
    if (Object.keys(localErrors).length) {
      setFieldErrors(localErrors);
      return;
    }

    const payload = {
      ...buildVariantPayload(formData, { includeProduct: true }),
      store: storeId,
    };

    const result = await execute(variantService.createVariant(payload), {
      message: t("products.variantCreateSuccess") || "Variant created successfully",
    });

    if (!result?.success) return;

    setTimeout(() => {
      router.push("/dashboard/variants");
    }, 800);
  };

  return (
    <div className="overflow-hidden">
      <div className="max-w-8xl mx-auto w-full">
        <div className="px-5 pt-4 pb-2 flex items-center justify-between gap-4 flex-wrap">
          <Link
            href="/dashboard/variants"
            className="inline-flex items-center gap-2 py-2 px-2 -ml-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-primary))] rounded-lg transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">
              {t("products.backToVariants") || "Back to variants"}
            </span>
          </Link>
        </div>

        <div className="px-5 pb-3">
          <h1 className="text-xl font-semibold text-[rgb(var(--color-text-primary))]">
            {t("products.addVariant") || "Add Variant"}
          </h1>
          <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1 max-w-2xl">
            {t("products.addVariantDescription") ||
              "Create a sellable SKU with its own price, barcode and options"}
          </p>
        </div>

        <div className="overflow-hidden">
          <div className="h-[calc(100vh-230px)] overflow-y-auto px-5 pb-4">
            <VariantForm
              formData={formData}
              onChange={handleFormDataChange}
              fieldErrors={fieldErrors}
              storeId={storeId}
            />
          </div>

          <div className="bg-[rgb(var(--color-bg-tertiary))] border-t border-[rgb(var(--color-border-primary))] px-5 sm:px-6 py-3">
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/variants")}
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
                {t("products.saveVariant") || "Save variant"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddVariantPage;
