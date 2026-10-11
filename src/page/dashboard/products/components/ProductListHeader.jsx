"use client";
import { ProductListHeaderView } from "@dragorbit/features/products";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useTranslation } from "@/hooks/ui/useTranslation";
import { useApiResponse } from "@/hooks/useApiResponse";
import { categoryService } from "@/service/retailer";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getProducts, setViewMode } from "@/store/slices/products/productSlice";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import ProductBulkUpload from "@/components/product/ProductBulkUpload";
import { useRouter } from "next/navigation";

const getCatalogOptions = (t) => [
	{ value: "", label: t("products.allVisibility") },
	{ value: "true", label: t("products.showInCatalog") },
	{ value: "false", label: t("products.hidden") },
];

const getSortOptions = (t) => [
	{ value: "", label: t("products.defaultSort") },
	{ value: "low-high", label: t("products.priceLowHigh") },
	{ value: "high-low", label: t("products.priceHighLow") },
	{ value: "price_asc", label: t("products.priceAsc") },
	{ value: "price_desc", label: t("products.priceDesc") },
];

const ProductListHeader = ({
	canCreate = false,
	searchValue,
	setSearchValue,
	sortBy,
	setSortBy,
	showInCatalog,
	setShowInCatalog,
	category,
	setCategory,
}) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const router = useRouter();

	const { viewMode, isLoading } = useAppSelector((state) => state.products);
	const { selectedStore } = useAppSelector((state) => state.profile);
	const storeId = useMemo(
		() => selectedStore?.storeId || "",
		[selectedStore?.storeId],
	);

	const [categories, setCategories] = useState([]);
	const { execute: executeCategories, loading: categoriesLoading } =
		useApiResponse();

	// Drawers
	const [showBulkUploadDrawer, setShowBulkUploadDrawer] = useState(false);

	const searchInputRef = useRef(null);
	const lastFetchRef = useRef(null);
	const hasFetchedRef = useRef({
		fetched: false,
		storeId: null,
		searchValue: null,
		sortBy: null,
		showInCatalog: null,
		category: null,
	});
	const hasFetchedCategories = useRef(false);
	const categoriesStoreIdRef = useRef(null);

	const categoryOptions = useMemo(
		() => [{ value: "", label: t("products.allCategories") }, ...categories],
		[categories, t],
	);

	// Reset fetch refs when store changes
	useEffect(() => {
		lastFetchRef.current = null;
		hasFetchedRef.current = {
			fetched: false,
			storeId: null,
			searchValue: null,
			sortBy: null,
			showInCatalog: null,
			category: null,
		};
		if (categoriesStoreIdRef.current !== storeId) {
			hasFetchedCategories.current = false;
			categoriesStoreIdRef.current = storeId;
		}
	}, [storeId]);

	// Fetch categories once per store
	const fetchCategories = useCallback(async () => {
		if (!storeId || hasFetchedCategories.current) return;
		hasFetchedCategories.current = true;
		const response = await executeCategories(
			categoryService.getCategories({
				limit: 100,
				store: storeId,
				lightweight: true,
			}),
			{ showToast: false },
		);
		if (response) {
			const data = response.data || [];
			setCategories(
				data.map((cat) => ({ value: cat.id || cat._id, label: cat.name })),
			);
		} else {
			hasFetchedCategories.current = false;
		}
	}, [storeId, executeCategories]);

	useEffect(() => {
		if (storeId) fetchCategories();
	}, [storeId, fetchCategories]);

	// Fetch products with debounce + deduplication
	const fetchProducts = useCallback(async () => {
		if (!storeId) return;

		const fetchKey = `${storeId}-${searchValue}-${sortBy}-${showInCatalog}-${category}`;
		if (lastFetchRef.current === fetchKey) return;

		const last = hasFetchedRef.current;
		if (
			last.fetched &&
			last.storeId === storeId &&
			last.searchValue === searchValue &&
			last.sortBy === sortBy &&
			last.showInCatalog === showInCatalog &&
			last.category === category
		)
			return;

		lastFetchRef.current = fetchKey;

		const params = {
			store: storeId,
			search: searchValue,
			limit: 20,
			cursor: null,
			isFreshLoad: true,
		};
		if (sortBy) params.sortBy = sortBy;
		if (showInCatalog) params.showInCatalog = showInCatalog;
		if (category) params.category = category;

		await dispatch(getProducts(params));
		hasFetchedRef.current = {
			fetched: true,
			storeId,
			searchValue,
			sortBy,
			showInCatalog,
			category,
		};
	}, [dispatch, storeId, searchValue, sortBy, showInCatalog, category]);

	useEffect(() => {
		if (!storeId) return;
		const last = hasFetchedRef.current;
		const alreadyFetched =
			last.fetched &&
			last.storeId === storeId &&
			last.searchValue === searchValue &&
			last.sortBy === sortBy &&
			last.showInCatalog === showInCatalog &&
			last.category === category;
		if (alreadyFetched) return;
		const timer = setTimeout(() => fetchProducts(), 350);
		return () => clearTimeout(timer);
	}, [storeId, searchValue, sortBy, showInCatalog, category, fetchProducts]);

	const handleViewModeChange = useCallback(
		(mode) => {
			dispatch(setViewMode(mode));
			localStorage.setItem("products-view-mode", mode);
		},
		[dispatch],
	);

	const handleBulkUploadSuccess = useCallback(() => {
		if (!storeId) return;
		dispatch(getProducts({ store: storeId, limit: 20, isFreshLoad: true }));
	}, [dispatch, storeId]);

	useCommonHotkeys({
		onNew: canCreate
			? () => router.push("/dashboard/products/create")
			: undefined,
		onClose: () => {
			if (showBulkUploadDrawer) setShowBulkUploadDrawer(false);
		},
		onSearch: () => searchInputRef.current?.focus(),
		onViewTable: () => handleViewModeChange("table"),
		onViewGrid: () => handleViewModeChange("card"),
	});

	return (
		<ProductListHeaderView
			model={{
				searchInputRef,
				t,
				searchValue,
				setSearchValue,
				showInCatalog,
				setShowInCatalog,
				getCatalogOptions,
				category,
				setCategory,
				categoryOptions,
				categoriesLoading,
				sortBy,
				setSortBy,
				getSortOptions,
				handleViewModeChange,
				viewMode,
				canCreate,
				setShowBulkUploadDrawer,
				showBulkUploadDrawer,
				ProductBulkUpload,
				handleBulkUploadSuccess,
				onCreate: () => router.push("/dashboard/products/create"),
			}}
		/>
	);
};

export default ProductListHeader;
