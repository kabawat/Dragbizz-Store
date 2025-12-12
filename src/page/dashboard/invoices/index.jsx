"use client"
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Grid3X3, List, FileText, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getInvoices, setSelectedInvoices, selectAllInvoices, deselectAllInvoices, setViewMode } from '@/store/slices/invoicesSlice';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { AnimatedBackground, Select } from '@/components/ui';
import { Button } from '@/components/ui';
import { InvoiceTable, InvoiceCard, InvoiceDeleteConfirmModal, UpdatePaymentStatusModal, ReleaseInvoiceModal, InvoiceDownloadDrawer } from '@/components/invoice';
import { customerService } from '@/service';
import { useGlobalToast } from '@/contexts/ToastContext';

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
  const [customerFilter, setCustomerFilter] = useState('');
  const [customerOptions, setCustomerOptions] = useState([]);
  const [isCustomerOptionsLoading, setIsCustomerOptionsLoading] = useState(false);
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


  // Fetch invoices on mount and customer filter changes
  const lastFetchRef = useRef({ storeId: null, customerKey: null });

  useEffect(() => {
    const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id;

    // Fetch only if store exists
    if (!storeId) return;

    const customerKey = customerFilter || '';

    // Prevent duplicate fetch
    if (
      lastFetchRef.current.storeId === storeId &&
      lastFetchRef.current.customerKey === customerKey
    ) {
      return;
    }

    lastFetchRef.current = { storeId, customerKey };

    const fetchInvoices = async () => {
      const params = {
        store: storeId,
        limit: 20,
        cursor: null,
        isFreshLoad: true,
        customer: customerFilter || undefined
      };
      await dispatch(getInvoices(params));
    };

    fetchInvoices();
  }, [dispatch, selectedStore, customerFilter]);

  // Load customer options for filter (lightweight)
  useEffect(() => {
    const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id;
    if (!storeId) return;

    const loadCustomers = async () => {
      try {
        setIsCustomerOptionsLoading(true);
        const result = await customerService.getCustomers({
          store: storeId,
          lightweight: true,
          limit: 200
        });
        if (result.success) {
          const customers = result.data?.data || result.data || [];
          const options = customers
            .map((c) => ({
              label: c.name || c.phone || 'Customer',
              value: c._id || c.id
            }))
            .filter((opt) => opt.value);
          setCustomerOptions(options);
        } else {
          setCustomerOptions([]);
        }
      } catch (error) {
        setCustomerOptions([]);
      } finally {
        setIsCustomerOptionsLoading(false);
      }
    };

    loadCustomers();
  }, [selectedStore]);

  // Load more invoices - Fixed to properly handle response structure
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
        customer: customerFilter || undefined,
        limit: 20,
        cursor: pagination.nextCursor,
        isFreshLoad: false
      };

      await dispatch(getInvoices(params));
    } catch (error) {
      // Error handled silently
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, pagination?.hasNextPage, pagination?.nextCursor, customerFilter, selectedStore, dispatch, invoices.length]);

  // Infinite scroll - Fixed with proper dependencies and throttling
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) {
      return;
    }

    let isScrolling = false;
    
    const handleScroll = () => {
      // Early return checks
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
      const threshold = 200; // Increased threshold for better UX
      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

      // Check if user has scrolled near the bottom
      if (distanceFromBottom <= threshold) {
        isScrolling = true;
        handleLoadMore().finally(() => {
          isScrolling = false;
        });
      }
    };

    // Throttle scroll events for better performance
    let scrollTimeout;
    const throttledHandleScroll = () => {
      if (scrollTimeout) return;
      scrollTimeout = setTimeout(() => {
        handleScroll();
        scrollTimeout = null;
      }, 100);
    };

    scrollElement.addEventListener('scroll', throttledHandleScroll, { passive: true });
    
    // Also check on mount if already near bottom
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

  // Customer filter change
  const handleCustomerFilterChange = (value) => {
    setCustomerFilter(value || '');
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

  // InvoiceTable handlers
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

  // Save view mode
  const handleViewModeChange = (mode) => {
    dispatch(setViewMode(mode));
    localStorage.setItem('invoices-view-mode', mode);
  };

  return (
    <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
      <AnimatedBackground variant="default" />
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
        {/* Header */}
        <Header title="Invoices" description="Manage your customer invoices and billing" />

        {/* Main content */}
        <div className="flex-1 p-5">
          <div className="max-w-8xl mx-auto">
            {/* Loading */}
            {isLoading && invoices.length === 0 && (
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

            {/* Empty state */}
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
                    No invoices match your current criteria. Try adjusting your search or add new invoices.
                  </p>
                  <div className="pt-4">
                    <Button variant="primary" onClick={handleAddInvoice} leftIcon={Plus}>
                      Add Invoice
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Invoices list */}
            {invoices.length > 0 && (
              <>
                {/* Filters */}
                <div className="mb-3">
                  <div className="flex justify-between items-center lg:flex-row gap-4 mb-0">
                    {/* Customer filter */}
                    <div className="w-100">
                      <Select
                        placeholder="Filter by customer"
                        options={customerOptions}
                        value={customerFilter}
                        onChange={handleCustomerFilterChange}
                        disabled={isCustomerOptionsLoading}
                        searchable
                        clearable
                      />
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3 items-center">
                      {/* View toggle */}
                      <div className="flex bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                        <button
                          onClick={() => handleViewModeChange('table')}
                          className={`h-9 px-3 cursor-pointer py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${viewMode === 'table'
                            ? 'bg-[rgb(var(--color-primary))] text-white'
                            : 'text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]'
                            }`}
                        >
                          <List className="w-4 h-4" />
                          Table
                        </button>
                        <button
                          onClick={() => handleViewModeChange('card')}
                          className={`h-9 px-3 cursor-pointer py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${viewMode === 'card' ? 'bg-[rgb(var(--color-primary))] text-white' : 'text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]'}`}
                        >
                          <Grid3X3 className="w-4 h-4" />
                          Cards
                        </button>
                      </div>

                      {/* Download Button */}
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

                      <Button variant="primary" onClick={handleAddInvoice} leftIcon={Plus} className="h-9">
                        Add Invoice
                      </Button>
                    </div>
                  </div>
                </div>
                {/* table or card  */}
                <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] overflow-hidden">
                  <div  className="h-[calc(100vh-200px)] overflow-y-auto"  ref={scrollRef} >
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
                        {/* Select all header */}
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
                            />
                          ))}

                          {/* Infinite scroll loading */}
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

                  {/* Footer */}
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
                              • All invoices loaded
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
