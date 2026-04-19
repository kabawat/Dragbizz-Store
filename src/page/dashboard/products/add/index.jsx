"use client";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/dashboard/header";
// Import components
import Sidebar from "@/components/dashboard/sidebar";
import { ProductForm } from "@/components/product";
import { Button } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useApiResponse } from "@/hooks/useApiResponse";
import { productService } from "@/service";
import { useAppSelector } from "@/store/hooks";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import logger from "@/utils/logger";

const AddProductPage = () => {
  const { t } = useTranslation();
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
    brand: "",
    category: "",
    barcode: "",
    images: [],
    basePrice: "",

    mrp: "",
    sellingPrice: "",
    currency: "INR",
    uom: "PCS",
    gstInfo: {
      gstRate: "",
      gstType: "CGST_SGST",
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

  // Update store ID when selectedStore changes
  useEffect(() => {
    if (storeId) {
      setFormData((prevData) => ({
        ...prevData,
        store: storeId,
      }));
    }
  }, [storeId]);

  // Handle form data changes
  const handleFormDataChange = (fieldName, value) => {
    // Ensure fieldName is a string
    if (typeof fieldName !== "string") {
      return;
    }

    // Clear error for this field when user starts typing
    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }

    setFormData((prevData) => {
      const newData = { ...prevData };

      // Helper function to resolve the new value if it's a function
      const getNewValue = (current) => typeof value === 'function' ? value(current) : value;

      // Handle nested fields (e.g., 'content.specifications', 'gstInfo.gstRate')
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
        // Handle top-level fields
        newData[fieldName] = getNewValue(newData[fieldName]);
      }

      return newData;
    });
  };

  // Handle save and publish
  const handleSaveAndPublish = async () => {
    clearFieldErrors();

    // Sanitize images array: extract uploadedUrl from File objects or use string URLs
    const sanitizedImages = (formData.images || [])
      .map(img => {
        if (typeof img === "string") return img;
        if (img instanceof File) return img.uploadedUrl;
        return null;
      })
      .filter(Boolean);

    const payload = { 
      ...formData,
      images: sanitizedImages
    };
    
    const mrp = parseFloat(payload.mrp) || 0;
    const sellingPrice = parseFloat(payload.sellingPrice) || 0;

    if (mrp > 0 && sellingPrice > 0 && mrp > sellingPrice) {
      const discountPercentage =
        Math.round(((mrp - sellingPrice) / mrp) * 100 * 100) / 100;
      payload.discount = String(discountPercentage);
    } else if (payload.discount) {
      payload.discount = String(payload.discount);
    } else {
      payload.discount = "0";
    }

    const result = await execute(
      productService.createProduct(payload),
      { message: t("products.createSuccess") }
    );

    if (result?.success) {
      setTimeout(() => {
        setFormData(getInitialFormData());
        clearFieldErrors();
        router.push("/dashboard/products");
      }, 1500);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    router.push("/dashboard/products");
  };


  return (
    <div className="flex h-screen relative overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 min-h-screen flex flex-col">
        {/* Header */}
        <Header
          title={t("products.addNewProduct")}
          description={t("products.addNewProductDescription")}
        />

        {permissionsLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[rgb(var(--color-text-secondary))] animate-pulse font-medium">{t("common.loadingData")}</p>
          </div>
        ) : (
          <div className="flex-1 p-6">
            <div className="max-w-8xl mx-auto">
              <div className="mb-6 flex items-center justify-between">
                <Link
                  href="/dashboard/products"
                  className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {t("products.backToProducts")}
                  </span>
                </Link>
              </div>

              <div className="overflow-hidden">
                <div className="h-[calc(100vh-210px)] overflow-y-auto pe-3">
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
                      <Button variant="outline" onClick={handleCancel} disabled={loading} >
                        {t("common.cancel")}
                      </Button>
                      <Button variant="success" onClick={handleSaveAndPublish} disabled={loading} loading={loading} leftIcon={Save} >
                        {t("products.saveAndPublish")}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default AddProductPage;
