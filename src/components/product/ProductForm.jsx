"use client";

import { Eye, IndianRupee, Package } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import useApiResponse from "@/hooks/useApiResponse";

import { utilityService } from "@/service";
import { brandService, categoryService } from "@/service/retailer";
import AdditionalDetailsSection from "./AdditionalDetailsSection";
import BasicInfoSection from "./BasicInfoSection";
import PricingGSTSection from "./PricingGSTSection";
import SortableSection from "./SortableSection";
import VariantsSection from "./VariantsSection";

const ProductSectionInfoModal = dynamic(
  () => import("./ProductSectionInfoModal"),
  { ssr: false }
);
const CategoryDrawer = dynamic(() => import("./CategoryDrawer"), {
  ssr: false,
});
const BrandDrawer = dynamic(() => import("./BrandDrawer"), { ssr: false });

const ProductForm = ({
  formData = {},
  onChange = () => {},
  fieldErrors = {},
  storeId = null,
  productId = null,
  className = "",
  variants = [],
  onVariantsChange = () => {},
  hasVariants = false,
  onHasVariantsChange = () => {},
  showVariants = true,
}) => {
  const { t } = useTranslation();

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [currentInfoSection, setCurrentInfoSection] = useState(null);
  const [showAddCategoryDrawer, setShowAddCategoryDrawer] = useState(false);
  const [showAddBrandDrawer, setShowAddBrandDrawer] = useState(false);
  const [apiCategories, setApiCategories] = useState([]);
  const [apiBrands, setApiBrands] = useState([]);

  const { execute: executeGetCategories, loading: categoriesLoading } =
    useApiResponse();
  const { execute: executeGetBrands, loading: brandsLoading } =
    useApiResponse();

  const sectionInfo = {
    basic: {
      title: t("products.basicInformation", "Basic Information"),
      description: t(
        "products.basicInformationDescription",
        "Essential information required to identify and categorize the product in your store."
      ),
      details: [
        t(
          "products.basicInfoDetail1",
          "Product name as displayed to customers"
        ),
        t(
          "products.basicInfoDetail2",
          "Brand name and category classification"
        ),
        t("products.basicInfoDetail3", "Unique SKU (Stock Keeping Unit)"),
        t("products.basicInfoDetail4", "Barcode for scanning at POS"),
      ],
      tips: t(
        "products.basicInfoTips",
        "Keep product names concise and informative for quick POS search."
      ),
    },
    media: {
      title: t("products.media", "Media & Images"),
      description: t(
        "products.mediaDescription",
        "Visual representation of your product for the digital catalog."
      ),
      details: [
        t("products.mediaDetail1", "Product cover image"),
        t("products.mediaDetail2", "Supports JPG, PNG, WebP"),
        t("products.mediaDetail3", "Recommended size: 1000x1000px"),
      ],
      tips: t(
        "products.mediaTips",
        "Bright, clear images on a clean background convert best."
      ),
    },
    "pricing-gst": {
      title: t("products.pricingInformation", "Pricing & Taxes"),
      description: t(
        "products.pricingInformationDescription",
        "Pricing, discount structure, and GST tax configuration."
      ),
      details: [
        t("products.pricingInfoDetail1", "MRP and customer Selling Price"),
        t("products.pricingInfoDetail2", "Auto-calculated customer savings"),
        t("products.pricingInfoDetail3", "HSN code and GST rate"),
        t("products.pricingInfoDetail4", "Tax inclusive vs exclusive pricing"),
      ],
      tips: t(
        "products.pricingInfoTips",
        "Ensure selling price does not exceed MRP."
      ),
    },
    content: {
      title: t("products.catalogInformation", "Digital Catalog & Content"),
      description: t(
        "products.catalogInformationDescription",
        "Manage product visibility and descriptions on your digital shop."
      ),
      details: [
        t(
          "products.catalogDetailShowInCatalog",
          "Toggle online catalog visibility"
        ),
        t("products.contentSeoDetail1", "Short description for product cards"),
        t("products.contentSeoDetail2", "Search tags for discovery"),
        t("products.contentSeoDetail3", "Detailed specifications"),
      ],
      tips: t(
        "products.catalogSectionTips",
        "Add keywords to tags for easier search."
      ),
    },
  };

  const fetchCategories = useCallback(async () => {
    if (!storeId) return;

    const result = await executeGetCategories(
      categoryService.getCategories({
        limit: 100,
        store: storeId,
        lightweight: true,
      }),
      { showToast: false }
    );

    if (result) {
      const categories = result.data || [];
      setApiCategories(
        categories.map((category) => ({
          value: category.id || category._id,
          label: category.name,
          hasExpiryDate: category.hasExpiryDate,
        }))
      );
    }
  }, [storeId, executeGetCategories]);

  const fetchBrands = useCallback(async () => {
    if (!storeId) return;

    const result = await executeGetBrands(
      brandService.getBrands({
        limit: 100,
        store: storeId,
        lightweight: true,
      }),
      { showToast: false }
    );

    if (result) {
      const brands = result.data || [];
      setApiBrands(
        brands.map((brand) => ({
          value: brand.id || brand._id,
          label: brand.name,
        }))
      );
    }
  }, [storeId, executeGetBrands]);

  useEffect(() => {
    if (storeId) {
      fetchCategories();
      fetchBrands();
    }
  }, [storeId, fetchCategories, fetchBrands]);

  const handleInfoClick = (sectionId) => {
    setCurrentInfoSection(sectionInfo[sectionId]);
    setShowInfoModal(true);
  };

  const handleCategoryAdded = async (newCategory) => {
    await fetchCategories();
    if (onChange) onChange("category", newCategory.value);
  };

  const handleBrandAdded = async (newBrand) => {
    await fetchBrands();
    if (onChange) onChange("brandId", newBrand.value);
  };

  const handleDuplicateVariant1 = useCallback(() => {
    const duplicated = {
      id: `var_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      displayName: formData.displayName ? `${formData.displayName} (Copy)` : "",
      mrp: formData.mrp || "",
      sellingPrice: formData.sellingPrice || "",
      purchasePrice: formData.purchasePrice || formData.basePrice || "",
      sku: formData.sku ? `${formData.sku}-COPY` : "",
      barcode: "",
      stock: formData.stock !== undefined ? formData.stock : "",
      openingStock:
        formData.openingStock !== undefined ? formData.openingStock : "",
      status: formData.status || "ACTIVE",
      images: [
        ...(Array.isArray(formData.variantImages) &&
        formData.variantImages.length > 0
          ? formData.variantImages
          : formData.images || []),
      ],
      isDefault: false,
      options: (formData.options || []).map((opt) => ({
        ...opt,
        id: `opt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      })),
    };
    onVariantsChange([...variants, duplicated]);
  }, [formData, variants, onVariantsChange]);

  const handleUploadVariantImages = useCallback(async (files) => {
    if (!files || files.length === 0) return [];
    const uploadedUrls = [];
    for (let i = 0; i < files.length; i++) {
      try {
        const { publicFileUrl } = await utilityService.uploadFile(
          files[i],
          "products"
        );
        if (publicFileUrl) {
          uploadedUrls.push(publicFileUrl);
        }
      } catch (err) {
        console.error("Variant image upload failed:", err);
      }
    }
    return uploadedUrls;
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 2-Column Responsive Layout: Exactly 50% - 50% on desktop (lg+), 1 Column on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 items-start">
        {/* Left Column (50%): Basic Info Section (Sticky on desktop) */}
        <div className="w-full min-w-0 lg:sticky lg:top-4">
          <SortableSection
            id="basic"
            title={t("products.basicInformation", "Basic Information")}
            subtitle={t(
              "products.basicInformationSubtitle",
              "Product title, category, brand, UOM, and GST"
            )}
            icon={Package}
            onInfoClick={handleInfoClick}
            t={t}
          >
            <BasicInfoSection
              formData={formData}
              onChange={onChange}
              errors={fieldErrors}
              onAddCategoryClick={() => setShowAddCategoryDrawer(true)}
              onAddBrandClick={() => setShowAddBrandDrawer(true)}
              apiCategories={apiCategories}
              apiBrands={apiBrands}
              categoriesLoading={categoriesLoading}
              brandsLoading={brandsLoading}
              storeId={storeId}
              productId={productId}
              hasVariants={hasVariants}
              onHasVariantsChange={onHasVariantsChange}
              onUploadImages={handleUploadVariantImages}
            />
          </SortableSection>
        </div>

        {/* Right Column (50%): Pricing & Inventory OR Variants */}
        <div className="w-full min-w-0">
          {!hasVariants ? (
            /* Single Product: Pricing & Inventory Section */
            <SortableSection
              id="pricing-gst"
              title={t("products.pricingAndInventory", "Pricing & Inventory")}
              subtitle={t(
                "products.pricingAndInventorySubtitle",
                "MRP, selling price, purchase price, SKU, barcode, and stock"
              )}
              icon={IndianRupee}
              onInfoClick={handleInfoClick}
              t={t}
            >
              <PricingGSTSection
                formData={formData}
                onChange={onChange}
                errors={fieldErrors}
                storeId={storeId}
                productId={productId}
                hasVariants={false}
              />
            </SortableSection>
          ) : (
            /* Multi-Variant Mode: Variants List (Vertically stacked in 50% column) */
            <VariantsSection
              variants={variants}
              onChange={onVariantsChange}
              hasVariants={hasVariants}
              onHasVariantsChange={onHasVariantsChange}
              baseFormData={formData}
              errors={fieldErrors}
              variant1Card={
                <PricingGSTSection
                  formData={formData}
                  onChange={onChange}
                  errors={fieldErrors}
                  storeId={storeId}
                  productId={productId}
                  hasVariants={true}
                  onUploadImages={handleUploadVariantImages}
                  onDuplicate={handleDuplicateVariant1}
                />
              }
            />
          )}
        </div>
      </div>

      {/* Catalog & Additional Details (Full Width) */}
      <SortableSection
        id="content"
        title={t("products.catalogInformation", "Digital Catalog Details")}
        subtitle={t(
          "products.catalogInformationSubtitle",
          "Online store visibility, description, and specifications"
        )}
        icon={Eye}
        onInfoClick={handleInfoClick}
        t={t}
      >
        <AdditionalDetailsSection
          formData={formData}
          onChange={onChange}
          errors={fieldErrors}
          storeId={storeId}
          productId={productId}
        />
      </SortableSection>

      {/* Info Modal */}
      <ProductSectionInfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        sectionInfo={currentInfoSection}
      />

      {/* Drawers */}
      <CategoryDrawer
        isOpen={showAddCategoryDrawer}
        onClose={() => setShowAddCategoryDrawer(false)}
        storeId={storeId}
        onCategoryAdded={handleCategoryAdded}
      />

      <BrandDrawer
        isOpen={showAddBrandDrawer}
        onClose={() => setShowAddBrandDrawer(false)}
        storeId={storeId}
        onBrandAdded={handleBrandAdded}
      />
    </div>
  );
};

export default ProductForm;
