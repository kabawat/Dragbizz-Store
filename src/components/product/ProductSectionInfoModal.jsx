"use client";
import { ProductSectionInfoModalPresentation } from "@dragorbit/features/products";

import { useTranslation } from "@/hooks/ui/useTranslation";

const ProductSectionInfoModal = ({ isOpen, onClose, sectionInfo }) => {
  const { t } = useTranslation();

  if (!isOpen || !sectionInfo) return null;

  return (
    <ProductSectionInfoModalPresentation model={{ sectionInfo, onClose, t }} />
  );
};

export default ProductSectionInfoModal;
