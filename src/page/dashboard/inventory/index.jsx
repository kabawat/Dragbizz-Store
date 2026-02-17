"use client";
import { Grid3X3, List, Package, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";
// Import inventory components
import { InventoryCard, InventoryTable } from "@/components/inventory";
import { Button, Input, StockInDrawer } from "@/components/ui";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useTranslation } from "@/hooks/useTranslation";

// Import services
import inventoryService from "@/service/retailer/inventory.service";
import { useAppSelector } from "@/store/hooks";

const InventoryPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const { showSuccess, showError } = useGlobalToast();
  const storeId =
    selectedStore?.storeId || "";

  // State management
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [selectedInventories, setSelectedInventories] = useState([]);
  const [viewMode, setViewMode] = useState("table");
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  // Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [inventoryToDelete, setInventoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Stock In Drawer
  const [showStockInDrawer, setShowStockInDrawer] = useState(false);
  const [inventoryForStockIn, setInventoryForStockIn] = useState(null);

  // Refs
  const scrollRef = useRef(null);
  const hasFetchedRef = useRef({
    storeId: null,
    searchValue: null,
    fetched: false,
  });
  const isFetchingRef = useRef(false);
  const lastFetchKeyRef = useRef(null);

  // Fetch inventories
  const fetchInventories = useCallback(
    async (page = 1, append = false) => {
      if (!storeId) return;

      // Create a unique key for this fetch
      const fetchKey = `${storeId}-${searchValue}-${page}-${append}`;

      // Prevent duplicate calls with same parameters
      if (lastFetchKeyRef.current === fetchKey) {
        return;
      }

      // For initial load (page 1, not append), check if we've already fetched
      if (page === 1 && !append) {
        const lastFetched = hasFetchedRef.current;
        if (
          lastFetched.fetched &&
          lastFetched.storeId === storeId &&
          lastFetched.searchValue === searchValue &&
          !isFetchingRef.current
        ) {
          return;
        }
      }

      // Prevent call if already fetching
      if (isFetchingRef.current && !append) {
        return;
      }

      lastFetchKeyRef.current = fetchKey;
      isFetchingRef.current = true;

      try {
        if (page === 1) {
          setLoading(true);
        } else {
          setIsLoadingMore(true);
        }

        const params = {
          store: storeId,
          page: page,
          limit: 20,
          search: searchValue || undefined,
        };

        const response = await inventoryService.getInventories(params);

        if (response.success) {
          const newInventories =
            response.data?.inventories || response.data || [];

          if (append) {
            setInventories((prev) => [...prev, ...newInventories]);
          } else {
            setInventories(newInventories);
            // Update fetch ref for initial load
            hasFetchedRef.current = {
              storeId,
              searchValue,
              fetched: true,
            };
          }

          setHasMore(response.data?.pagination?.hasNext || false);
        }
      } catch (error) {
        showError(error?.message || t("common.failedToLoad"));
      } finally {
        setLoading(false);
        setIsLoadingMore(false);
        isFetchingRef.current = false;
      }
    },
    [storeId, searchValue, showError, t]
  );

  // Fetch inventories on mount or when dependencies change
  useEffect(() => {
    if (!storeId) return;

    const lastFetched = hasFetchedRef.current;
    const storeChanged = lastFetched.storeId !== storeId;
    const searchChanged = lastFetched.searchValue !== searchValue;

    if (storeChanged || searchChanged) {
      hasFetchedRef.current = {
        storeId: null,
        searchValue: null,
        fetched: false,
      };
      lastFetchKeyRef.current = null;
    }

    if (
      !storeChanged &&
      !searchChanged &&
      lastFetched.fetched &&
      lastFetched.storeId === storeId &&
      lastFetched.searchValue === searchValue
    ) {
      return;
    }

    // Prevent call if already fetching (but allow if store/search changed)
    if (isFetchingRef.current && !storeChanged && !searchChanged) {
      return;
    }

    fetchInventories(1, false);
  }, [storeId, searchValue, fetchInventories]);

  // Load more function
  const handleLoadMore = useCallback(async () => {
    if (hasMore && !isLoadingMore && !isFetchingRef.current) {
      const nextPage = Math.floor(inventories.length / 20) + 1;
      await fetchInventories(nextPage, true);
    }
  }, [hasMore, isLoadingMore, inventories.length, fetchInventories]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current || isLoadingMore || !hasMore) return;

      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const threshold = 100;

      if (scrollTop + clientHeight >= scrollHeight - threshold) {
        handleLoadMore();
      }
    };

    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener("scroll", handleScroll);
      return () => scrollElement.removeEventListener("scroll", handleScroll);
    }
  }, [isLoadingMore, hasMore, handleLoadMore]);

  // Search
  const handleSearch = (value) => {
    setSearchValue(value);
  };

  const handleAddStock = () => {
    router.push("/dashboard/stock/add");
  };

  const handleEditStock = (inventoryId) => {
    router.push(`/dashboard/stock/edit/${inventoryId}`);
  };

  const handleViewStock = (inventoryId) => {
    router.push(`/dashboard/stock/view/${inventoryId}`);
  };

  const handleStockIn = (inventoryId) => {
    const inventory = inventories.find((i) => i.id === inventoryId);
    setInventoryForStockIn(inventory);
    setShowStockInDrawer(true);
  };

  const handleStockInSuccess = (message) => {
    // Show success message
    showSuccess(message);
    // Refresh the inventory list
    hasFetchedRef.current = {
      storeId: null,
      searchValue: null,
      fetched: false,
    };
    lastFetchKeyRef.current = null;
    fetchInventories(1, false);
  };

  const handleCloseStockInDrawer = () => {
    setShowStockInDrawer(false);
    setInventoryForStockIn(null);
  };

  // Selection handlers
  const _handleInventorySelect = (inventoryIds) => {
    const idsArray = Array.isArray(inventoryIds)
      ? inventoryIds
      : [inventoryIds];
    setSelectedInventories(idsArray);
  };

  const _handleCardSelect = (inventoryId) => {
    setSelectedInventories((prev) =>
      prev.includes(inventoryId)
        ? prev.filter((id) => id !== inventoryId)
        : [...prev, inventoryId]
    );
  };

  const _handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedInventories(inventories.map((i) => i.id));
    } else {
      setSelectedInventories([]);
    }
  };

  const handleDeleteStock = (inventoryId) => {
    const inventory = inventories.find((i) => i.id === inventoryId);
    setInventoryToDelete({
      id: inventoryId,
      name: inventory?.product?.name || "Stock",
    });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!inventoryToDelete) return;

    try {
      setIsDeleting(true);
      await inventoryService.deleteInventory(inventoryToDelete.id);

      // Remove from local state
      setInventories((prev) =>
        prev.filter((i) => i.id !== inventoryToDelete.id)
      );
      setSelectedInventories((prev) =>
        prev.filter((id) => id !== inventoryToDelete.id)
      );

      setShowDeleteModal(false);
      setInventoryToDelete(null);
    } catch (_error) {
      showError(t("common.failedToLoad"));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicate = (_inventoryId) => { };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  return (
    <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
        {/* Header */}
        <Header
          title={t("inventory.title")}
          description={t("inventory.description")}
        />

        {/* Main content */}
        <div className="flex-1 p-5">
          <div className="max-w-8xl mx-auto">
            {/* Loading */}
            {loading && inventories.length === 0 && (
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

            {/* Search and Filter Card */}
            {inventories.length > 0 && (
              <div className="mb-3">
                <div className="flex justify-between items-center lg:flex-row gap-4 mb-0">
                  {/* Search */}
                  <div className="w-100">
                    <Input
                      type="text"
                      placeholder={`${t("common.search")} ${t("inventory.title").toLowerCase()}...`}
                      value={searchValue}
                      onChange={(e) => handleSearch(e.target.value)}
                      leftIcon={Search}
                      className="w-100"
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3">
                    {/* View toggle */}
                    <div className="flex bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                      <button
                        onClick={() => handleViewModeChange("table")}
                        className={`px-3 cursor-pointer py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${viewMode === "table"
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
                      onClick={handleAddStock}
                      leftIcon={Plus}
                    >
                      {t("inventory.addStock")}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && inventories.length === 0 && (
              <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))]">
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 bg-[rgb(var(--color-bg-tertiary))] rounded-full flex items-center justify-center mb-4">
                    <Package className="w-8 h-8 text-[rgb(var(--color-text-tertiary))]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                    {t("common.noData")}
                  </h3>
                  <p className="text-[rgb(var(--color-text-secondary))] text-center max-w-md">
                    {t("inventory.description")}
                  </p>
                  <div className="pt-4">
                    <Button
                      variant="primary"
                      onClick={handleAddStock}
                      leftIcon={Plus}
                    >
                      {t("inventory.addStock")}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Stock List */}
            {inventories.length > 0 && (
              <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] overflow-hidden">
                <div
                  className="h-[calc(100vh-200px)] overflow-y-auto"
                  ref={scrollRef}
                >
                  {viewMode === "table" ? (
                    <div className="h-full">
                      <InventoryTable
                        inventories={inventories}
                        onViewDetails={handleViewStock}
                        onEdit={handleEditStock}
                        onDelete={handleDeleteStock}
                        onDuplicate={handleDuplicate}
                        onStockIn={handleStockIn}
                        loading={loading}
                        hasMore={hasMore}
                        onLoadMore={handleLoadMore}
                        isLoadingMore={isLoadingMore}
                        emptyMessage={t("common.noData")}
                      />
                    </div>
                  ) : (
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {inventories.map((inventory) => (
                          <InventoryCard
                            key={inventory.id}
                            inventory={inventory}
                            onViewDetails={handleViewStock}
                            onEdit={handleEditStock}
                            onDelete={handleDeleteStock}
                            onDuplicate={handleDuplicate}
                            onStockIn={handleStockIn}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Fixed Footer */}
                <div className="bg-[rgb(var(--color-bg-tertiary))] border-t border-[rgb(var(--color-border-primary))] px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-[rgb(var(--color-text-secondary))]">
                      {hasMore ? (
                        <>
                          Showing{" "}
                          <span className="font-semibold text-[rgb(var(--color-text-primary))]">
                            {inventories.length}
                          </span>{" "}
                          stock items
                          <span className="ml-2 text-xs text-[rgb(var(--color-primary))]">
                            • Scroll down to load more
                          </span>
                        </>
                      ) : (
                        <>
                          Showing{" "}
                          <span className="font-semibold text-[rgb(var(--color-text-primary))]">
                            {inventories.length}
                          </span>{" "}
                          stock items
                          <span className="ml-2 text-xs text-[rgb(var(--color-text-tertiary))]">
                            • No more stock items
                          </span>
                        </>
                      )}
                    </div>
                    <div className="text-sm text-[rgb(var(--color-text-secondary))]">
                      {selectedInventories.length > 0 && (
                        <span className="font-semibold text-[rgb(var(--color-primary))]">
                          {selectedInventories.length} selected
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl border border-[rgb(var(--color-border-primary))]">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                Delete Stock
              </h3>
              <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-6">
                Are you sure you want to delete "{inventoryToDelete?.name}"?
                This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="flex-1"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stock In Drawer */}
      <StockInDrawer
        isOpen={showStockInDrawer}
        onClose={handleCloseStockInDrawer}
        item={inventoryForStockIn}
        onSuccess={handleStockInSuccess}
        type="inventory"
      />
    </div>
  );
};

export default InventoryPage;
