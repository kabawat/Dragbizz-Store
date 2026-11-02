"use client";

import { BasicInfoSectionView } from "@dragorbit/features/products";
import { CURRENCY_OPTIONS, UOM_OPTIONS } from "@/data";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppSelector } from "@/store/hooks";

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
  hasVariants = false,
  onHasVariantsChange = () => {},
}) => {
  const { t } = useTranslation();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const hasStoreGst = !!selectedStore?.gst;

  return (
    <BasicInfoSectionView
      formData={formData}
      onChange={onChange}
      errors={errors}
      onAddCategoryClick={onAddCategoryClick}
      onAddBrandClick={onAddBrandClick}
      apiCategories={apiCategories}
      apiBrands={apiBrands}
      categoriesLoading={categoriesLoading}
      brandsLoading={brandsLoading}
      hasVariants={hasVariants}
      onHasVariantsChange={onHasVariantsChange}
      currencyOptions={CURRENCY_OPTIONS}
      uomOptions={UOM_OPTIONS}
      hasStoreGst={hasStoreGst}
      t={t}
    />
  );
};

export default BasicInfoSection;
