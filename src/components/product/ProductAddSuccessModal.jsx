"use client";
import { ProductAddSuccessModalPresentation } from "@dragorbit/features/products";

import { useEffect, useState } from "react";

import { useTranslation } from "@/hooks/ui/useTranslation";

const ProductAddSuccessModal = ({
  isOpen,
  onClose,
  onContinue,
  onAddMore,
  productName = "Product",
  title,
  continueText,
  addMoreText,
  description,
}) => {
  const { t } = useTranslation();
  const defaultTitle = title || t("products.productAddedSuccessfully");
  const defaultContinueText = continueText || t("products.continueToProducts");
  const defaultAddMoreText = addMoreText || t("products.addMoreProducts");
  const defaultDescription = description || t("products.productNowLive");
  const [isVisible, setIsVisible] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setTimeout(() => setShowContent(true), 100);
    } else {
      setShowContent(false);
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  return (
    <ProductAddSuccessModalPresentation
      model={{
        isVisible,
        showContent,
        defaultTitle,
        t,
        productName,
        defaultDescription,
        onContinue,
        defaultContinueText,
        onAddMore,
        defaultAddMoreText,
      }}
    />
  );
};

export default ProductAddSuccessModal;
