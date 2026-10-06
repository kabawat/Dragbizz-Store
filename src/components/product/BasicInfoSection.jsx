"use client";
import { Barcode, Hash, Package } from "lucide-react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { Input, Select } from "../ui";

const BasicInfoSection = ({
  formData,
  onChange,
  errors = {},
  onAddCategoryClick,
  onAddBrandClick,
  apiCategories = [],
  apiBrands = [],
  categoriesLoading = false,
  brandsLoading = false,
}) => {
  const { t } = useTranslation();

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

  const handleBrandChange = (value) => {
    if (value === "add-new-brand") {
      onAddBrandClick?.();
    } else {
      handleFieldChange("brandId", value);
    }
  };

  const allCategories = [
    ...apiCategories,
    {
      value: "add-new-category",
      label: `+ ${t("products.addNewCategory")}`,
      isAddOption: true,
    },
  ];

  const allBrands = [
    ...apiBrands,
    {
      value: "add-new-brand",
      label: `+ ${t("products.addNewBrand")}`,
      isAddOption: true,
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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

        <div>
          <Select
            label={t("products.brand")}
            placeholder={
              brandsLoading
                ? t("products.loadingBrands")
                : t("products.selectBrand")
            }
            value={formData.brandId || ""}
            onChange={handleBrandChange}
            error={errors.brandId}
            errorMessage={errors.brandId}
            searchable={true}
            options={allBrands}
            disabled={brandsLoading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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

        <div>
          <Input
            label={t("products.sku")}
            placeholder={t("products.enterSku")}
            value={formData.sku || ""}
            onChange={(value) =>
              handleFieldChange("sku", (value || "").toUpperCase())
            }
            error={errors.sku}
            errorMessage={errors.sku}
            leftIcon={Hash}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
