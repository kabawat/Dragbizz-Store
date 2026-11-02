"use client";
import { ProductCard as SharedProductCard } from "@dragorbit/features/products";
import Image from "next/image";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useTheme } from "@/contexts/ThemeContext";
export default function ProductCard(props) {
	const { t } = useTranslation();
	const { currentVariant } = useTheme();
	return (
		<SharedProductCard
			{...props}
			t={t}
			Image={Image}
			currentVariant={currentVariant}
		/>
	);
}
