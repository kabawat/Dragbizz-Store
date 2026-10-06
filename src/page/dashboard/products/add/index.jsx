"use client";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProductForm } from "@/components/product";
import { Button } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useApiResponse } from "@/hooks/useApiResponse";
import { productService, variantService } from "@/service";
import { useAppSelector } from "@/store/hooks";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import {
  extractProductIdFromCreateResponse,
  splitProductAndVariantPayload,
} from "@/utils/productUtils";

const AddProductPage = () => {
  const { t } = useTranslation();

  useDashboardHeader(t("products.addNewProduct"), t("products.addNewProductDescription"));
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

  const getInitialFormData = () => ({
    store: storeId,
    name: "",
    brandId: "",
    category: "",
    sku: "",
    barcode: "",
    images: [],
    basePrice: "",
    mrp: "",
    sellingPrice: "",
    currency: "INR",
    uom: "PCS",
    productType: "GOODS",
    gstInfo: {
      hsnCode: "",
      isGstIncluded: true,
    },
    content: {
      shortDescription: "",
      tags: [],
      features: [],
      specifications: [],
    },
    showInCatalog: true,
  });

  const [formData, setFormData] = useState(getInitialFormData());

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
      const getNewValue = (current) => (typeof value === "function" ? value(current) : value);

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

  const handleSaveAndPublish = async () => {
    clearFieldErrors();

    const { productPayload, variantPayload } = splitProductAndVariantPayload({
      ...formData,
      store: storeId,
    });

    const result = await execute(productService.createProduct(productPayload), {
      message: t("products.createSuccess"),
    });

    if (!result?.success) return;

    const productId = extractProductIdFromCreateResponse(result.data);
    if (productId) {
      await execute(
        variantService.createVariant({
          ...variantPayload,
          product: productId,
        }),
        { showToast: false },
      );
    }

    setTimeout(() => {
      setFormData(getInitialFormData());
      clearFieldErrors();
      router.push("/dashboard/products");
    }, 1500);
  };

  const handleCancel = () => {
    router.push("/dashboard/products");
  };

  return (
    <div className="overflow-hidden">
      <div className="max-w-8xl mx-auto w-full">
        <div className="p-5 w-full mx-auto">
          <Link
            href="/dashboard/products"
            className="inline-flex items-center space-x-2 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-primary))] rounded-lg transition-all duration-200 border border-transparent hover:border-[rgb(var(--color-border-primary))]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">{t("products.backToProducts")}</span>
          </Link>
        </div>

        <div className="overflow-hidden">
          <div className="h-[calc(100vh-210px)] overflow-y-auto px-5">
            <ProductForm
              formData={formData}
              onChange={handleFormDataChange}
              fieldErrors={fieldErrors}
              storeId={storeId}
              productId={null}
            />
          </div>

          <div className="bg-[rgb(var(--color-bg-tertiary))] border-t border-[rgb(var(--color-border-primary))] px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 ml-auto">
                <Button variant="outline" onClick={handleCancel} disabled={loading}>
                  {t("common.cancel")}
                </Button>
                <Button
                  variant="success"
                  onClick={handleSaveAndPublish}
                  disabled={loading}
                  loading={loading}
                  leftIcon={Save}
                >
                  {t("products.saveAndPublish")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductPage;
