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
import { fromProductForm, normalizeProductRecord, toProductForm } from "@/utils/productUtils";

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
    sku: "",
    barcode: "",
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
        const product = normalizeProductRecord(result.data);
        setFormData(toProductForm(product, storeId));
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

    const updateData = fromProductForm({
      ...formData,
      store: storeId,
    });

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
