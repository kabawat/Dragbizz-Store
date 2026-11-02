"use client";

import {
  buildUnifiedProductPayload,
  getInitialProductFormData,
  validateProductForm,
  validateVariants,
} from "@dragorbit/features/products";
import { ArrowLeft, Layers, Package, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProductForm } from "@/components/product";
import { Button } from "@/components/ui";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useApiResponse } from "@/hooks/useApiResponse";
import { productService } from "@/service";
import { useAppSelector } from "@/store/hooks";

const AddProductPage = () => {
  const { t } = useTranslation();

  useDashboardHeader(
    t("products.addNewProduct", "Add New Product"),
    t(
      "products.addNewProductDescription",
      "Create a new product for your store inventory"
    )
  );
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId || "";

  const { can, loading: permissionsLoading } = useModulePermissions("product");

  useEffect(() => {
    if (!permissionsLoading && !can("create")) {
      router.push("/dashboard/products");
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
    getInitialProductFormData(storeId)
  );
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState([]);

  useEffect(() => {
    if (storeId) {
      setFormData((prevData) => ({
        ...prevData,
        store: storeId,
      }));
    }
  }, [storeId]);

  const handleFormDataChange = (fieldName, value) => {
    if (typeof fieldName !== "string") {
      return;
    }

    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }

    setFormData((prevData) => {
      const newData = { ...prevData };
      const getNewValue = (current) =>
        typeof value === "function" ? value(current) : value;

      if (fieldName.includes(".")) {
        const [parent, child] = fieldName.split(".");
        if (!newData[parent]) {
          newData[parent] = {};
        }
        newData[parent] = {
          ...newData[parent],
          [child]: getNewValue(newData[parent][child]),
        };
      } else {
        newData[fieldName] = getNewValue(newData[fieldName]);
      }

      return newData;
    });
  };

  const handleHasVariantsChange = (enabled) => {
    setHasVariants(enabled);
    if (!enabled) {
      setVariants([]);
    }
  };

  const handleSaveAndPublish = async () => {
    clearFieldErrors();

    // Centralized Product Form Validation
    const validation = validateProductForm(formData, storeId);
    if (!validation.isValid) {
      setFieldErrors(validation.fields);
      return;
    }

    // Validate Variants if enabled
    if (hasVariants && variants.length > 0) {
      const variantValidation = validateVariants(variants, formData);
      if (!variantValidation.isValid) {
        setFieldErrors({
          variants: t("products.variantPriceError", variantValidation.error),
        });
        return;
      }
    }

    const payload = buildUnifiedProductPayload({
      formData: {
        ...formData,
        store: storeId,
      },
      variants,
      hasVariants,
    });

    const result = await execute(productService.createProduct(payload), {
      message: t("products.createSuccess", "Product created successfully!"),
    });

    if (!result?.success) return;

    setTimeout(() => {
      setFormData(getInitialProductFormData(storeId));
      setVariants([]);
      setHasVariants(false);
      clearFieldErrors();
      router.push("/dashboard/products");
    }, 1200);
  };

  const handleCancel = () => {
    router.push("/dashboard/products");
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-secondary)/0.3)] pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Top Header / Breadcrumb Card */}
        <div className="flex items-center justify-between gap-4 pb-4 mb-5 border-b border-[rgb(var(--color-border-primary))]">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/products"
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] bg-[rgb(var(--color-bg-primary))] hover:bg-[rgb(var(--color-bg-tertiary))] border border-[rgb(var(--color-border-primary))] shadow-2xs transition-all"
              title={t("products.backToProducts", "Back to Products")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-[rgb(var(--color-text-primary))]">
                  {t("products.addNewProduct", "Add New Product")}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  {t("products.newProductBadge", "Draft")}
                </span>
              </div>
              <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-0.5">
                {t(
                  "products.addNewProductSubtitle",
                  "Configure product details, pricing, media, and add variants one by one"
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Main Product Form */}
        <div>
          <ProductForm
            formData={formData}
            onChange={handleFormDataChange}
            fieldErrors={fieldErrors}
            storeId={storeId}
            productId={null}
            variants={variants}
            onVariantsChange={setVariants}
            hasVariants={hasVariants}
            onHasVariantsChange={handleHasVariantsChange}
            showVariants={true}
          />
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[rgb(var(--color-bg-primary)/0.95)] backdrop-blur-md border-t border-[rgb(var(--color-border-primary))] px-4 sm:px-8 py-3.5 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[rgb(var(--color-primary)/0.1)] text-[rgb(var(--color-primary))] flex items-center justify-center shrink-0">
              <Package className="w-4 h-4" />
            </div>
            <div className="min-w-0 truncate">
              <span className="block text-xs font-medium text-[rgb(var(--color-text-secondary))]">
                {t("products.creatingProduct", "Creating Product:")}
              </span>
              <span className="block text-sm font-bold text-[rgb(var(--color-text-primary))] truncate">
                {formData.name?.trim() ||
                  t("products.untitledProduct", "Untitled Product")}
              </span>
            </div>

            {hasVariants && variants.length > 0 && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[rgb(var(--color-primary)/0.1)] text-[rgb(var(--color-primary))] border border-[rgb(var(--color-primary)/0.2)] shrink-0 ml-2">
                <Layers className="w-3.5 h-3.5" />
                {variants.length}{" "}
                {variants.length === 1 ? "Variant" : "Variants"}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button variant="outline" onClick={handleCancel} disabled={loading}>
              {t("common.cancel", "Cancel")}
            </Button>
            <Button
              variant="success"
              onClick={handleSaveAndPublish}
              disabled={loading}
              loading={loading}
              leftIcon={Save}
              className="shadow-sm"
            >
              {t("products.saveAndPublish", "Save & Publish")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductPage;
