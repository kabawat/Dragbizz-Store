"use client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useApiResponse } from "@/hooks/useApiResponse";
import { paymentService } from "@/service/retailer";
import { removePayment, getPayments } from "@/store/slices/paymentsSlice";
import {
  PaymentHeaderActions,
  PaymentEmptyState,
  PaymentTable,
  PaymentGrid,
  DeletePaymentModal,
} from "@/components/payment";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";

const Payments = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { payments, stats, isLoading, error, currentFilter, pagination } =
    useAppSelector((state) => state.payments);
  const { selectedStore } = useAppSelector((state) => state.profile);
  const { can } = useModulePermissions("billing");
  const canCreate = can("create");
  const canEdit = can("edit");
  const canDelete = can("delete");
  const canRead = can("read");

  const [searchTerm, setSearchTerm] = useState("");
  const [_statusFilter, setStatusFilter] = useState("all");
  const [_supplierFilter, setSupplierFilter] = useState("all");
  const [_methodFilter, setMethodFilter] = useState("all");
  const [_dateRange, setDateRange] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  const [viewMode, setViewMode] = useState("card");
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedPayments, setSelectedPayments] = useState([]);
  const menuRefs = useRef({});
  const scrollRef = useRef(null);
  const lastFetchedStoreId = useRef(null);
  const hasFetched = useRef(false);

  // Get stable storeId
  const storeId = selectedStore?.storeId;

  // Handle view mode change
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem("payments-view-mode", mode);
  };

  // Load saved view mode
  useEffect(() => {
    const savedViewMode = localStorage.getItem("payments-view-mode");
    if (
      savedViewMode &&
      (savedViewMode === "table" || savedViewMode === "card")
    ) {
      setViewMode(savedViewMode);
    }
  }, []);

  // Hotkeys
  useCommonHotkeys({
    onNew: canCreate ? () => router.push("/dashboard/payments/create") : undefined,
    onViewTable: () => handleViewModeChange("table"),
    onViewGrid: () => handleViewModeChange("card"),
    onSearch: () => {
      const searchInput = document.querySelector('input[placeholder*="search"]');
      if (searchInput) searchInput.focus();
    },
    onClose: () => {
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

  // Handle menu toggle
  const handleMenuToggle = (paymentId) => {
    setOpenMenuId(openMenuId === paymentId ? null : paymentId);
  };

  // Handle menu action
  const handleMenuAction = (paymentId, action) => {
    const payment = payments.find((p) => (p._id || p.id) === paymentId);
    if (!payment) return;

    switch (action) {
      case "view":
        router.push(`/dashboard/payments/${payment._id || payment.id}`);
        break;
      case "edit":
        if (!canEdit) return;
        router.push(`/dashboard/payments/${payment._id || payment.id}/edit`);
        break;
      case "delete":
        if (!canDelete) return;
        handleDeletePayment(payment);
        break;
      default:
        break;
    }
    setOpenMenuId(null);
  };

  // Fetch payments on component mount or store change (only once per store)
  useEffect(() => {
    if (!storeId) return;

    // Prevent duplicate calls for the same store
    if (lastFetchedStoreId.current === storeId && hasFetched.current) {
      return;
    }

    // Prevent call if already loading
    if (isLoading) {
      return;
    }

    lastFetchedStoreId.current = storeId;
    hasFetched.current = true;

    dispatch(
      getPayments({
        store: storeId,
        limit: 20,
        page: 1,
      })
    );
  }, [dispatch, storeId, isLoading]);

  // Handle load more
  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !pagination?.hasNextPage) return;

    setIsLoadingMore(true);
    try {
      const storeId = selectedStore?.storeId;
      await dispatch(
        getPayments({
          store: storeId,
          limit: 20,
          page: pagination?.page ? pagination.page + 1 : 2,
        })
      );
    } catch (_error) {
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    isLoadingMore,
    pagination?.hasNextPage,
    pagination?.page,
    selectedStore,
    dispatch,
  ]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current || isLoadingMore || !pagination?.hasNextPage)
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
  }, [isLoadingMore, pagination?.hasNextPage, handleLoadMore]);

  // Handle filter changes
  const _handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case "status":
        setStatusFilter(value);
        break;
      case "supplier":
        setSupplierFilter(value);
        break;
      case "method":
        setMethodFilter(value);
        break;
      case "date":
        setDateRange(value);
        break;
      default:
        break;
    }
  };

  // Handle payment selection
  const handlePaymentSelect = (paymentId) => {
    setSelectedPayments((prev) => {
      if (prev.includes(paymentId)) {
        return prev.filter((id) => id !== paymentId);
      } else {
        return [...prev, paymentId];
      }
    });
  };

  // Handle delete payment
  const handleDeletePayment = (payment) => {
    setPaymentToDelete(payment);
    setShowDeleteModal(true);
  };

  const { execute: executeDelete } = useApiResponse();

  // Confirm delete
  const confirmDelete = async () => {
    if (paymentToDelete) {
      const storeId = selectedStore?.storeId;
      const paymentId = paymentToDelete._id || paymentToDelete.id;

      if (storeId && paymentId) {
        const result = await executeDelete(
          paymentService.deletePayment(paymentId, storeId),
          { message: "Payment deleted successfully" }
        );

        if (result?.success) {
          dispatch(removePayment(paymentId));
          setShowDeleteModal(false);
          setPaymentToDelete(null);
        }
      }
    }
  };

  return (
    <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
        {/* Header */}
        <Header
          title={t("payments.title")}
          description={t("payments.description")}
        />

        {/* Main Content */}
        <div className="flex-1 p-5">
          <div className="max-w-8xl mx-auto">
            {/* Loading */}
            {isLoading && payments.length === 0 && (
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

            {/* Search and filter */}
            {payments.length > 0 && (
              <PaymentHeaderActions
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
              />
            )}

            {/* Empty State */}
            {!isLoading && payments.length === 0 && (
              <PaymentEmptyState />
            )}

            {/* Payments list */}
            {payments.length > 0 && (
              <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] overflow-hidden">
                <div
                  className="h-[calc(100vh-200px)] overflow-y-auto"
                  ref={scrollRef}
                >
                  {viewMode === "table" ? (
                    <PaymentTable
                      payments={payments}
                      isLoadingMore={isLoadingMore}
                      menuRefs={menuRefs}
                      openMenuId={openMenuId}
                      handleMenuToggle={handleMenuToggle}
                      handleMenuAction={handleMenuAction}
                      canEdit={canEdit}
                      canDelete={canDelete}
                    />
                  ) : (
                    <PaymentGrid
                      payments={payments}
                      isLoadingMore={isLoadingMore}
                      selectedPayments={selectedPayments}
                      handlePaymentSelect={handlePaymentSelect}
                      menuRefs={menuRefs}
                      openMenuId={openMenuId}
                      handleMenuToggle={handleMenuToggle}
                      handleMenuAction={handleMenuAction}
                      canEdit={canEdit}
                      canDelete={canDelete}
                    />
                  )}
                </div>

                {/* Footer */}
                <div className="bg-[rgb(var(--color-bg-tertiary))] border-t border-[rgb(var(--color-border-primary))] px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-[rgb(var(--color-text-secondary))]">
                      {pagination?.hasNextPage ? (
                        <>
                          Showing{" "}
                          <span className="font-semibold text-[rgb(var(--color-text-primary))]">
                            {payments.length}
                          </span>{" "}
                          payments
                          <span className="ml-2 text-xs text-[rgb(var(--color-primary))]">
                            • Scroll down to load more
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="font-semibold text-[rgb(var(--color-text-primary))]">
                            {t("payments.showingPayments", {
                              count: payments.length,
                            })}
                          </span>
                          <span className="ml-2 text-xs text-[rgb(var(--color-text-tertiary))]">
                            • {t("payments.noMore")}
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

      <DeletePaymentModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        paymentToDelete={paymentToDelete}
        onConfirmDelete={confirmDelete}
      />
    </div>
  );
};

export default Payments;
