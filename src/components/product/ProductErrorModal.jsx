"use client";
import { ProductErrorModalView } from "@dragorbit/features/products";

import { useTranslation } from "@/hooks/ui/useTranslation";

const ProductErrorModal = ({
	isOpen,
	onClose,
	title,
	message,
	details = null,
}) => {
	const { t } = useTranslation();
	const defaultTitle = title || t("common.error");
	const defaultMessage = message || t("common.somethingWentWrong");
	if (!isOpen) return null;

	return (
		<ProductErrorModalView
			model={{ defaultMessage, defaultTitle, t, onClose, details }}
		/>
	);
};

export default ProductErrorModal;
