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
	const { execute, loading: requestLoading } = useApiResponse();
	const [resolvedStoreId, setResolvedStoreId] = useState(null);
	const [error, setError] = useState(null);
	const loading = requestLoading || resolvedStoreId !== storeId;

	const [brands, setBrands] = useState([]);
	const [showDrawer, setShowDrawer] = useState(false);

	const fetchBrands = useCallback(async () => {
		if (!storeId) return;
		setError(null);
		const result = await execute(
			brandService.getBrands({ store: storeId, limit: 200 }),
			{ showToast: false },
		);
		if (!result || result.success === false || result.status === false) {
			setError(result?.message || t("products.loadFailed"));
		} else {
		setBrands(unwrapList(result?.data));
		}
		setResolvedStoreId(storeId);
	}, [storeId, execute, t]);

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
				brands: resolvedStoreId === storeId ? brands : [],
				canCreate,
				setShowDrawer,
				loading,
				error,
				BrandDrawer,
				showDrawer,
				storeId,
				fetchBrands,
			}}
		/>
	);
};

export default BrandsPage;
