"use client";
import { CategoriesScreen } from "@dragorbit/features/categories";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useTranslation } from "@/hooks/ui/useTranslation";
import useApiResponse from "@/hooks/useApiResponse";
import { categoryService } from "@/service";
import { useAppSelector } from "@/store/hooks";

const CategoryDrawer = dynamic(
	() => import("@/components/product/CategoryDrawer"),
	{
		ssr: false,
	},
);

function unwrapList(data) {
	if (Array.isArray(data)) return data;
	if (Array.isArray(data?.data)) return data.data;
	if (Array.isArray(data?.categories)) return data.categories;
	return [];
}

const CategoriesPage = () => {
	const { t } = useTranslation();
	useDashboardHeader(
		t("sidebar.categories"),
		t("sidebar.categoriesDescription") || "Manage product categories",
	);
	const router = useRouter();
	const { selectedStore } = useAppSelector((state) => state.profile);
	const storeId = selectedStore?.storeId;
	const {
		can,
		create: canCreate,
		loading: permissionsLoading,
	} = useModulePermissions("product");
	const { execute, loading } = useApiResponse();

	const [categories, setCategories] = useState([]);
	const [showDrawer, setShowDrawer] = useState(false);

	const fetchCategories = useCallback(async () => {
		if (!storeId) return;
		const result = await execute(
			categoryService.getCategories({ store: storeId, limit: 200 }),
			{ showToast: false },
		);
		setCategories(unwrapList(result?.data));
	}, [storeId, execute]);

	useEffect(() => {
		if (!permissionsLoading && !can("read")) {
			router.push("/dashboard");
		}
	}, [can, permissionsLoading, router]);

	useEffect(() => {
		fetchCategories();
	}, [fetchCategories]);

	return (
		<CategoriesScreen
			model={{
				t,
				categories,
				canCreate,
				setShowDrawer,
				loading,
				CategoryDrawer,
				showDrawer,
				storeId,
				fetchCategories,
			}}
		/>
	);
};

export default CategoriesPage;
