"use client";
import { Download, FileText, Grid3X3, List, Plus, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import {
  InvoiceCard,
  InvoiceDeleteConfirmModal,
  InvoiceDownloadDrawer,
  InvoiceTable,
  ReleaseInvoiceModal,
  UpdatePaymentStatusModal,
} from "@/components/invoice";
import { Button, Input, Select } from "@/components/ui";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getInvoices, setViewMode } from "@/store/slices/invoicesSlice";

const InvoicesPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { showError } = useGlobalToast();

  // Redux store data
  const { invoices, isLoading, error, pagination, viewMode } = useAppSelector(
    (state) => state.invoices
  );

  const { selectedStore } = useAppSelector((state) => state.profile);

  // Local state
  const [invoiceToUpdatePayment, setInvoiceToUpdatePayment] = useState(null);
  const [invoiceToRelease, setInvoiceToRelease] = useState(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showDownloadDrawer, setShowDownloadDrawer] = useState(false);

  // Filter states (matching backend parameters)
  const [paymentStatus, setPaymentStatus] = useState("");
  const [invoiceStatus, setInvoiceStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const scrollRef = useRef(null);

  // Error display
  useEffect(() => {
    if (error) {
      showError(error || t("common.failedToLoad"));
    }
  }, [error, showError, t]);

  useEffect(() => {
    const savedViewMode = localStorage.getItem("invoices-view-mode");
    if (
      savedViewMode &&
      (savedViewMode === "table" || savedViewMode === "card")
    ) {
      dispatch(setViewMode(savedViewMode));
    }
  }, [dispatch]);

  // Fetch invoices on mount and filter changes
  const lastFetchRef = useRef(null);
  const hasFetchedRef = useRef({
    storeId: null,
    paymentStatus: null,
    invoiceStatus: null,
    startDate: null,
    endDate: null,
    fetched: false,
  });

  // Reset fetch refs and pagination when search or store changes
  useEffect(() => {
    lastFetchRef.current = null;
    hasFetchedRef.current = {
      storeId: null,
      paymentStatus: null,
      invoiceStatus: null,
      startDate: null,
      endDate: null,
      fetched: false,
    };
  }, []);

  useEffect(() => {
    const storeId =
      selectedStore?.storeId;
    if (!storeId) return;
    const shouldSkip = () => {
      const lastFetched = hasFetchedRef.current;
      return (
        (lastFetched.fetched &&
          lastFetched.storeId === storeId &&
          lastFetched.paymentStatus === paymentStatus &&
          lastFetched.invoiceStatus === invoiceStatus &&
          lastFetched.startDate === startDate &&
          lastFetched.endDate === endDate) ||
        isLoading
      );
    };

    if (shouldSkip()) return;

    const timer = setTimeout(() => {
      const fetchInvoices = async () => {
        const fetchKey = `${storeId}-${paymentStatus}-${invoiceStatus}-${startDate}-${endDate}`;

        if (lastFetchRef.current === fetchKey) {
          return;
        }

        lastFetchRef.current = fetchKey;

        const params = {
          store: storeId,
          limit: 20,
          cursor: null,
          isFreshLoad: true,
          paymentStatus: paymentStatus || undefined,
          invoiceStatus: invoiceStatus || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        };

        await dispatch(getInvoices(params));

        hasFetchedRef.current = {
          storeId,
          paymentStatus,
          invoiceStatus,
          startDate,
          endDate,
          fetched: true,
        };
      };

      fetchInvoices();
    }, 350);

    return () => clearTimeout(timer);
  }, [dispatch, selectedStore, paymentStatus, invoiceStatus, startDate, endDate, isLoading]);

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !pagination?.hasNextPage || !pagination?.nextCursor) {
      return;
    }

    setIsLoadingMore(true);

    try {
      const storeId =
        selectedStore?.storeId;
      if (!storeId) {
        setIsLoadingMore(false);
        return;
      }

      const params = {
        store: storeId,
        paymentStatus: paymentStatus || undefined,
        invoiceStatus: invoiceStatus || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        limit: 20,
        cursor: pagination.nextCursor,
        isFreshLoad: false,
      };

      await dispatch(getInvoices(params));
    } catch (_error) {
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    isLoadingMore,
    pagination?.hasNextPage,
    pagination?.nextCursor,
    paymentStatus,
    invoiceStatus,
    startDate,
    endDate,
    selectedStore,
    dispatch,
  ]);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) {
      return;
    }

    let isScrolling = false;

    const handleScroll = () => {
      if (isScrolling) {
        return;
      }

      if (isLoadingMore) {
        return;
      }

      if (!pagination?.hasNextPage) {
        return;
      }

      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      const threshold = 200;
      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

      if (distanceFromBottom <= threshold) {
        isScrolling = true;
        handleLoadMore().finally(() => {
          isScrolling = false;
        });
      }
    };

    let scrollTimeout;
    const throttledHandleScroll = () => {
      if (scrollTimeout) return;
      scrollTimeout = setTimeout(() => {
        handleScroll();
        scrollTimeout = null;
      }, 100);
    };

    scrollElement.addEventListener("scroll", throttledHandleScroll, {
      passive: true,
    });

    setTimeout(() => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
      if (distanceFromBottom <= 200 && pagination?.hasNextPage) {
        handleLoadMore();
      }
    }, 500);

    return () => {
      scrollElement.removeEventListener("scroll", throttledHandleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [isLoadingMore, pagination?.hasNextPage, handleLoadMore]);

  const handleClearFilters = () => {
    setPaymentStatus("");
    setInvoiceStatus("");
    setStartDate("");
    setEndDate("");
  };

  const hasActiveFilters = paymentStatus || invoiceStatus || startDate || endDate;

  const handleAddInvoice = () => {
    router.push("/dashboard/invoices/add");
  };

  const handleEditInvoice = (invoiceId) => {
    router.push(`/dashboard/invoices/${invoiceId}/edit`);
  };

  const handleViewInvoice = (invoiceId) => {
    router.push(`/dashboard/invoices/${invoiceId}`);
  };

  const handlePrintInvoice = (invoiceId) => {
    // Redirect to view invoice page
    router.push(`/dashboard/invoices/${invoiceId}`);
  };

  const handleReleaseInvoice = (invoice) => {
    setInvoiceToRelease(invoice);
  };

  const handleCancelRelease = () => {
    setInvoiceToRelease(null);
  };

  const handleUpdatePaymentStatus = (_invoiceId, invoice) => {
    setInvoiceToUpdatePayment(invoice);
  };

  const handleCancelPaymentStatusUpdate = () => {
    setInvoiceToUpdatePayment(null);
  };

  const handleDeleteInvoice = (invoice) => {
    setInvoiceToDelete(invoice);
  };

  const handleCancelDelete = () => {
    setInvoiceToDelete(null);
  };

  const handleViewModeChange = (mode) => {
    dispatch(setViewMode(mode));
    localStorage.setItem("invoices-view-mode", mode);
  };

  useCommonHotkeys({
    onNew: handleAddInvoice,
    onViewTable: () => handleViewModeChange("table"),
    onViewGrid: () => handleViewModeChange("card"),
  });

  const showSkeleton = isLoading && invoices.length === 0 && !error;

  return (
    <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
        {/* Header */}
        <Header
          title={t("sidebar.invoices")}
          description={t("invoice.createInvoiceDescription")}
        />

        {/* Main Content */}
        <div className="flex-1 p-5">
          <div className="max-w-8xl mx-auto">
            {showSkeleton && (
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

            <div className="mb-3">
              <div className="flex justify-between items-center gap-3 flex-wrap">
                {/* Left side - Filters */}
                <div className="flex gap-3 flex-wrap">
                  {/* Payment Status */}
                  <div className="w-[160px]">
                    <Select
                      value={paymentStatus}
                      onChange={setPaymentStatus}
                      options={[
                        { value: "", label: t("invoice.paymentStatus") },
                        { value: "UNPAID", label: t("invoice.unpaid") },
                        { value: "PAID", label: t("invoice.paid") },
                        { value: "PARTIAL", label: t("invoice.partialPayment") },
                        { value: "CANCELLED", label: t("invoice.cancelled") },
                      ]}
                      placeholder={t("invoice.paymentStatus")}
                    />
                  </div>

                  {/* Invoice Status */}
                  <div className="w-[160px]">
                    <Select
                      value={invoiceStatus}
                      onChange={setInvoiceStatus}
                      options={[
                        { value: "", label: t("invoice.invoiceStatus") },
                        { value: "DRAFT", label: t("invoice.draft") },
                        { value: "RELEASED", label: t("invoice.released") },
                        { value: "CANCELLED", label: t("invoice.cancelled") },
                        { value: "DELETED", label: t("invoice.deleted") },
                      ]}
                      placeholder={t("invoice.invoiceStatus")}
                    />
                  </div>

                  {/* Start Date */}
                  <div className="w-[140px]">
                    <Input
                      type={startDate ? "date" : "text"}
                      onFocus={(e) => (e.target.type = "date")}
                      onBlur={(e) => {
                        if (!e.target.value) e.target.type = "text";
                      }}
                      value={startDate}
                      onChange={setStartDate}
                      max={endDate || undefined}
                      placeholder={t("common.startDate")}
                    />
                  </div>

                  {/* End Date */}
                  <div className="w-[140px]">
                    <Input
                      type={endDate ? "date" : "text"}
                      onFocus={(e) => (e.target.type = "date")}
                      onBlur={(e) => {
                        if (!e.target.value) e.target.type = "text";
                      }}
                      value={endDate}
                      onChange={setEndDate}
                      min={startDate || undefined}
                      placeholder={t("common.endDate")}
                    />
                  </div>

                  {/* Clear Filters */}
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      onClick={handleClearFilters}
                      className="h-10 px-4 text-sm font-medium text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      {t("common.clearFilters")}
                    </Button>
                  )}
                </div>

                {/* Right side - Action Buttons */}
                <div className="flex gap-3">
                  {invoices.length > 0 && (
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
                  )}

                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowDownloadDrawer(true);
                    }}
                    className="flex items-center gap-2 h-9"
                  >
                    <Download className="w-4 h-4" />
                    {t("common.download")}
                  </Button>

                  <Button
                    variant="primary"
                    onClick={handleAddInvoice}
                    leftIcon={Plus}
                  >
                    {t("invoice.createInvoice")}
                  </Button>
                </div>
              </div>
            </div>

            {!isLoading && invoices.length === 0 && (
              <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))]">
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 bg-[rgb(var(--color-bg-tertiary))] rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-[rgb(var(--color-text-tertiary))]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                    {t("common.noResults")}
                  </h3>
                  <p className="text-[rgb(var(--color-text-secondary))] text-center max-w-md">
                    {error
                      ? `${t("common.error")}: ${error}`
                      : hasActiveFilters
                        ? t("common.noResults")
                        : t("common.noData")}
                  </p>
                  <div className="pt-4 flex gap-3">
                    {hasActiveFilters && (
                      <Button
                        variant="outline"
                        onClick={handleClearFilters}
                      >
                        {t("common.clearFilters")}
                      </Button>
                    )}
                    <Button
                      variant="primary"
                      onClick={handleAddInvoice}
                      leftIcon={Plus}
                    >
                      {t("invoice.createInvoice")}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {invoices.length > 0 && (
              <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] overflow-hidden">
                <div
                  className="h-[calc(100vh-200px)] overflow-y-auto"
                  ref={scrollRef}
                >
                  {viewMode === "table" ? (
                    <div className="min-h-full">
                      <InvoiceTable
                        invoices={invoices}
                        onEdit={handleEditInvoice}
                        onDelete={handleDeleteInvoice}
                        onViewDetails={handleViewInvoice}
                        onPrint={handlePrintInvoice}
                        onRelease={handleReleaseInvoice}
                        onUpdatePaymentStatus={handleUpdatePaymentStatus}
                        loading={isLoading}
                        emptyMessage={t("common.noResults")}
                        hasMore={pagination?.hasNextPage}
                        onLoadMore={handleLoadMore}
                        isLoadingMore={isLoadingMore}
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {invoices.map((invoice) => (
                          <InvoiceCard
                            key={invoice.id || invoice._id}
                            invoice={invoice}
                            onEdit={handleEditInvoice}
                            onDelete={handleDeleteInvoice}
                            onViewDetails={handleViewInvoice}
                            onPrint={handlePrintInvoice}
                            onRelease={handleReleaseInvoice}
                            onUpdatePaymentStatus={handleUpdatePaymentStatus}
                          />
                        ))}

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

                <div className="bg-[rgb(var(--color-bg-tertiary))] border-t border-[rgb(var(--color-border-primary))] px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-[rgb(var(--color-text-secondary))]">
                      {pagination?.hasNextPage ? (
                        <>
                          Showing{" "}
                          <span className="font-semibold text-[rgb(var(--color-text-primary))]">
                            {invoices.length}
                          </span>{" "}
                          invoices
                          <span className="ml-2 text-xs text-[rgb(var(--color-primary))]">
                            • Scroll down to load more
                          </span>
                        </>
                      ) : (
                        <>
                          Showing{" "}
                          <span className="font-semibold text-[rgb(var(--color-text-primary))]">
                            {invoices.length}
                          </span>{" "}
                          invoices
                          <span className="ml-2 text-xs text-[rgb(var(--color-text-tertiary))]">
                            • No more invoices
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {invoiceToDelete && (
        <InvoiceDeleteConfirmModal
          onClose={handleCancelDelete}
          invoice={invoiceToDelete}
        />
      )}

      {/* Release confirmation modal */}
      {invoiceToRelease && (
        <ReleaseInvoiceModal
          onClose={handleCancelRelease}
          invoice={invoiceToRelease}
        />
      )}

      {/* Payment Status Update Modal */}
      {invoiceToUpdatePayment && (
        <UpdatePaymentStatusModal
          onClose={handleCancelPaymentStatusUpdate}
          invoice={invoiceToUpdatePayment}
        />
      )}

      {/* Download Drawer */}
      <InvoiceDownloadDrawer
        isOpen={showDownloadDrawer}
        onClose={() => setShowDownloadDrawer(false)}
      />
    </div>
  );
};

export default InvoicesPage;
