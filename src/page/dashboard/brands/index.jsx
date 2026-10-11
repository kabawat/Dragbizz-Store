"use client";
import { BrandsScreen } from "@dragorbit/features/brands";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useTranslation } from "@/hooks/ui/useTranslation";
import useApiResponse from "@/hooks/useApiResponse";
import { brandService } from "@/service";
import { useAppSelector } from "@/store/hooks";

const BrandDrawer = dynamic(() => import("@/components/product/BrandDrawer"), {
	ssr: false,
});

function unwrapList(data) {
	if (Array.isArray(data)) return data;
	if (Array.isArray(data?.data)) return data.data;
	if (Array.isArray(data?.brands)) return data.brands;
	return [];
}

const BrandsPage = () => {
	const { t } = useTranslation();
	useDashboardHeader(
		t("sidebar.brands"),
		t("sidebar.brandsDescription") || "Manage product brands",
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

	const [brands, setBrands] = useState([]);
	const [showDrawer, setShowDrawer] = useState(false);

	const fetchBrands = useCallback(async () => {
		if (!storeId) return;
		const result = await execute(
			brandService.getBrands({ store: storeId, limit: 200 }),
			{ showToast: false },
		);
		setBrands(unwrapList(result?.data));
	}, [storeId, execute]);

	useEffect(() => {
		if (!permissionsLoading && !can("read")) {
			router.push("/dashboard");
		}
	}, [can, permissionsLoading, router]);

	useEffect(() => {
		fetchBrands();
	}, [fetchBrands]);

	return (
		<BrandsScreen
			model={{
				t,
				brands,
				canCreate,
				setShowDrawer,
				loading,
				BrandDrawer,
				showDrawer,
				storeId,
				fetchBrands,
			}}
		/>
	);
};

export default BrandsPage;
