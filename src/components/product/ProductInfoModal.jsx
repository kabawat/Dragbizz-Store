"use client";
import { ProductInfoModalPresentation } from "@dragorbit/features/products";

import { useTranslation } from "@/hooks/ui/useTranslation";

const ProductInfoModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return <ProductInfoModalPresentation model={{ t, onClose }} />;
};

export default ProductInfoModal;
