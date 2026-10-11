"use client";
import { VariantsScreen } from "@dragorbit/features/variants";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useTranslation } from "@/hooks/ui/useTranslation";
import useApiResponse from "@/hooks/useApiResponse";
import { variantService } from "@/service";
import { useAppSelector } from "@/store/hooks";
import { unwrapVariantList, variantDisplayLabel } from "@/utils/variantForm";

const VariantsPage = () => {
	const { t } = useTranslation();
	useDashboardHeader(
		t("sidebar.variants"),
		t("sidebar.variantsDescription") || "Product variants and pricing",
	);
	const router = useRouter();
	const { selectedStore } = useAppSelector((state) => state.profile);
	const storeId = selectedStore?.storeId;
	const { can, loading: permissionsLoading } = useModulePermissions("product");
	const { execute, loading } = useApiResponse();
	const { execute: executeDelete, loading: isDeleting } = useApiResponse();
	const [variants, setVariants] = useState([]);
	const [variantToDelete, setVariantToDelete] = useState(null);

	const fetchVariants = useCallback(async () => {
		if (!storeId) return;
		const result = await execute(
			variantService.getVariants({ store: storeId, limit: 200 }),
			{ showToast: false },
		);
		setVariants(unwrapVariantList(result?.data));
	}, [storeId, execute]);

	useEffect(() => {
		if (!permissionsLoading && !can("read")) {
			router.push("/dashboard");
		}
	}, [can, permissionsLoading, router]);

	useEffect(() => {
		fetchVariants();
	}, [fetchVariants]);

	const handleConfirmDelete = async () => {
		if (!variantToDelete) return;
		const id = variantToDelete._id || variantToDelete.id;
		const result = await executeDelete(
			variantService.deleteVariant(id, storeId),
			{
				message:
					t("products.variantDeleteSuccess") || "Variant deleted successfully",
			},
		);
		if (result?.success) {
			setVariantToDelete(null);
			fetchVariants();
		}
	};

	return (
		<VariantsScreen
			model={{
				t,
				variants,
				can,
				variantDisplayLabel,
				setVariantToDelete,
				loading,
				variantToDelete,
				isDeleting,
				handleConfirmDelete,
				onCreate: () => router.push("/dashboard/variants/add"),
				onEdit: (id) => router.push(`/dashboard/variants/edit/${id}`),
				onView: (id) => router.push(`/dashboard/variants/view/${id}`),
			}}
		/>
	);
};

export default VariantsPage;
