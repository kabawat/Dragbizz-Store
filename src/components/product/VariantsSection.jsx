"use client";

import {
  VariantsSectionView,
  createEmptyVariant,
} from "@dragorbit/features/products";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { utilityService } from "@/service";

export { createEmptyVariant };

export default function VariantsSection({
  variants = [],
  onChange = () => {},
  hasVariants = false,
  onHasVariantsChange = () => {},
  baseFormData = {},
  disabled = false,
}) {
  const { t } = useTranslation();

  const handleUploadImages = async (files) => {
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
  };

  return (
    <VariantsSectionView
      variants={variants}
      onChange={onChange}
      hasVariants={hasVariants}
      onHasVariantsChange={onHasVariantsChange}
      baseFormData={baseFormData}
      disabled={disabled}
      onUploadImages={handleUploadImages}
      t={t}
    />
  );
}
