"use client";
import { ProductTable as SharedProductTable } from "@dragorbit/features/products";
import Image from "next/image";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useRowActionMenu } from "@/hooks/ui/useRowActionMenu";
export default function ProductTable(props) {
	const { t } = useTranslation();

	return (
		<SharedProductTable
			{...props}
			t={t}
			Image={Image}
			useRowActionMenu={useRowActionMenu}
		/>
	);
}
