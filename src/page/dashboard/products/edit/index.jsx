"use client";
import { ArrowLeft, Info, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/dashboard/header";
// Import components
import Sidebar from "@/components/dashboard/sidebar";
import {
  ProductAddSuccessModal,
  ProductForm,
  ProductInfoModal,
} from "@/components/product";
import { Button } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useApiResponse } from "@/hooks/useApiResponse";
import { productService } from "@/service";
import { useAppSelector } from "@/store/hooks";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";

const UpdateProductPage = ({ productId }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;

  const { can, loading: permissionsLoading } = useModulePermissions("product");

  useEffect(() => {
    if (!permissionsLoading && !can("edit")) {
      router.push("/dashboard/products");
    }
  }, [can, permissionsLoading, router]);

  // Separate hooks: one for fetching, one for saving
  const { execute: executeFetch, loading: initialLoading } = useApiResponse();
  const {
    execute: executeSave,
    loading,
    fieldErrors,
    setFieldErrors,
  } = useApiResponse();

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [updatedProductName, setUpdatedProductName] = useState("");
  const [productNotFound, setProductNotFound] = useState(false);

  // Initial form data
  const getInitialFormData = () => ({
    store: storeId,
    name: "",
    brand: "",
    category: "",
    basePrice: "",
    mrp: "",
    sellingPrice: "",
    discount: "",
    currency: "",
    uom: "",
    images: [],
    status: "",

    showInCatalog: true,
    featured: false,
    bestSeller: false,
    newArrival: false,
    stockQuantity: 0,
    gstInfo: {
      gstRate: "",
      gstType: "CGST_SGST",
      hsnCode: "",
      isGstIncluded: true,
    },
    content: {
      shortDescription: "",
      longDescription: "",
      tags: [],
      specifications: [],
      features: [],
    },
  });

  const [formData, setFormData] = useState(getInitialFormData());

  // Fetch product data on component mount
  useEffect(() => {
    const fetchProductData = async () => {
      const result = await executeFetch(
        productService.getProducts({ store: storeId, id: productId }),
        { showToast: false }
      );

      if (result?.success) {
        const product = result.data;

        // Transform API data to form data structure based on the actual response format
        const transformedData = {
          store: storeId,
          name: product?.name || "",
          brand: product?.brand || "",
          category: product?.category?._id || product?.category?.id || (typeof product?.category === "string" ? product?.category : "") || "",
          barcode: product?.barcode || "",
          sku: product?.sku || "",
          // Pricing data - directly from API response
          basePrice: product?.basePrice || "",
          mrp: product?.mrp || "",
          sellingPrice: product?.sellingPrice || "",
          discount: product?.discount || "",
          currency: product?.currency || "",
          uom: product?.uom || "",
          images: Array.isArray(product?.images) ? product.images : (product?.image ? [product.image] : []),
          // Status and catalog
          status: product?.status || "",

          showInCatalog: product?.showInCatalog !== false,
          featured: product?.featured || false,
          bestSeller: product?.bestSeller || false,
          newArrival: product?.newArrival || false,
          stockQuantity: product?.stockQuantity || 0,
          // GST info from nested gstInfo object
          gstInfo: {
            isGstIncluded: product?.gstInfo?.isGstIncluded !== undefined ? product?.gstInfo?.isGstIncluded : (product?.gstInfo?.isGstApplicable || false),
            gstRate: product?.gstInfo?.gstRate || "",
            gstType: product?.gstInfo?.gstType || "CGST_SGST",
            hsnCode: product?.gstInfo?.hsnCode || "",
          },
          // Content data from nested content object
          content: {
            shortDescription: product?.content?.shortDescription || "",
            longDescription: product?.content?.longDescription || "",
            tags: product?.content?.tags || [],
            specifications: product?.content?.specifications || [],
            features: product?.features || [],
          },
        };

        setFormData(transformedData);
      } else {
        setProductNotFound(true);
      }
    };

    if (productId && storeId) {
      fetchProductData();
    }
  }, [productId, storeId, executeFetch]);

  // Update store ID when selectedStore changes
  useEffect(() => {
    const currentStoreId =
      selectedStore?.storeId;
    if (currentStoreId) {
      setFormData((prevData) => ({
        ...prevData,
        store: currentStoreId,
      }));
    }
  }, [selectedStore]);

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

  // Handle save and update
  const handleSaveAndUpdate = async () => {
    setFieldErrors({});

    // Calculate discount percentage based on MRP and sellingPrice
    const mrp = parseFloat(formData.mrp) || 0;
    const sellingPrice = parseFloat(formData.sellingPrice) || 0;
    let discountPercentage = "0";

    if (mrp > 0 && sellingPrice > 0 && mrp > sellingPrice) {
      discountPercentage = String(
        Math.round(((mrp - sellingPrice) / mrp) * 100 * 100) / 100
      );
    }

    const updateData = {
      ...formData,
      pricing: {
        basePrice: formData.basePrice,
        mrp: formData.mrp,
        sellingPrice: formData.sellingPrice,
        discount: discountPercentage,
        currency: formData.currency,
        uom: formData.uom,
      },
    };

    const result = await executeSave(
      productService.updateProduct(productId, updateData, storeId),
      { message: t("products.updateSuccess") }
    );

    if (result?.success) {
      setUpdatedProductName(formData.name || "Product");
      setShowSuccessModal(true);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    router.push("/dashboard/products");
  };

  // Success modal handlers
  const handleContinue = () => {
    setShowSuccessModal(false);
    router.push("/dashboard/products");
  };

  // Loading state
  if (initialLoading || permissionsLoading) {
    return (
      <div className="flex h-screen relative overflow-hidden">
        <Sidebar />

        <div className="flex-1 min-h-screen flex flex-col">
          <Header />

          <div className="flex-1 p-6">
            <div className="max-w-8xl mx-auto">
              <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-8 mb-6">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-16 h-16 text-[rgb(var(--color-primary))] animate-spin mx-auto mb-4" />
                    <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                      Loading Product...
                    </h2>
                    <p className="text-[rgb(var(--color-text-secondary))]">
                      {t("common.pleaseWaitWhileWeFetch", {
                        item: t("common.product"),
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Product not found state

  if (productNotFound) {
    return (
      <div className="flex h-screen relative overflow-hidden">
        <Sidebar />

        <div className="flex-1 min-h-screen flex flex-col">
          <Header />
          <div className="flex-1 p-6">
            <div className="max-w-8xl mx-auto">
              <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-8 mb-6">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                      {t("modals.notFound", { item: t("common.product") })}
                    </h2>
                    <p className="text-[rgb(var(--color-text-secondary))] mb-4">
                      {t("modals.notFound", { item: t("common.product") })}
                    </p>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      leftIcon={ArrowLeft}
                    >
                      {t("common.backTo", { item: t("common.products") })}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen relative overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 min-h-screen flex flex-col">
        {/* Header */}
        <Header title={t("products.editProduct")} description={t("products.editProductDescription")} />

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-8xl mx-auto">
            {/* Back Button */}
            <div className="mb-6">
              <Link href="/dashboard/products" className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Products</span>
              </Link>
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

              {/* Fixed Action Bar */}
              <div className="bg-[rgb(var(--color-bg-tertiary))] border-t border-[rgb(var(--color-border-primary))] px-6 py-3">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setShowInfoModal(true)}
                    leftIcon={Info}
                    className="text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]"
                  >
                    Info
                  </Button>

                  <div className="flex items-center space-x-3">
                    <Button variant="outline" onClick={handleCancel} disabled={loading} >
                      Cancel
                    </Button>
                    <Button variant="success" onClick={() => handleSaveAndUpdate(formData)} disabled={loading} loading={loading} leftIcon={Save} >
                      Update Product
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <ProductAddSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onContinue={handleContinue}
        productName={updatedProductName}
        title={t("products.updateSuccess")}
        continueText={t("products.backToProducts")}
      />

      {/* Info Modal */}
      <ProductInfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
      />
    </div>
  );
};

export default UpdateProductPage;
