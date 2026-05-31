"use client";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// Import components
import {
  ProductAddSuccessModal,
  ProductForm,
  ProductInfoModal,
} from "@/components/product";
import { Button } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useApiResponse } from "@/hooks/useApiResponse";
import { productService } from "@/service";
import { useAppSelector } from "@/store/hooks";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";

const UpdateProductPage = ({ productId }) => {
  const { t } = useTranslation();

  useDashboardHeader(t("products.editProduct"), t("products.editProductDescription"));
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

  const [showInfoModal, setShowInfoModal] = useState(false);
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
      gstCategory: "TAXABLE",
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
            gstCategory: product?.gstInfo?.gstCategory || "TAXABLE",
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
  }, [productId, storeId, executeFetch, t]);

  // Update store ID when selectedStore changes
  useEffect(() => {
    if (selectedStore?.storeId) {
      setFormData((prevData) => ({
        ...prevData,
        store: selectedStore.storeId,
      }));
    }
  }, [selectedStore]);

  // Handle form data changes
  const handleFormDataChange = (fieldName, value) => {
    if (typeof fieldName !== "string") return;

    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }

    setFormData((prevData) => {
      const newData = { ...prevData };
      const getNewValue = (current) => typeof value === 'function' ? value(current) : value;

      if (fieldName.includes(".")) {
        const [parent, child] = fieldName.split(".");
        if (!newData[parent]) newData[parent] = {};
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

  // Handle save and update
  const handleSaveAndUpdate = async () => {
    setFieldErrors({});

    const mrp = parseFloat(formData.mrp) || 0;
    const sellingPrice = parseFloat(formData.sellingPrice) || 0;
    let discountPercentage = "0";

    if (mrp > 0 && sellingPrice > 0 && mrp > sellingPrice) {
      discountPercentage = String(
        Math.round(((mrp - sellingPrice) / mrp) * 100 * 100) / 100
      );
    }

    const sanitizedImages = (formData.images || [])
      .map(img => {
        if (typeof img === "string") return img;
        if (img instanceof File) return img.uploadedUrl;
        if (img && typeof img === "object" && img.url) return img.url;
        return null;
      })
      .filter(Boolean);

    const updateData = {
      ...formData,
      images: sanitizedImages,
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
      router.push("/dashboard/products");
    }
  };

  // Handle cancel
  const handleCancel = () => {
    router.push("/dashboard/products");
  };

  // Loading state
  if (initialLoading || permissionsLoading) {
    return (
      <div className="p-6">
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
    );
  }

  // Product not found state
  if (productNotFound) {
    return (
      <div className="p-6">
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
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="max-w-8xl mx-auto w-full">
        <div className="p-5 w-full mx-auto">
          <Link
            href="/dashboard/products"
            className="inline-flex items-center space-x-2 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-primary))] rounded-lg transition-all duration-200 border border-transparent hover:border-[rgb(var(--color-border-primary))]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">
              {t("products.backToProducts")}
            </span>
          </Link>
        </div>

        <div className="overflow-hidden">
          <div className="h-[calc(100vh-210px)] overflow-y-auto px-5">
            <ProductForm
              formData={formData}
              onChange={handleFormDataChange}
              fieldErrors={fieldErrors}
              storeId={storeId}
              productId={productId}
            />
          </div>

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
                  onClick={handleSaveAndUpdate}
                  disabled={loading}
                  loading={loading}
                  leftIcon={Save}
                >
                  {t("products.updateProduct")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Modal */}
      <ProductInfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
      />
    </div>
  );
};

export default UpdateProductPage;
