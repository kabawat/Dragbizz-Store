"use client"
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Grid3X3, List, FileText, Download, Search } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { InvoiceTable, InvoiceCard, InvoiceDeleteConfirmModal, UpdatePaymentStatusModal, ReleaseInvoiceModal, InvoiceDownloadDrawer } from '@/components/invoice';
import { getInvoices, setSelectedInvoices, selectAllInvoices, deselectAllInvoices, setViewMode } from '@/store/slices/invoicesSlice';
import { Input } from '@/components/ui';
import { Button } from '@/components/ui';
import { useRouter } from 'next/navigation';
import { useGlobalToast } from '@/contexts/ToastContext';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';

const InvoicesPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { showError } = useGlobalToast();

  // Redux store data
  const {
    invoices,
    selectedInvoices,
    isLoading,
    error,
    pagination,
    viewMode
  } = useAppSelector((state) => state.invoices);

  const { selectedStore } = useAppSelector((state) => state.profile);

  // Local state
  const [invoiceToUpdatePayment, setInvoiceToUpdatePayment] = useState(null);
  const [invoiceToRelease, setInvoiceToRelease] = useState(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [showDownloadDrawer, setShowDownloadDrawer] = useState(false);
  const scrollRef = useRef(null);

  // Error display
  useEffect(() => {
    if (error) {
      showError(error || 'Failed to load invoices. Please check your connection and try again.');
    }
  }, [error, showError]);

  useEffect(() => {
    const savedViewMode = localStorage.getItem('invoices-view-mode');
    if (savedViewMode && (savedViewMode === 'table' || savedViewMode === 'card')) {
      dispatch(setViewMode(savedViewMode));
    }
  }, [dispatch]);


  // Fetch invoices on mount and filter changes
  const lastFetchRef = useRef(null);
  const hasFetchedRef = useRef({ storeId: null, searchValue: null, fetched: false });

  // Reset fetch refs and pagination when search or store changes
  useEffect(() => {
    lastFetchRef.current = null;
    hasFetchedRef.current = { storeId: null, searchValue: null, fetched: false };
  }, [selectedStore, searchValue]);

  useEffect(() => {
    const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id;
    if (!storeId) return;
    const shouldSkip = () => {
      const lastFetched = hasFetchedRef.current;
      return (
        lastFetched.fetched &&
        lastFetched.storeId === storeId &&
        lastFetched.searchValue === searchValue
      ) || isLoading;
    };

    if (shouldSkip()) return;

    const timer = setTimeout(() => {
      const fetchInvoices = async () => {
        const fetchKey = `${storeId}-${searchValue}`;

        if (lastFetchRef.current === fetchKey) {
          return;
        }

        lastFetchRef.current = fetchKey;

        const params = {
          store: storeId,
          limit: 20,
          cursor: null,
          isFreshLoad: true,
          search: searchValue || undefined
        };

        await dispatch(getInvoices(params));

        hasFetchedRef.current = {
          storeId,
          searchValue,
          fetched: true
        };
      };

      fetchInvoices();
    }, 350);

    return () => clearTimeout(timer);
  }, [dispatch, selectedStore, searchValue, isLoading]);

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !pagination?.hasNextPage || !pagination?.nextCursor) {
      return;
    }

    setIsLoadingMore(true);

    try {
      const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id;
      if (!storeId) {
        setIsLoadingMore(false);
        return;
      }

      const params = {
        store: storeId,
        search: searchValue || undefined,
        limit: 20,
        cursor: pagination.nextCursor,
        isFreshLoad: false
      };

      await dispatch(getInvoices(params));
    } catch (error) {
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, pagination?.hasNextPage, pagination?.nextCursor, searchValue, selectedStore, dispatch]);

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

    scrollElement.addEventListener('scroll', throttledHandleScroll, { passive: true });

    setTimeout(() => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
      if (distanceFromBottom <= 200 && pagination?.hasNextPage) {
        handleLoadMore();
      }
    }, 500);

    return () => {
      scrollElement.removeEventListener('scroll', throttledHandleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [isLoadingMore, pagination?.hasNextPage, pagination?.nextCursor, handleLoadMore]);

  const handleSearch = (value) => {
    setSearchValue(value);
  };

  const handleAddInvoice = () => {
    router.push('/dashboard/invoices/add');
  };

  const handleEditInvoice = (invoiceId) => {
    router.push(`/dashboard/invoices/edit/${invoiceId}`);
  };

  const handleViewInvoice = (invoiceId) => {
    router.push(`/dashboard/invoices/view/${invoiceId}`);
  };

  const handlePrintInvoice = (invoiceId) => {
    // Redirect to view invoice page
    router.push(`/dashboard/invoices/view/${invoiceId}`);
  };

  const handleReleaseInvoice = (invoice) => {
    setInvoiceToRelease(invoice);
  };

  const handleCancelRelease = () => {
    setInvoiceToRelease(null);
  };

  const handleUpdatePaymentStatus = (invoiceId, invoice) => {
    setInvoiceToUpdatePayment(invoice);
  };

  const handleCancelPaymentStatusUpdate = () => {
    setInvoiceToUpdatePayment(null);
  };

  const handleInvoiceSelect = (invoiceIds) => {
    const idsArray = Array.isArray(invoiceIds) ? invoiceIds : [invoiceIds];
    dispatch(setSelectedInvoices(idsArray));
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      dispatch(selectAllInvoices());
    } else {
      dispatch(deselectAllInvoices());
    }
  };

  const handleDeleteInvoice = (invoice) => {
    setInvoiceToDelete(invoice);
  };

  const handleCancelDelete = () => {
    setInvoiceToDelete(null);
  };

  const handleViewModeChange = (mode) => {
    dispatch(setViewMode(mode));
    localStorage.setItem('invoices-view-mode', mode);
  };

  const showSkeleton = isLoading && invoices.length === 0 && !error;

  return (
    <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
        {/* Header */}
        <Header title="Invoices" description="Manage your customer invoices and billing" />

        {/* Main Content */}
        <div className="flex-1 p-5">
          <div className="max-w-8xl mx-auto">
            {showSkeleton && (
              <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-8 mb-6">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                      Loading Invoices...
                    </h2>
                    <p className="text-[rgb(var(--color-text-secondary))]">
                      Please wait while we fetch your invoices
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!isLoading && invoices.length === 0 && (
              <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))]">
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 bg-[rgb(var(--color-bg-tertiary))] rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-[rgb(var(--color-text-tertiary))]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                    No invoices found
                  </h3>
                  <p className="text-[rgb(var(--color-text-secondary))] text-center max-w-md">
                    {error
                      ? `Error: ${error}`
                      : searchValue
                        ? `No invoices match "${searchValue}". Try a different search or clear the filter.`
                        : 'No invoices match your current criteria. Try adjusting your search or add new invoices.'}
                  </p>
                  <div className="pt-4 flex gap-3">
                    {searchValue && (
                      <Button variant="outline" onClick={() => setSearchValue('')}>
                        Clear search
                      </Button>
                    )}
                    <Button variant="primary" onClick={handleAddInvoice} leftIcon={Plus}>
                      Add Invoice
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-3">
              <div className="flex justify-between items-center lg:flex-row gap-4 mb-0">
                <div className="w-100">
                  <Input
                    type="text"
                    placeholder="Search invoices..."
                    value={searchValue}
                    onChange={(value) => handleSearch(value)}
                    leftIcon={Search}
                    className="w-100"
                  />
                </div>

                <div className="flex gap-3">
                  <div className="flex bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                    <button
                      onClick={() => handleViewModeChange('table')}
                      className={`px-3 cursor-pointer py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${viewMode === 'table'
                        ? 'bg-[rgb(var(--color-primary))] text-white'
                        : 'text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]'
                        }`}
                    >
                      <List className="w-4 h-4" />
                      Table
                    </button>
                    <button
                      onClick={() => handleViewModeChange('card')}
                      className={`px-3 cursor-pointer py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${viewMode === 'card' ? 'bg-[rgb(var(--color-primary))] text-white' : 'text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]'}`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                      Cards
                    </button>
                  </div>

                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowDownloadDrawer(true);
                    }}
                    className="flex items-center gap-2 h-9"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>

                  <Button variant="primary" onClick={handleAddInvoice} leftIcon={Plus}>
                    Add Invoice
                  </Button>
                </div>
              </div>
            </div>

            {invoices.length > 0 && (
              <>
                <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] overflow-hidden">
                  <div className="h-[calc(100vh-200px)] overflow-y-auto" ref={scrollRef} >
                    {viewMode === 'table' ? (
                      <div className="min-h-full">
                        <InvoiceTable
                          invoices={invoices}
                          selectedInvoices={selectedInvoices}
                          onSelect={handleInvoiceSelect}
                          onSelectAll={handleSelectAll}
                          onEdit={handleEditInvoice}
                          onDelete={handleDeleteInvoice}
                          onViewDetails={handleViewInvoice}
                          onPrint={handlePrintInvoice}
                          onRelease={handleReleaseInvoice}
                          onUpdatePaymentStatus={handleUpdatePaymentStatus}
                          loading={isLoading}
                          emptyMessage="No invoices found"
                          hasMore={pagination?.hasNextPage}
                          onLoadMore={handleLoadMore}
                          isLoadingMore={isLoadingMore}
                        />
                      </div>
                    ) : (
                      <div>
                        {invoices.length > 0 && (
                          <div className="bg-gradient-to-r from-[rgb(var(--color-bg-tertiary))] to-[rgb(var(--color-bg-secondary))] border-b border-[rgb(var(--color-border-primary))] px-6 py-4 sticky top-0 z-20">
                            <div className="flex items-center gap-4">
                              <input
                                type="checkbox"
                                checked={selectedInvoices.length === invoices.length && invoices.length > 0}
                                onChange={(e) => handleSelectAll(e.target.checked)}
                                className="w-4 h-4 text-[rgb(var(--color-primary))] border-[rgb(var(--color-border-primary))] rounded focus:ring-[rgb(var(--color-primary))] focus:ring-2"
                              />
                              <span className="text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                                Select all {invoices.length} invoices
                              </span>
                              {selectedInvoices.length > 0 && (
                                <span className="text-xs text-[rgb(var(--color-primary))] font-medium">
                                  ({selectedInvoices.length} selected)
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {invoices.map((invoice) => (
                            <InvoiceCard
                              key={invoice.id || invoice._id}
                              invoice={invoice}
                              onSelect={handleInvoiceSelect}
                              selected={selectedInvoices.includes(invoice.id || invoice._id)}
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
                                <span className="text-sm text-[rgb(var(--color-text-secondary))]">Loading more invoices...</span>
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
                            Showing <span className="font-semibold text-[rgb(var(--color-text-primary))]">{invoices.length}</span> invoices
                            <span className="ml-2 text-xs text-[rgb(var(--color-primary))]">
                              • Scroll down to load more
                            </span>
                          </>
                        ) : (
                          <>
                            Showing <span className="font-semibold text-[rgb(var(--color-text-primary))]">{invoices.length}</span> invoices
                            <span className="ml-2 text-xs text-[rgb(var(--color-text-tertiary))]">
                              • No more invoices
                            </span>
                          </>
                        )}
                      </div>
                      <div className="text-sm text-[rgb(var(--color-text-secondary))]">
                        {selectedInvoices.length > 0 && (
                          <span className="font-semibold text-[rgb(var(--color-primary))]">
                            {selectedInvoices.length} selected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
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
