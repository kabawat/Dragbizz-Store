"use client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { CreditCard, Plus } from "lucide-react";
import { EmptyState, PageLoader } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useApiResponse } from "@/hooks/useApiResponse";
import { paymentService } from "@/service/retailer";
import { removePayment, getPayments } from "@/store/slices/paymentsSlice";
import {
  PaymentHeaderActions,
  PaymentTable,
  PaymentGrid,
  DeletePaymentModal,
} from "@/components/payment";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";

const Payments = () => {
  const { t } = useTranslation();

  useDashboardHeader(t("payments.title"), t("payments.description"));
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { payments, isLoading, isFetchingMore, error, pagination } = useAppSelector((state) => state.payments);
  const { selectedStore } = useAppSelector((state) => state.profile);
  const {
    can,
    create: canCreate,
    edit: canEdit,
    delete: canDelete,
    loading: permissionsLoading
  } = useModulePermissions("billing");

  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  const [viewMode, setViewMode] = useState("card");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedPayments, setSelectedPayments] = useState([]);
  const menuRefs = useRef({});
  const scrollRef = useRef(null);
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

  // Fetch payments with debounce + deduplication
  const fetchPayments = useCallback(async (isFresh = true) => {
    if (!storeId) return;

    dispatch(
      getPayments({
        store: storeId,
        search: searchTerm || undefined,
        limit: 20,
        page: isFresh ? 1 : (pagination?.page ? pagination.page + 1 : 2),
        isFreshLoad: isFresh,
      })
    );
    hasFetched.current = true;
  }, [dispatch, storeId, searchTerm, pagination?.page]);

  // Debounced trigger for fresh loads
  useEffect(() => {
    if (!storeId) return;

    const timer = setTimeout(() => {
      fetchPayments(true);
    }, 350);

    return () => clearTimeout(timer);
  }, [storeId, searchTerm]);

  // Handle load more
  const handleLoadMore = useCallback(async () => {
    if (isFetchingMore || !pagination?.hasNextPage) return;
    await fetchPayments(false);
  }, [isFetchingMore, pagination?.hasNextPage, fetchPayments]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current || isFetchingMore || !pagination?.hasNextPage)
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
  }, [isFetchingMore, pagination?.hasNextPage, handleLoadMore]);

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
    <div className="p-5">
      <div className="max-w-8xl mx-auto">
        {/* Search and filter */}
        <PaymentHeaderActions
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
        />

        {isLoading && payments.length === 0 && !error && (<PageLoader />)}

        {!isLoading && payments.length === 0 && (
          <EmptyState
            className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))]"
            icon={CreditCard}
            title={t("payments.noPayments")}
            description={searchTerm ? t("payments.noResultsDescription") : t("payments.emptyDescription")}
            actionButton={!searchTerm && canCreate ? {
              label: t("payments.createPayment"),
              onClick: () => router.push("/dashboard/payments/create"),
              icon: Plus
            } : null}
          />
        )}

        {/* Payments list */}
        {payments.length > 0 && (
          <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] overflow-hidden">
            <div className="h-[calc(100vh-200px)] overflow-y-auto" ref={scrollRef} >
              {viewMode === "table" ? (
                <PaymentTable
                  payments={payments}
                  isLoadingMore={isFetchingMore}
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
                  isLoadingMore={isFetchingMore}
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
