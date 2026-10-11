"use client";
import { ProductDeleteSuccessModalView } from "@dragorbit/features/products";

import { useTranslation } from "@/hooks/ui/useTranslation";

const ProductDeleteSuccessModal = ({
	isOpen,
	onClose,
	productName = "Product",
}) => {
	const { t } = useTranslation();
	if (!isOpen) return null;

	return <ProductDeleteSuccessModalView model={{ t, onClose, productName }} />;
};

export default ProductDeleteSuccessModal;
