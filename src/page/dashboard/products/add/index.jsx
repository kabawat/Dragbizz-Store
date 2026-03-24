"use client";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/dashboard/header";
// Import components
import Sidebar from "@/components/dashboard/sidebar";
import { AIProductExtract, ProductForm } from "@/components/product";
import { AIButton, Button } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useApiResponse } from "@/hooks/useApiResponse";
import { productService } from "@/service";
import { useAppSelector } from "@/store/hooks";
import logger from "@/utils/logger";

const AddProductPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId || "";

  const [showAIModal, setShowAIModal] = useState(false);
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
    openingStock: {
      quantity: 0,
      purchasePrice: 0,
      supplier: "",
      expiryDate: "",
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

      // Handle nested fields (e.g., 'content.specifications', 'gstInfo.gstRate')
      if (fieldName.includes(".")) {
        const [parent, child] = fieldName.split(".");
        if (!newData[parent]) {
          newData[parent] = {};
        }
        newData[parent] = {
          ...newData[parent],
          [child]: value,
        };
      } else {
        // Handle top-level fields
        newData[fieldName] = value;
      }

      return newData;
    });
  };

  // Handle save and publish
  const handleSaveAndPublish = async () => {
    clearFieldErrors();

    // Calculate discount percentage based on MRP and sellingPrice
    const payload = { ...formData };
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

  // Handle AI extraction success - Pre-fill form with extracted data
  const handleAIExtractSuccess = (extractedData) => {
    if (!extractedData) return;

    try {
      const updatedFormData = { ...formData };

      // Map extracted data to form fields
      // Basic fields
      if (extractedData.name) updatedFormData.name = extractedData.name;
      if (extractedData.brand) updatedFormData.brand = extractedData.brand;
      if (extractedData.category)
        updatedFormData.category = extractedData.category;
      if (extractedData.subcategory)
        updatedFormData.subcategory = extractedData.subcategory;
      if (extractedData.barcode)
        updatedFormData.barcode = extractedData.barcode;
      if (extractedData.sku) updatedFormData.sku = extractedData.sku;

      // Pricing fields
      if (extractedData.mrp !== undefined && extractedData.mrp !== null) {
        updatedFormData.mrp = String(extractedData.mrp);
      }
      if (
        extractedData.sellingPrice !== undefined &&
        extractedData.sellingPrice !== null
      ) {
        updatedFormData.sellingPrice = String(extractedData.sellingPrice);
      }
      if (
        extractedData.basePrice !== undefined &&
        extractedData.basePrice !== null
      ) {
        updatedFormData.basePrice = String(extractedData.basePrice);
      }
      if (
        extractedData.discount !== undefined &&
        extractedData.discount !== null
      ) {
        updatedFormData.discount = String(extractedData.discount);
      }
      if (extractedData.currency)
        updatedFormData.currency = extractedData.currency;
      if (extractedData.uom) updatedFormData.uom = extractedData.uom;

      // GST Info
      if (extractedData.gstInfo) {
        updatedFormData.gstInfo = {
          ...updatedFormData.gstInfo,
          isGstIncluded:
            extractedData.gstInfo.isGstIncluded !== undefined
              ? extractedData.gstInfo.isGstIncluded
              : (extractedData.isGstIncluded !== undefined ? extractedData.isGstIncluded : updatedFormData.gstInfo.isGstIncluded),
          gstRate:
            extractedData.gstInfo.gstRate !== undefined &&
              extractedData.gstInfo.gstRate !== null
              ? String(extractedData.gstInfo.gstRate)
              : updatedFormData.gstInfo.gstRate,
          gstType:
            extractedData.gstInfo.gstType || updatedFormData.gstInfo.gstType,
          hsnCode:
            extractedData.gstInfo.hsnCode || updatedFormData.gstInfo.hsnCode,
          sacCode:
            extractedData.gstInfo.sacCode || updatedFormData.gstInfo.sacCode,
          cessRate:
            extractedData.gstInfo.cessRate !== undefined &&
              extractedData.gstInfo.cessRate !== null
              ? String(extractedData.gstInfo.cessRate)
              : updatedFormData.gstInfo.cessRate,
        };
      }

      // Content fields
      if (extractedData.content) {
        updatedFormData.content = {
          ...updatedFormData.content,
          shortDescription:
            extractedData.content.shortDescription ||
            updatedFormData.content.shortDescription,
          longDescription:
            extractedData.content.longDescription ||
            updatedFormData.content.longDescription,
          tags:
            extractedData.content.tags &&
              Array.isArray(extractedData.content.tags)
              ? [
                ...(updatedFormData.content.tags || []),
                ...extractedData.content.tags,
              ].filter((tag, index, self) => self.indexOf(tag) === index)
              : updatedFormData.content.tags,
          features:
            extractedData.content.features &&
              Array.isArray(extractedData.content.features)
              ? [
                ...(updatedFormData.content.features || []),
                ...extractedData.content.features,
              ].filter(
                (feature, index, self) => self.indexOf(feature) === index
              )
              : updatedFormData.content.features,
          specifications:
            extractedData.content.specifications &&
              Array.isArray(extractedData.content.specifications)
              ? [
                ...(updatedFormData.content.specifications || []),
                ...extractedData.content.specifications,
              ]
              : updatedFormData.content.specifications,
        };
      }

      // Update form data
      setFormData(updatedFormData);
      setShowAIModal(false);
      showSuccess(t("products.aiExtractSuccess"));
    } catch (error) {
      logger.error("Error pre-filling form:", error);
      showError(t("products.aiExtractError"));
    }
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

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-8xl mx-auto">
            {/* Back Button with Quota Progress Bar and AI Button */}
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
              <div className="flex items-center space-x-3">
                <AIButton onClick={() => setShowAIModal(true)} size="sm">
                  {t("products.aiExtract")}
                </AIButton>
              </div>
            </div>

            {/* Form Container - Scrollable */}
            <div className="overflow-hidden">
              <div className="h-[calc(100vh-210px)] overflow-y-auto pe-3">
                <ProductForm
                  formData={formData}
                  onChange={handleFormDataChange}
                  fieldErrors={fieldErrors}
                  storeId={storeId}
                />
              </div>

              {/* Fixed Action Bar - Only show when store is loaded and available */}
              <div className="bg-[rgb(var(--color-bg-tertiary))] border-t border-[rgb(var(--color-border-primary))] px-6 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 ml-auto">
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={loading}
                    >
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
      </div>

      {/* AI Product Extract Modal */}
      {showAIModal && (
        <AIProductExtract
          storeId={storeId}
          onExtractSuccess={handleAIExtractSuccess}
          onCancel={() => setShowAIModal(false)}
        />
      )}
    </div>
  );
};

export default AddProductPage;
