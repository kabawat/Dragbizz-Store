"use client";

import { PricingGSTSectionView } from "@dragorbit/features/products";
import { useTranslation } from "@/hooks/ui/useTranslation";

const PricingGSTSection = ({
  formData,
  onChange,
  errors = {},
  hasVariants = false,
  onUploadImages,
  onDuplicate,
}) => {
  const { t } = useTranslation();

  return (
    <PricingGSTSectionView
      formData={formData}
      onChange={onChange}
      errors={errors}
      hasVariants={hasVariants}
      onUploadImages={onUploadImages}
      onDuplicate={onDuplicate}
      t={t}
    />
  );
};

export default PricingGSTSection;
