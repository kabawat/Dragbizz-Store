"use client";

import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, } from "@dnd-kit/sortable";
import { Eye, Image as ImageIcon, IndianRupee, Package } from "lucide-react";
import dynamic from "next/dynamic";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { brandService, categoryService } from "@/service/retailer";
import useApiResponse from "@/hooks/useApiResponse";

import AdditionalDetailsSection from "./AdditionalDetailsSection";
import BasicInfoSection from "./BasicInfoSection";
import MediaSection from "./MediaSection";
import PricingGSTSection from "./PricingGSTSection";
import SortableSection from "./SortableSection";

const ProductSectionInfoModal = dynamic(() => import("./ProductSectionInfoModal"), { ssr: false });
const CategoryDrawer = dynamic(() => import("./CategoryDrawer"), { ssr: false });
const BrandDrawer = dynamic(() => import("./BrandDrawer"), { ssr: false });

const ProductForm = ({
  formData = {},
  onChange = () => { },
  fieldErrors = {},
  storeId = null,
  productId = null,
  className = "",
}) => {
  const { t } = useTranslation();

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [currentInfoSection, setCurrentInfoSection] = useState(null);
  const [showAddCategoryDrawer, setShowAddCategoryDrawer] = useState(false);
  const [showAddBrandDrawer, setShowAddBrandDrawer] = useState(false);
  const [apiCategories, setApiCategories] = useState([]);
  const [apiBrands, setApiBrands] = useState([]);

  const { execute: executeGetCategories, loading: categoriesLoading } = useApiResponse();
  const { execute: executeGetBrands, loading: brandsLoading } = useApiResponse();

  const [sections, setSections] = useState([
    {
      id: "basic",
      title: t("products.basicInformation"),
      subtitle: t("products.basicInformationSubtitle"),
      icon: Package,
      component: BasicInfoSection,
    },
    {
      id: "media",
      title: t("products.media") || "Media & Images",
      subtitle: t("products.mediaSubtitle") || "Upload product images and videos",
      icon: ImageIcon,
      component: MediaSection,
    },
    {
      id: "pricing-gst",
      title: t("products.pricingInformation"),
      subtitle: t("products.pricingInformationSubtitle"),
      icon: IndianRupee,
      component: PricingGSTSection,
    },
    {
      id: "content",
      title: t("products.catalogInformation"),
      subtitle: t("products.catalogInformationSubtitle"),
      icon: Eye,
      component: AdditionalDetailsSection,
    },
  ]);

  const sectionInfo = {
    basic: {
      title: t("products.basicInformation"),
      description: t("products.basicInformationDescription"),
      details: [
        t("products.basicInfoDetail1"),
        t("products.basicInfoDetail2"),
        t("products.basicInfoDetail3"),
        t("products.basicInfoDetail4"),
      ],
      tips: t("products.basicInfoTips"),
    },
    media: {
      title: t("products.media") || "Media & Images",
      description: t("products.mediaDescription") || "Visual representation of your product for the catalog.",
      details: [
        t("products.mediaDetail1") || "Product cover image",
        t("products.mediaDetail2") || "Supports JPG, PNG, WebP",
        t("products.mediaDetail3") || "Recommended size: 1000x1000px",
      ],
      tips: t("products.mediaTips") || "Bright, clear images on a white background convert best.",
    },
    "pricing-gst": {
      title: t("products.pricingInformation"),
      description: t("products.pricingInformationDescription"),
      details: [
        t("products.pricingInfoDetail1"),
        t("products.pricingInfoDetail2"),
        t("products.pricingInfoDetail3"),
        t("products.pricingInfoDetail4"),
        t("products.pricingInfoDetail5"),
      ],
      tips: t("products.pricingInfoTips"),
    },
    content: {
      title: t("products.catalogInformation"),
      description: t("products.catalogInformationDescription"),
      details: [
        t("products.catalogDetailShowInCatalog"),
        t("products.contentSeoDetail1"),
        t("products.contentSeoDetail2"),
        t("products.contentSeoDetail3"),
        t("products.contentSeoDetail4"),
        t("products.contentSeoDetail5"),
      ],
      tips: t("products.catalogSectionTips"),
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleCategoryAdded = async (newCategory) => {
    await fetchCategories();
    if (onChange) onChange("category", newCategory.value);
  };

  const handleBrandAdded = async (newBrand) => {
    await fetchBrands();
    if (onChange) onChange("brandId", newBrand.value);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sections.map((section) => section.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="columns-1 lg:columns-2 gap-6 space-y-6">
            {sections.map((section) => {
              const SectionComponent = section.component;
              return (
                <SortableSection
                  key={section.id}
                  id={section.id}
                  title={section.title}
                  subtitle={section.subtitle}
                  icon={section.icon}
                  onInfoClick={handleInfoClick}
                  t={t}
                >
                  {section.id === "basic" ? (
                    <SectionComponent
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
                    />
                  ) : (
                    <SectionComponent
                      formData={formData}
                      onChange={onChange}
                      errors={fieldErrors}
                      storeId={storeId}
                      productId={productId}
                    />
                  )}
                </SortableSection>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      <ProductSectionInfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        sectionInfo={currentInfoSection}
      />

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
