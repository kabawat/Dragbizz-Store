"use client"
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Grid3X3, List, FileText, Search, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getInvoices, deleteInvoice, setSelectedInvoices, selectAllInvoices, deselectAllInvoices, setViewMode } from '@/store/slices/invoicesSlice';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { AnimatedBackground, Input, SettingsPanel } from '@/components/ui';
import { Button } from '@/components/ui';
import { InvoiceTable, InvoiceCard, InvoiceDeleteConfirmModal, InvoiceDeleteSuccessModal, InvoiceErrorModal } from '@/components/invoice';
import { invoiceService } from '@/service';

const InvoicesPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

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
  const [searchValue, setSearchValue] = useState('');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [deletedInvoiceName, setDeletedInvoiceName] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [invoiceToRelease, setInvoiceToRelease] = useState(null);
  const [isReleasing, setIsReleasing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('PAID');
  const scrollRef = useRef(null);

  // Error display
  useEffect(() => {
    if (error) {
      setErrorDetails({
        title: 'Error loading invoices',
        message: error,
        details: 'Please check your connection and try again'
      });
      setShowErrorModal(true);
    }
  }, [error]);

  useEffect(() => {
    const savedViewMode = localStorage.getItem('invoices-view-mode');
    if (savedViewMode && (savedViewMode === 'table' || savedViewMode === 'card')) {
      dispatch(setViewMode(savedViewMode));
    }
  }, [dispatch]);


  // Fetch invoices on mount and search changes
  const lastFetchRef = useRef({ storeId: null, searchValue: null });

  useEffect(() => {
    const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id;

    // Fetch only if store exists
    if (!storeId) return;

    // Prevent duplicate fetch
    if (
      lastFetchRef.current.storeId === storeId &&
      lastFetchRef.current.searchValue === searchValue
    ) {
      return;
    }

    lastFetchRef.current = { storeId, searchValue };

    const fetchInvoices = async () => {
      const params = {
        store: storeId,
        search: searchValue,
        limit: 20,
        cursor: null,
        isFreshLoad: true
      };
      await dispatch(getInvoices(params));
    };

    fetchInvoices();
  }, [dispatch, selectedStore, searchValue]);

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
        search: searchValue || undefined,
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
  }, [isLoadingMore, pagination?.hasNextPage, pagination?.nextCursor, searchValue, selectedStore, dispatch, invoices.length]);

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

  const handleStoreChange = () => {
    // Store change handled by Redux
  };

  // Search
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

  const handleReleaseInvoice = (invoiceId) => {
    const invoice = invoices.find(i => (i.id || i._id) === invoiceId);
    setInvoiceToRelease({
      id: invoiceId,
      name: invoice?.invoiceNumber || `INV-${invoiceId?.slice(-6)}`
    });
    setShowReleaseModal(true);
  };

  const handleConfirmRelease = async () => {
    if (!invoiceToRelease) return;

    setIsReleasing(true);
    try {
      const storeId = selectedStore?.storeId;
      const result = await invoiceService.releaseInvoice(invoiceToRelease.id, paymentStatus, storeId);

      if (result.success) {
        // Refresh the invoices list to show updated status
        const refreshParams = {
          store: storeId,
          search: searchValue,
          limit: 20,
          cursor: null,
          isFreshLoad: true
        };
        await dispatch(getInvoices(refreshParams));

        setShowReleaseModal(false);
        setInvoiceToRelease(null);

        // Auto-redirect to view invoice page after successful release
        router.push(`/dashboard/invoices/view/${invoiceToRelease.id}`);
      } else {
        alert('Failed to release invoice. Please try again.');
        setShowReleaseModal(false);
        setInvoiceToRelease(null);
      }
    } catch (error) {
      alert('An error occurred while releasing the invoice. Please try again.');
      setShowReleaseModal(false);
      setInvoiceToRelease(null);
    } finally {
      setIsReleasing(false);
    }
  };

  const handleCancelRelease = () => {
    setShowReleaseModal(false);
    setInvoiceToRelease(null);
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

  const handleDeleteInvoice = (invoiceId) => {
    const invoice = invoices.find(i => (i.id || i._id) === invoiceId);
    setInvoiceToDelete({
      id: invoiceId,
      name: invoice?.invoiceNumber || `INV-${invoiceId?.slice(-6)}`
    });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!invoiceToDelete) return;

    setIsDeleting(true);
    try {
      const storeId = selectedStore?.storeId;
      const result = await dispatch(deleteInvoice({
        invoiceId: invoiceToDelete.id,
        storeId: storeId
      }));

      if (result.payload?.success) {
        setDeletedInvoiceName(invoiceToDelete.name);
        setShowDeleteSuccessModal(true);
      }

      setShowDeleteModal(false);
      setInvoiceToDelete(null);
    } catch (error) {
      // Error handled silently
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
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
      <Sidebar onStoreChange={handleStoreChange} />

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
                {/* search and filter  */}
                <div className="mb-3">
                  <div className="flex justify-between items-center lg:flex-row gap-4 mb-0">
                    {/* Search */}
                    <div className="w-100">
                      <Input
                        type="text"
                        placeholder="Search invoices..."
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

                      <Button variant="primary" onClick={handleAddInvoice} leftIcon={Plus}>
                        Add Invoice
                      </Button>
                    </div>
                  </div>
                </div>
                {/* table or card  */}
                <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] overflow-hidden">
                  <div 
                    className="h-[calc(100vh-200px)] overflow-y-auto" 
                    ref={scrollRef}
                  >
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
      <InvoiceDeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        invoiceNumber={invoiceToDelete?.name}
        isLoading={isDeleting}
      />

      {/* Delete success modal */}
      <InvoiceDeleteSuccessModal
        isOpen={showDeleteSuccessModal}
        onClose={() => setShowDeleteSuccessModal(false)}
        invoiceNumber={deletedInvoiceName}
      />

      {/* Error modal */}
      <InvoiceErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title={errorDetails?.title}
        message={errorDetails?.message}
        details={errorDetails?.details}
      />

      {/* Release confirmation modal */}
      {showReleaseModal && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-[1px] flex items-center justify-center z-[9999]">
          <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 max-w-md w-full mx-4 border border-[rgb(var(--color-border-primary))]">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-[rgb(var(--color-success))]/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-[rgb(var(--color-success))]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Release Invoice</h3>
                <p className="text-sm text-[rgb(var(--color-text-secondary))]">This will finalize the invoice</p>
              </div>
            </div>
            <p className="text-[rgb(var(--color-text-primary))] mb-4">
              Are you sure you want to release invoice <strong>{invoiceToRelease?.name}</strong>?
              This will finalize the invoice and it cannot be edited afterwards.
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full px-3 py-2 border border-[rgb(var(--color-border-primary))] rounded-lg bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]"
              >
                <option value="UNPAID">Unpaid</option>
                <option value="PAID">Paid</option>
                <option value="PAY_LATTER">Pay Later</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={handleCancelRelease}
                variant="outline"
                className="flex-1"
                disabled={isReleasing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmRelease}
                className="flex-1"
                disabled={isReleasing}
              >
                {isReleasing ? 'Releasing...' : 'Release Invoice'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicesPage;
