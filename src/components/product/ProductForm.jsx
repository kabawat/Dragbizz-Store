"use client";

// Import drag and drop
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Eye, Image as ImageIcon, IndianRupee, Package } from "lucide-react";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppSelector } from "@/store/hooks";
import { categoryService } from "@/service/retailer";
import useApiResponse from "@/hooks/useApiResponse";

// Import custom components
import AdditionalDetailsSection from "./AdditionalDetailsSection";
import BasicInfoSection from "./BasicInfoSection";
import MediaSection from "./MediaSection";
import PricingGSTSection from "./PricingGSTSection";
import SortableSection from "./SortableSection";
import ProductSectionInfoModal from "./ProductSectionInfoModal";
import CategoryDrawer from "./CategoryDrawer";

const ProductForm = ({
  formData = {},
  onChange = () => { },
  fieldErrors = {},
  storeId = null,
  productId = null,
  className = "",
}) => {
  const { t } = useTranslation();
  const { selectedStore } = useAppSelector((state) => state.profile);

  // Modal and Drawer States
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [currentInfoSection, setCurrentInfoSection] = useState(null);
  const [showAddCategoryDrawer, setShowAddCategoryDrawer] = useState(false);
  const [apiCategories, setApiCategories] = useState([]);

  // Use API response for fetching categories
  const { execute: executeGet, loading: categoriesLoading } = useApiResponse();
  const hasFetchedCategories = useRef(false);

  // Form Sections Configuration
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

  // Section Help/Information Content
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

  // Fetch Category List
  const fetchCategories = useCallback(async () => {
    if (!storeId) return;
    hasFetchedCategories.current = true;

    const result = await executeGet(
      categoryService.getCategories({
        limit: 100,
        store: storeId,
        lightweight: true,
      }),
      { showToast: false }
    );

    if (result) {
      const categories = result.data || [];
      const formattedCategories = categories.map((category) => ({
        value: category.id || category._id,
        label: category.name,
        hasExpiryDate: category.hasExpiryDate,
      }));
      setApiCategories(formattedCategories);
    }
  }, [storeId, executeGet]);

  // Initial fetch and refresh listener
  useEffect(() => {
    if (storeId) fetchCategories();
  }, [storeId, fetchCategories]);

  // Handle section help click
  const handleInfoClick = (sectionId) => {
    setCurrentInfoSection(sectionInfo[sectionId]);
    setShowInfoModal(true);
  };

  // Drag & Drop Sensors
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

  // Callback when a new category is successfully added
  const handleCategoryAdded = async (newCategory) => {
    await fetchCategories();
    if (onChange) onChange("category", newCategory.value);
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
                      apiCategories={apiCategories}
                      categoriesLoading={categoriesLoading}
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

      {/* Reusable Section Info Modal */}
      <ProductSectionInfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        sectionInfo={currentInfoSection}
      />

      {/* Reusable Add Category Drawer */}
      <CategoryDrawer
        isOpen={showAddCategoryDrawer}
        onClose={() => setShowAddCategoryDrawer(false)}
        storeId={storeId}
        onCategoryAdded={handleCategoryAdded}
      />
    </div>
  );
};

export default ProductForm;
