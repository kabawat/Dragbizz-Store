"use client";
import { Mic } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import {
  AddSupplierDrawer,
  DeleteSupplierModal,
  EditSupplierDrawer,
  SupplierCard,
  SupplierEmptyState,
  SupplierHeaderActions,
  SupplierTable,
  VoiceAISupplier,
} from "@/components/supplier";
import SupplierDownloadDrawer from "@/components/supplier/SupplierDownloadDrawer";
import { Button, Input, Select, SideDrawer } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  deleteSupplier,
  getSuppliers,
  setViewMode,
} from "@/store/slices/suppliersSlice";

const SuppliersPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Get data from Redux store
  const { suppliers, isLoading, error, pagination, viewMode } = useAppSelector(
    (state) => state.suppliers
  );

  const { selectedStore } = useAppSelector((state) => state.profile);

  // Handle error display
  useEffect(() => {
    if (error) {
      setErrorDetails({
        title: t("suppliers.errorLoading"),
        message: error,
        details: t("common.tryAgain"),
      });
      setShowErrorModal(true);
    }
  }, [error, t]);

  useEffect(() => {
    const savedViewMode = localStorage.getItem("suppliers-view-mode");
    if (
      savedViewMode &&
      (savedViewMode === "table" || savedViewMode === "card")
    ) {
      dispatch(setViewMode(savedViewMode));
    }
  }, [dispatch]);

  // Local state
  const [searchValue, setSearchValue] = useState("");
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  // Filters
  const [accountStatus, setAccountStatus] = useState("");
  const [riskLevel, setRiskLevel] = useState("");
  const [isActive, setIsActive] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [deletedSupplierName, setDeletedSupplierName] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const scrollRef = useRef(null);
  const menuRefs = useRef({});
  const lastFetchRef = useRef(null);

  // Drawer state
  const [showAddSupplierDrawer, setShowAddSupplierDrawer] = useState(false);
  const [showEditSupplierDrawer, setShowEditSupplierDrawer] = useState(false);
  const [editingSupplierId, setEditingSupplierId] = useState(null);
  const [showDownloadDrawer, setShowDownloadDrawer] = useState(false);
  const [showVoiceAIDrawer, setShowVoiceAIDrawer] = useState(false);
  const [selectedSupplierIds, setSelectedSupplierIds] = useState([]);

  // Global page Hotkeys
  useCommonHotkeys({
    onNew: () => setShowAddSupplierDrawer(true),
    onViewTable: () => handleViewModeChange("table"),
    onViewGrid: () => handleViewModeChange("card"),
    onDownload: () => setShowDownloadDrawer(true),
    onVoiceAI: () => setShowVoiceAIDrawer(true),
    onSearch: () => {
      // Focus the nearest input element which is likely the search bar
      const searchInput = document.querySelector('input[placeholder*="search"]');
      if (searchInput) searchInput.focus();
    },
    onClose: () => {
      if (showAddSupplierDrawer) setShowAddSupplierDrawer(false);
      if (showEditSupplierDrawer) setShowEditSupplierDrawer(false);
      if (showVoiceAIDrawer) setShowVoiceAIDrawer(false);
      if (showDownloadDrawer) setShowDownloadDrawer(false);
      if (showDeleteModal) setShowDeleteModal(false);
    },
    onBack: () => router.push("/dashboard"),
  });

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        openMenuId &&
        menuRefs.current[openMenuId] &&
        !menuRefs.current[openMenuId].contains(event.target)
      ) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchValue]);

  // Fetch suppliers on component mount and when search changes
  useEffect(() => {
    const fetchSuppliers = async () => {
      const storeId =
        selectedStore?.storeId;
      const params = {
        store: storeId,
        search: debouncedSearch,
        limit: 10,
        nextCursor: null,
        isFreshLoad: true,
        accountStatus: accountStatus || undefined,
        riskLevel: riskLevel || undefined,
        isActive: isActive === "" ? undefined : isActive,
      };

      // Create a unique key for this fetch
      const fetchKey = `${storeId}-${debouncedSearch}-${accountStatus}-${riskLevel}-${isActive}`;

      // Prevent duplicate calls with same parameters
      if (lastFetchRef.current === fetchKey) {
        return;
      }

      lastFetchRef.current = fetchKey;
      await dispatch(getSuppliers(params));
    };

    // Only fetch if selectedStore is available and has a valid ID
    if (
      selectedStore &&
      (selectedStore.storeId || selectedStore._id || selectedStore.id)
    ) {
      fetchSuppliers();
    }
  }, [
    selectedStore,
    debouncedSearch,
    accountStatus,
    riskLevel,
    isActive,
    dispatch,
  ]);

  // Infinite scroll logic - load more suppliers
  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !pagination.hasNextPage) return;

    setIsLoadingMore(true);

    try {
      const storeId =
        selectedStore?.storeId;
      const params = {
        store: storeId,
        search: debouncedSearch,
        limit: 10,
        nextCursor: pagination.nextCursor,
        isFreshLoad: false,
        accountStatus: accountStatus || undefined,
        riskLevel: riskLevel || undefined,
        isActive: isActive === "" ? undefined : isActive,
      };

      await dispatch(getSuppliers(params));
    } catch (_error) {
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    isLoadingMore,
    pagination.hasNextPage,
    pagination.nextCursor,
    selectedStore,
    debouncedSearch,
    accountStatus,
    riskLevel,
    isActive,
    dispatch,
  ]);

  // Infinite scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current || isLoadingMore || !pagination.hasNextPage)
        return;

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
  }, [isLoadingMore, pagination.hasNextPage, handleLoadMore]);

  const handleStoreChange = (_storeObject) => {
    // Store change is handled by Redux, no need for local state
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchValue(value);
  };

  const handleAddSupplier = () => {
    setShowAddSupplierDrawer(true);
  };

  const handleSupplierSuccess = async () => {
    // Refresh suppliers list after successful creation
    const storeId =
      selectedStore?.storeId;
    const params = {
      store: storeId,
      search: searchValue,
      limit: 10,
      nextCursor: null,
      isFreshLoad: true,
    };
    await dispatch(getSuppliers(params));
  };

  const handleEditSupplier = (supplierId) => {
    setEditingSupplierId(supplierId);
    setShowEditSupplierDrawer(true);
  };

  const handleViewSupplier = (supplierId) => {
    router.push(`/dashboard/suppliers/${supplierId}`);
  };

  const handlePrintSupplier = (supplierId) => {
    router.push(`/dashboard/suppliers/${supplierId}?print=true`);
  };

  // Menu action handler
  const _handleMenuAction = (supplierId, action) => {
    setOpenMenuId(null);
    switch (action) {
      case "view":
        handleViewSupplier(supplierId);
        break;
      case "edit":
        handleEditSupplier(supplierId);
        break;
      case "delete":
        handleDeleteSupplier(supplierId);
        break;
      default:
        break;
    }
  };

  const handleDeleteSupplier = (supplierId) => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    setSupplierToDelete({ id: supplierId, name: supplier?.name || "Supplier" });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!supplierToDelete) return;

    setIsDeleting(true);
    try {
      const storeId =
        selectedStore?.storeId;
      const result = await dispatch(
        deleteSupplier({
          supplierId: supplierToDelete.id,
          storeId: storeId,
        })
      );

      if (result.payload?.success) {
        setDeletedSupplierName(supplierToDelete.name);
        setShowDeleteSuccessModal(true);
      }

      setShowDeleteModal(false);
      setSupplierToDelete(null);
    } catch (_error) {
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setSupplierToDelete(null);
  };

  // Save view mode to localStorage
  const handleViewModeChange = (mode) => {
    dispatch(setViewMode(mode));
    localStorage.setItem("suppliers-view-mode", mode);
  };

  return (
    <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
      <Sidebar onStoreChange={handleStoreChange} />

      {/* Main Content Area */}
      <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
        {/* Header */}
        <Header
          title={t("suppliers.title")}
          description={t("suppliers.description")}
        />

        {/* Main Content */}
        <div className="flex-1 p-5">
          <div className="max-w-8xl mx-auto">
            {/* Search and actions */}
            <SupplierHeaderActions
              searchValue={searchValue}
              onSearchChange={(value) => handleSearch(value)}
              accountStatus={accountStatus}
              onAccountStatusChange={setAccountStatus}
              riskLevel={riskLevel}
              onRiskLevelChange={setRiskLevel}
              isActive={isActive}
              onIsActiveChange={setIsActive}
              suppliersCount={suppliers.length}
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
              onDownloadClick={() => setShowDownloadDrawer(true)}
              onVoiceAIClick={() => setShowVoiceAIDrawer(true)}
              onAddSupplierClick={handleAddSupplier}
            />

            {isLoading && suppliers.length === 0 && (
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

            {/* Empty State */}
            {!isLoading && suppliers.length === 0 && (
              <SupplierEmptyState
                error={error}
                onAddSupplier={handleAddSupplier}
              />
            )}

            {/* Suppliers List */}
            {suppliers.length > 0 && (
              <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] overflow-hidden">
                <div
                  className="h-[calc(100vh-200px)] overflow-y-auto"
                  ref={scrollRef}
                >
                  {viewMode === "table" ? (
                    <div className="h-full">
                      <SupplierTable
                        suppliers={suppliers}
                        onEdit={handleEditSupplier}
                        onDelete={handleDeleteSupplier}
                        onViewDetails={handleViewSupplier}
                        onPrint={handlePrintSupplier}
                        loading={isLoading}
                        emptyMessage={t("suppliers.noSuppliers")}
                        hasMore={pagination.hasNextPage}
                        onLoadMore={handleLoadMore}
                        isLoadingMore={isLoadingMore}
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {suppliers.map((supplier) => (
                          <SupplierCard
                            key={supplier.id}
                            supplier={supplier}
                            onEdit={handleEditSupplier}
                            onDelete={handleDeleteSupplier}
                            onViewDetails={handleViewSupplier}
                            onPrint={handlePrintSupplier}
                            onSelect={(id, checked) => {
                              if (checked) {
                                setSelectedSupplierIds((prev) =>
                                  prev.includes(id) ? prev : [...prev, id]
                                );
                              } else {
                                setSelectedSupplierIds((prev) =>
                                  prev.filter((x) => x !== id)
                                );
                              }
                            }}
                            selected={selectedSupplierIds.includes(supplier.id)}
                          />
                        ))}

                        {/* Infinite Scroll Loading for Card View */}
                        {isLoadingMore && (
                          <div className="col-span-full flex items-center justify-center py-8">
                            <div className="flex items-center gap-3">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[rgb(var(--color-primary))]"></div>
                              <span className="text-sm text-[rgb(var(--color-text-secondary))]">
                                {t("common.loading")}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Fixed Footer */}
                <div className="bg-[rgb(var(--color-bg-tertiary))] border-t border-[rgb(var(--color-border-primary))] px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-[rgb(var(--color-text-secondary))]">
                      {pagination.hasNextPage ? (
                        <>
                          Showing{" "}
                          <span className="font-semibold text-[rgb(var(--color-text-primary))]">
                            {suppliers.length}
                          </span>{" "}
                          suppliers
                          <span className="ml-2 text-xs text-[rgb(var(--color-primary))]">
                            • Scroll down to load more
                          </span>
                        </>
                      ) : (
                        <>
                          Showing{" "}
                          <span className="font-semibold text-[rgb(var(--color-text-primary))]">
                            {suppliers.length}
                          </span>{" "}
                          suppliers
                          <span className="ml-2 text-xs text-[rgb(var(--color-text-tertiary))]">
                            • No more suppliers
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

      {/* Delete Modals */}
      <DeleteSupplierModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        supplierToDelete={supplierToDelete}
        onConfirmDelete={handleConfirmDelete}
        isDeleting={isDeleting}
        showSuccessModal={showDeleteSuccessModal}
        onCloseSuccess={() => setShowDeleteSuccessModal(false)}
        deletedSupplierName={deletedSupplierName}
      />

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-[9999]">
          <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4">
              {errorDetails?.title}
            </h3>
            <p className="text-[rgb(var(--color-text-secondary))] mb-6">
              {errorDetails?.message}
            </p>
            <Button variant="primary" onClick={() => setShowErrorModal(false)}>
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Add Supplier Drawer */}
      <AddSupplierDrawer
        isOpen={showAddSupplierDrawer}
        onClose={() => setShowAddSupplierDrawer(false)}
        onSuccess={handleSupplierSuccess}
      />

      {/* Edit Supplier Drawer */}
      <EditSupplierDrawer
        isOpen={showEditSupplierDrawer}
        onClose={() => {
          setShowEditSupplierDrawer(false);
          setEditingSupplierId(null);
        }}
        supplierId={editingSupplierId}
        onSuccess={handleSupplierSuccess}
      />

      {/* Voice AI Drawer */}
      <SideDrawer
        isOpen={showVoiceAIDrawer}
        onClose={() => {
          setShowVoiceAIDrawer(false);
        }}
        title="Create Supplier with Voice AI"
        icon={Mic}
        description="Chat with AI to create a supplier naturally"
        width="w-full md:w-2/3 lg:w-1/2"
      >
        <div className="h-full">
          <VoiceAISupplier
            storeId={
              selectedStore?.storeId ||
              selectedStore?._id ||
              selectedStore?.id ||
              ""
            }
            onSuccess={(supplierData) => {
              handleSupplierSuccess(supplierData);
              setShowVoiceAIDrawer(false);
            }}
            onCancel={() => setShowVoiceAIDrawer(false)}
          />
        </div>
      </SideDrawer>

      <SupplierDownloadDrawer
        isOpen={showDownloadDrawer}
        onClose={() => setShowDownloadDrawer(false)}
      />
    </div>
  );
};

export default SuppliersPage;
