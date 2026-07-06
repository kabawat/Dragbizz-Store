"use client";
import { Barcode, Package, Tag } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { Input, Select, Toggle } from "../ui";

const BasicInfoSection = ({
  formData,
  onChange,
  errors = {},
  onAddCategoryClick,
  apiCategories = [],
  categoriesLoading = false,
  ...props
}) => {
  const { t } = useTranslation();
  const [customCategories, _setCustomCategories] = useState([]);

  const handleFieldChange = (field, value) => {
    onChange(field, value);
  };

  const handleCategoryChange = (value) => {
    if (value === "add-new-category") {
      onAddCategoryClick?.();
    } else {
      handleFieldChange("category", value);
    }
  };

  // Combine API categories with custom ones and add "Add New Category" option
  const allCategories = [
    ...apiCategories,
    ...customCategories,
    {
      value: "add-new-category",
      label: `+ ${t("products.addNewCategory")}`,
      isAddOption: true,
    },
  ];

  return (
    <>
      {/* First Section - Product Name & Brand */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Product Name */}
        <div>
          <Input
            label={t("products.productName")}
            placeholder={t("products.enterProductName")}
            value={formData.name || ""}
            onChange={(value) => handleFieldChange("name", value)}
            error={errors.name}
            errorMessage={errors.name}
            required
            leftIcon={Package}
          />
        </div>

        {/* Brand */}
        <div>
          <Input
            label={t("products.brand")}
            placeholder={t("products.enterBrandName")}
            value={formData.brand || ""}
            onChange={(value) => handleFieldChange("brand", value)}
            error={errors.brand}
            errorMessage={errors.brand}
            leftIcon={Tag}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <Select
            label={t("products.productType")}
            value={formData.productType || "GOODS"}
            onChange={(value) => handleFieldChange("productType", value)}
            options={[
              { value: "GOODS", label: t("products.productTypeGoods") },
              { value: "SERVICE", label: t("products.productTypeService") },
            ]}
          />
        </div>
      </div>

      {/* Second Section - Category & Barcode */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Category Selection */}
        <div>
          <Select
            label={t("products.category")}
            placeholder={
              categoriesLoading
                ? t("products.loadingCategories")
                : t("products.selectCategory")
            }
            value={formData.category || ""}
            onChange={handleCategoryChange}
            error={errors.category}
            errorMessage={errors.category}
            searchable={true}
            options={allCategories}
            required
            disabled={categoriesLoading}
          />
        </div>

        {/* Barcode */}
        <div>
          <Input
            label={t("products.barcode")}
            placeholder={t("products.enterBarcode")}
            value={formData.barcode || ""}
            onChange={(value) => handleFieldChange("barcode", value)}
            error={errors.barcode}
            errorMessage={errors.barcode}
            leftIcon={Barcode}
          />
        </div>
      </div>
    </>
  );
};

export default BasicInfoSection;
