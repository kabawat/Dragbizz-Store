"use client";

import {
  BatchVariantCreateView,
  buildBatchVariantsPayload,
  createEmptyBatchVariant,
  validateBatchVariants,
} from "@dragorbit/features/variants";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useApiResponse } from "@/hooks/useApiResponse";
import {
  productService,
  supplierService,
  utilityService,
  variantService,
} from "@/service";
import { useAppSelector } from "@/store/hooks";

const AddVariantPage = () => {
  const { t } = useTranslation();
  useDashboardHeader(
    t("products.addVariantsTitle", "Add Variants (वेरिएंट्स जोड़ें)"),
    t(
      "products.addVariantsDescription",
      "Create up to 5 variants for a product with pricing, SKU, barcode and stock"
    )
  );

  const router = useRouter();
  const searchParams = useSearchParams();
  const queryProductId =
    searchParams?.get("productId") || searchParams?.get("product") || "";

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

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [suppliers, setSuppliers] = useState([]);

  const [variants, setVariants] = useState(() => [createEmptyBatchVariant(0)]);

  // Fetch store products for parent selection
  const fetchProducts = useCallback(async () => {
    if (!storeId) return;
    setProductsLoading(true);
    try {
      const res = await productService.getProducts({
        limit: 100,
        lightweight: true,
        store: storeId,
      });
      const list = res?.data?.products || res?.data?.data || res?.data || [];
      const safeList = Array.isArray(list) ? list : [];
      setProducts(safeList);

      if (queryProductId) {
        const found = safeList.find((p) => (p.id || p._id) === queryProductId);
        if (found) {
          setSelectedProduct(found);
          // Pre-populate base SKU/mrp in initial variant
          setVariants([
            createEmptyBatchVariant(0, {
              sku: found.sku,
              mrp: found.mrp,
              sellingPrice: found.sellingPrice,
            }),
          ]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch products for variant creation:", err);
    } finally {
      setProductsLoading(false);
    }
  }, [storeId, queryProductId]);

  // Fetch suppliers for optional stock supplier tagging
  const fetchSuppliers = useCallback(async () => {
    if (!storeId) return;
    try {
      const res = await supplierService.getSuppliers({
        limit: 100,
        lightweight: true,
        store: storeId,
      });
      const list = res?.data?.suppliers || res?.data?.data || res?.data || [];
      setSuppliers(Array.isArray(list) ? list : []);
    } catch {
      // Non-fatal
    }
  }, [storeId]);

  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
  }, [fetchProducts, fetchSuppliers]);

  const handleProductChange = (prod) => {
    setSelectedProduct(prod);
    clearFieldErrors();
    if (prod && typeof prod === "object") {
      setVariants((prev) =>
        prev.map((v, idx) => ({
          ...v,
          sku: v.sku || (prod.sku ? `${prod.sku}-V${idx + 1}` : ""),
          mrp: v.mrp || prod.mrp || "",
          sellingPrice: v.sellingPrice || prod.sellingPrice || "",
        }))
      );
    }
  };

  const handleUploadImages = async (files) => {
    if (!files || files.length === 0) return [];
    const urls = [];
    for (let i = 0; i < files.length; i++) {
      try {
        const { publicFileUrl } = await utilityService.uploadFile(
          files[i],
          "products"
        );
        if (publicFileUrl) {
          urls.push(publicFileUrl);
        }
      } catch (err) {
        console.error("Variant image upload failed:", err);
      }
    }
    return urls;
  };

  const handleSave = async () => {
    clearFieldErrors();

    const productId =
      selectedProduct?.id || selectedProduct?._id || queryProductId;
    const validation = validateBatchVariants({
      product: productId,
      variants,
    });

    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }

    const payload = buildBatchVariantsPayload({
      store: storeId,
      product: productId,
      variants,
    });

    const result = await execute(variantService.createVariant(payload), {
      message:
        t(
          "products.batchVariantsCreateSuccess",
          "Variants created successfully!"
        ) || "Variants created successfully!",
    });

    if (!result?.success) return;

    setTimeout(() => {
      if (queryProductId) {
        router.push(`/dashboard/products/${queryProductId}`);
      } else {
        router.push("/dashboard/variants");
      }
    }, 1000);
  };

  return (
    <div className="overflow-hidden min-h-screen pb-24 bg-[rgb(var(--color-bg-secondary)/0.3)]">
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-5 space-y-4">
        {/* Top Header */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-[rgb(var(--color-border-primary))]">
          <div className="flex items-center gap-3">
            <Link
              href={
                queryProductId
                  ? `/dashboard/products/${queryProductId}`
                  : "/dashboard/variants"
              }
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] bg-[rgb(var(--color-bg-primary))] hover:bg-[rgb(var(--color-bg-tertiary))] border border-[rgb(var(--color-border-primary))] shadow-2xs transition-all"
              title={t("products.back", "Back")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-[rgb(var(--color-text-primary))]">
                  {t("products.addVariantsTitle", "Add Variants (वेरिएंट्स जोड़ें)")}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                  {t("products.batchBadge", "Batch Add")}
                </span>
              </div>
              <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-0.5">
                {t(
                  "products.addVariantsDescription",
                  "Create up to 5 variants for a product with pricing, SKU, barcode and stock"
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Batch Variant Creation Form */}
        <div className="pt-2">
          <BatchVariantCreateView
            selectedProduct={selectedProduct}
            onProductChange={handleProductChange}
            products={products}
            productsLoading={productsLoading}
            lockProduct={Boolean(queryProductId && selectedProduct)}
            variants={variants}
            onChange={setVariants}
            errors={fieldErrors}
            disabled={loading}
            onUploadImages={handleUploadImages}
            suppliers={suppliers}
            t={t}
          />
        </div>

        {/* Bottom Floating Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-[rgb(var(--color-bg-primary))] border-t border-[rgb(var(--color-border-primary))] px-4 sm:px-6 py-3.5 shadow-lg">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <span className="text-xs text-[rgb(var(--color-text-secondary))] hidden sm:inline">
              {variants.length}{" "}
              {t("products.variantsReady", "variants ready to save")} (max 5)
            </span>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  if (queryProductId) {
                    router.push(`/dashboard/products/${queryProductId}`);
                  } else {
                    router.push("/dashboard/variants");
                  }
                }}
                disabled={loading}
              >
                {t("common.cancel", "Cancel")}
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={loading}
                loading={loading}
                leftIcon={Save}
              >
                {t(
                  "products.saveVariants",
                  `Save ${variants.length} Variant(s)`
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddVariantPage;
