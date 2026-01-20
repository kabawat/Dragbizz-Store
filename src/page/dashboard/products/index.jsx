"use client";
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { Plus, Grid3X3, List, Package, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getProducts,
  deleteProduct,
  setViewMode,
  addMoreProducts,
} from "@/store/slices/productsSlice";
import { transformProductsArray } from "@/utils/productUtils";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { Input, SettingsPanel, Select } from "@/components/ui";
import { categoryService } from "@/service/retailer";
import { useTranslation } from "@/hooks/useTranslation";

const getVisibilityOptions = (t) => [
  { value: "", label: t("products.allVisibility") },
  { value: "PUBLIC", label: t("products.public") },
  { value: "PRIVATE", label: t("products.private") },
  { value: "CATALOG", label: t("products.catalog") },
];

const getSortOptions = (t) => [
  { value: "", label: t("products.defaultSort") },
  { value: "low-high", label: t("products.priceLowHigh") },
  { value: "high-low", label: t("products.priceHighLow") },
  { value: "price_asc", label: t("products.priceAsc") },
  { value: "price_desc", label: t("products.priceDesc") },
];

// Import UI components
import { Button } from "@/components/ui";

// Import product components
import {
  ProductTable,
  ProductGrid,
  ProductCard,
  ProductDeleteConfirmModal,
  ProductDeleteSuccessModal,
  ProductErrorModal,
} from "@/components/product";
import { StockInDrawer } from "@/components/ui";
import { useGlobalToast } from "@/contexts/ToastContext";

const ProductsPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Redux store data
  const { products, isLoading, error, pagination, viewMode } = useAppSelector(
    (state) => state.products,
  );

  const { selectedStore } = useAppSelector((state) => state.profile);
  const { showSuccess } = useGlobalToast();

  // Local state
  const [searchValue, setSearchValue] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [visibility, setVisibility] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const categoryOptions = useMemo(
    () => [{ value: "", label: t("products.allCategories") }, ...categories],
    [categories, t],
  );
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [deletedProductName, setDeletedProductName] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);
  const [showStockInDrawer, setShowStockInDrawer] = useState(false);
  const [productForStockIn, setProductForStockIn] = useState(null);
  const scrollRef = useRef(null);

  // Memoize storeId to avoid repeated calculations
  const storeId = useMemo(() => {
    return (
      selectedStore?.storeId || selectedStore?._id || selectedStore?.id || ""
    );
  }, [selectedStore?.storeId, selectedStore?._id, selectedStore?.id]);

  // Transform products data - memoized to avoid recalculation on every render
  const transformedProducts = useMemo(() => {
    return transformProductsArray(products);
  }, [products]);

  // Error display
  useEffect(() => {
    if (error) {
      setErrorDetails({
        title: t("products.errorLoading"),
        message: error,
        details: t("common.tryAgain"),
      });
      setShowErrorModal(true);
    }
  }, [error]);

  useEffect(() => {
    const savedViewMode = localStorage.getItem("products-view-mode");
    if (
      savedViewMode &&
      (savedViewMode === "table" || savedViewMode === "card")
    ) {
      dispatch(setViewMode(savedViewMode));
    }
  }, [dispatch]);

  // Fetch products on mount and search changes
  const lastFetchRef = useRef(null);
  const hasFetchedRef = useRef({
    storeId: null,
    searchValue: null,
    sortBy: null,
    visibility: null,
    category: null,
    fetched: false,
  });
  const hasFetchedCategories = useRef(false);
  const categoriesStoreIdRef = useRef(null);

  // Reset fetch refs and pagination when search, sortBy, filters or store changes
  useEffect(() => {
    lastFetchRef.current = null;
    hasFetchedRef.current = {
      storeId: null,
      searchValue: null,
      sortBy: null,
      visibility: null,
      category: null,
      fetched: false,
    };
    // Reset categories fetch ref when store changes
    if (categoriesStoreIdRef.current !== storeId) {
      hasFetchedCategories.current = false;
      categoriesStoreIdRef.current = storeId;
    }
  }, [storeId, searchValue, sortBy, visibility, category]);

  // Fetch categories - memoized callback with duplicate prevention
  const fetchCategories = useCallback(async () => {
    if (!storeId || hasFetchedCategories.current) return;
    // Set fetched flag BEFORE API call to prevent duplicate calls
    hasFetchedCategories.current = true;

    try {
      setCategoriesLoading(true);

      const response = await categoryService.getCategories({
        limit: 100,
        store: storeId,
        lightweight: true,
      });

      if (response.success) {
        const categoriesData = response.data?.data || response.data || [];
        const formattedCategories = categoriesData.map((cat) => ({
          value: cat.id || cat._id,
          label: cat.name,
        }));
        setCategories(formattedCategories);
      }
    } catch (error) {
      logger.error("Failed to fetch categories:", error);
      // Reset on error so it can retry
      hasFetchedCategories.current = false;
    } finally {
      setCategoriesLoading(false);
    }
  }, [storeId]);

  // Fetch categories on component mount - only once per store
  useEffect(() => {
    if (storeId) {
      fetchCategories();
    }
  }, [storeId, fetchCategories]);

  // Fetch products with debouncing (similar to customer page)
  const fetchProducts = useCallback(async () => {
    if (!storeId) return;

    const params = {
      store: storeId,
      search: searchValue,
      limit: 20,
      cursor: null,
    };

    // Add sortBy if provided
    if (sortBy) {
      params.sortBy = sortBy;
    }

    // Add visibility filter if provided
    if (visibility) {
      params.visibility = visibility;
    }

    // Add category filter if provided
    if (category) {
      params.category = category;
    }

    // Create a unique key for this fetch
    const fetchKey = `${storeId}-${searchValue}-${sortBy}-${visibility}-${category}`;

    // Prevent duplicate calls with same parameters
    if (lastFetchRef.current === fetchKey) {
      return;
    }

    // Check if already fetched with same parameters
    const lastFetched = hasFetchedRef.current;
    if (
      lastFetched.fetched &&
      lastFetched.storeId === storeId &&
      lastFetched.searchValue === searchValue &&
      lastFetched.sortBy === sortBy &&
      lastFetched.visibility === visibility &&
      lastFetched.category === category
    ) {
      return;
    }

    lastFetchRef.current = fetchKey;

    try {
      await dispatch(getProducts(params));

      // Update fetch ref after successful fetch
      hasFetchedRef.current = {
        storeId,
        searchValue,
        sortBy,
        visibility,
        category,
        fetched: true,
      };
    } catch (error) {
      // Reset on error so it can retry
      lastFetchRef.current = null;
    }
  }, [dispatch, storeId, searchValue, sortBy, visibility, category]);

  // Fetch products on mount and when dependencies change (debounced)
  useEffect(() => {
    if (!storeId) return;

    const shouldSkip = () => {
      const lastFetched = hasFetchedRef.current;
      return (
        (lastFetched.fetched &&
          lastFetched.storeId === storeId &&
          lastFetched.searchValue === searchValue &&
          lastFetched.sortBy === sortBy &&
          lastFetched.visibility === visibility &&
          lastFetched.category === category) ||
        isLoading
      );
    };

    if (shouldSkip()) return;

    const timer = setTimeout(() => {
      fetchProducts();
    }, 350); // 350ms debounce like customer page

    return () => clearTimeout(timer);
  }, [
    storeId,
    searchValue,
    sortBy,
    visibility,
    category,
    isLoading,
    fetchProducts,
  ]);

  // Load more products - memoized callback
  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !pagination.hasNextPage) return;

    setIsLoadingMore(true);

    try {
      const params = {
        store: storeId,
        search: searchValue,
        limit: 20,
        cursor: pagination.nextCursor,
      };

      // Add sortBy if provided
      if (sortBy) {
        params.sortBy = sortBy;
      }

      // Add visibility filter if provided
      if (visibility) {
        params.visibility = visibility;
      }

      // Add category filter if provided
      if (category) {
        params.category = category;
      }

      const result = await dispatch(getProducts(params));

      if (result.payload?.success && result.payload?.data?.data) {
        dispatch(addMoreProducts(result.payload.data.data));
      }
    } catch (error) {
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    isLoadingMore,
    pagination.hasNextPage,
    pagination.nextCursor,
    storeId,
    searchValue,
    sortBy,
    visibility,
    category,
    dispatch,
  ]);

  // Infinite scroll with throttling
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!scrollRef.current || isLoadingMore || !pagination.hasNextPage) {
            ticking = false;
            return;
          }

          const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
          const threshold = 100;

          if (scrollTop + clientHeight >= scrollHeight - threshold) {
            handleLoadMore();
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener("scroll", handleScroll, { passive: true });
      return () => scrollElement.removeEventListener("scroll", handleScroll);
    }
  }, [isLoadingMore, pagination.hasNextPage, handleLoadMore]);

  const handleStoreChange = (storeObject) => {
    // Store change handled by Redux
  };

  // Search
  const handleSearch = (value) => {
    setSearchValue(value);
  };

  // Sort by
  const handleSortByChange = (value) => {
    setSortBy(value);
  };

  // Visibility filter
  const handleVisibilityChange = (value) => {
    setVisibility(value);
  };

  // Category filter
  const handleCategoryChange = (value) => {
    setCategory(value);
  };

  const handleAddProduct = useCallback(() => {
    // Navigate to add product
    router.push("/dashboard/products/add");
  }, [router]);

  const handleEditProduct = useCallback(
    (productId) => {
      // Navigate to edit product
      router.push(`/dashboard/products/edit/${productId}`);
    },
    [router],
  );

  const handleViewProduct = useCallback(
    (productId) => {
      // Navigate to view product
      router.push(`/dashboard/products/view/${productId}`);
    },
    [router],
  );

  const handleStockIn = useCallback(
    (productId) => {
      const product = transformedProducts.find((p) => p.id === productId);
      setProductForStockIn(product);
      setShowStockInDrawer(true);
    },
    [transformedProducts],
  );

  const handleStockInSuccess = useCallback(
    (message) => {
      // Show success message
      showSuccess(message);
    },
    [showSuccess],
  );

  const handleCloseStockInDrawer = useCallback(() => {
    setShowStockInDrawer(false);
    setProductForStockIn(null);
  }, []);

  const handleDeleteProduct = useCallback(
    (productId) => {
      const product = transformedProducts.find((p) => p.id === productId);
      setProductToDelete({
        id: productId,
        name: product?.name || t("products.product"),
      });
      setShowDeleteModal(true);
    },
    [transformedProducts],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    try {
      const result = await dispatch(
        deleteProduct({
          productId: productToDelete.id,
          storeId: storeId,
        }),
      );

      if (result.payload?.success) {
        setDeletedProductName(productToDelete.name);
        setShowDeleteSuccessModal(true);
      }

      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (error) {
    } finally {
      setIsDeleting(false);
    }
  }, [productToDelete, storeId, dispatch]);

  const handleCancelDelete = useCallback(() => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  }, []);

  // Save view mode - memoized callback
  const handleViewModeChange = useCallback(
    (mode) => {
      dispatch(setViewMode(mode));
      localStorage.setItem("products-view-mode", mode);
    },
    [dispatch],
  );

  return (
    <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
      <Sidebar onStoreChange={handleStoreChange} />

      {/* Main content */}
      <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
        {/* Header */}
        <Header
          title={t("products.title")}
          description={t("products.description")}
        />

        {/* Main content */}
        <div className="flex-1 p-5">
          <div className="max-w-8xl mx-auto">
            {/* Loading */}
            {isLoading && transformedProducts.length === 0 && (
              <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-8 mb-6">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                      {t("common.loadingData")}
                    </h2>
                    <p className="text-[rgb(var(--color-text-secondary))]">
                      {t("common.loading")}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {/* Search and filter - visible after initial load or when there are products */}
            {(!isLoading || transformedProducts.length > 0) && (
              <div className="mb-3">
                <div className="flex justify-between items-center lg:flex-row gap-4 mb-0">
                  {/* Search - Left side */}
                  <div className="flex">
                    <Input
                      type="text"
                      placeholder={`${t("common.search")} ${t("products.title").toLowerCase()}...`}
                      value={searchValue}
                      onChange={(value) => handleSearch(value)}
                      leftIcon={Search}
                      className="w-100"
                    />
                  </div>

                  {/* Filters and Action buttons - Right side */}
                  <div className="flex gap-3 items-center">
                    {/* Visibility Filter */}
                    <div className="min-w-[150px]">
                      <Select
                        placeholder={t("products.visibility")}
                        value={visibility}
                        onChange={handleVisibilityChange}
                        options={getVisibilityOptions(t)}
                        searchable={false}
                      />
                    </div>

                    <div className="min-w-[180px]">
                      <Select
                        placeholder={t("products.category")}
                        value={category}
                        onChange={handleCategoryChange}
                        options={categoryOptions}
                        searchable={true}
                        disabled={categoriesLoading}
                        clearable
                      />
                    </div>

                    <div className="min-w-[180px]">
                      <Select
                        placeholder={t("common.sortBy")}
                        value={sortBy}
                        onChange={handleSortByChange}
                        options={getSortOptions(t)}
                        clearable={true}
                      />
                    </div>

                    {/* View toggle */}
                    <div className="flex bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                      <button
                        onClick={() => handleViewModeChange("table")}
                        className={`px-3 cursor-pointer py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                          viewMode === "table"
                            ? "bg-[rgb(var(--color-primary))] text-white"
                            : "text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]"
                        }`}
                      >
                        <List className="w-4 h-4" />
                        {t("common.tableView")}
                      </button>
                      <button
                        onClick={() => handleViewModeChange("card")}
                        className={`px-3 cursor-pointer py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${viewMode === "card" ? "bg-[rgb(var(--color-primary))] text-white" : "text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]"}`}
                      >
                        <Grid3X3 className="w-4 h-4" />
                        {t("common.cardView")}
                      </button>
                    </div>

                    <Button
                      variant="primary"
                      onClick={handleAddProduct}
                      leftIcon={Plus}
                    >
                      Add Product
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!isLoading && transformedProducts.length === 0 && (
              <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))]">
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 bg-[rgb(var(--color-bg-tertiary))] rounded-full flex items-center justify-center mb-4">
                    <Package className="w-8 h-8 text-[rgb(var(--color-text-tertiary))]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                    {t("products.noProducts")}
                  </h3>
                  <p className="text-[rgb(var(--color-text-secondary))] text-center max-w-md">
                    {searchValue
                      ? t("common.noResults")
                      : t("products.description")}
                  </p>
                  <div className="pt-4">
                    <Button
                      variant="primary"
                      onClick={handleAddProduct}
                      leftIcon={Plus}
                    >
                      {t("products.addProduct")}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Products list */}
            {transformedProducts.length > 0 && (
              <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] overflow-hidden">
                <div
                  className="h-[calc(100vh-200px)] overflow-y-auto"
                  ref={scrollRef}
                >
                  {viewMode === "table" ? (
                    <div className="h-full">
                      <ProductTable
                        products={transformedProducts}
                        onEdit={handleEditProduct}
                        onDelete={handleDeleteProduct}
                        onViewDetails={handleViewProduct}
                        onStockIn={handleStockIn}
                        loading={isLoading}
                        emptyMessage={t("products.noProducts")}
                        hasMore={pagination.hasNextPage}
                        onLoadMore={handleLoadMore}
                        isLoadingMore={isLoadingMore}
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {transformedProducts.map((product) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            onEdit={handleEditProduct}
                            onDelete={handleDeleteProduct}
                            onViewDetails={handleViewProduct}
                            onStockIn={handleStockIn}
                          />
                        ))}

                        {/* Infinite scroll loading */}
                        {isLoadingMore && (
                          <div className="col-span-full flex items-center justify-center py-8">
                            <div className="flex items-center gap-3">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[rgb(var(--color-primary))]"></div>
                              <span className="text-sm text-[rgb(var(--color-text-secondary))]">
                                {t("products.loadingMore")}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="bg-[rgb(var(--color-bg-tertiary))] border-t border-[rgb(var(--color-border-primary))] px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-[rgb(var(--color-text-secondary))]">
                      {pagination.hasNextPage ? (
                        <>
                          Showing{" "}
                          <span className="font-semibold text-[rgb(var(--color-text-primary))]">
                            {transformedProducts.length}
                          </span>{" "}
                          products
                          <span className="ml-2 text-xs text-[rgb(var(--color-primary))]">
                            • Scroll down to load more
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="font-semibold text-[rgb(var(--color-text-primary))]">
                            {t("products.showingProducts", {
                              count: transformedProducts.length,
                            })}
                          </span>
                          <span className="ml-2 text-xs text-[rgb(var(--color-text-tertiary))]">
                            • {t("products.noMore")}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="text-sm text-[rgb(var(--color-text-secondary))]" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      <ProductDeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        productName={productToDelete?.name}
        isLoading={isDeleting}
      />

      {/* Delete success modal */}
      <ProductDeleteSuccessModal
        isOpen={showDeleteSuccessModal}
        onClose={() => setShowDeleteSuccessModal(false)}
        productName={deletedProductName}
      />

      {/* Error modal */}
      <ProductErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title={errorDetails?.title}
        message={errorDetails?.message}
        details={errorDetails?.details}
      />

      {/* Stock in drawer */}
      <StockInDrawer
        isOpen={showStockInDrawer}
        onClose={handleCloseStockInDrawer}
        item={productForStockIn}
        onSuccess={handleStockInSuccess}
        type="product"
      />
    </div>
  );
};

export default ProductsPage;
