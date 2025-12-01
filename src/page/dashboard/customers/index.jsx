"use client"
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Grid3X3, List, Users, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  deleteCustomer,
  setSelectedCustomers,
  toggleCustomerSelection,
  selectAllCustomers,
  deselectAllCustomers,
  setViewMode
} from '@/store/slices/customersSlice';
import { customerService } from '@/service';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { AnimatedBackground, Input, SettingsPanel, SideDrawer } from '@/components/ui';
import { Button } from '@/components/ui';
import { CustomerTable, CustomerCard, CreateCustomer } from '@/components/customer';

const CustomersPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Get data from Redux store
  const {
    selectedCustomers,
    viewMode
  } = useAppSelector((state) => state.customers);

  // Local state for customers
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    hasNextPage: false,
    nextCursor: null
  });

  const { selectedStore } = useAppSelector((state) => state.profile);

  // Get stable storeId
  const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id;

  // Local state
  const [searchValue, setSearchValue] = useState('');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [deletedCustomerName, setDeletedCustomerName] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);
  const [showCustomerDrawer, setShowCustomerDrawer] = useState(false);
  const scrollRef = useRef(null);
  const lastFetchRef = useRef(null);
  const hasFetchedRef = useRef({ storeId: null, searchValue: null, fetched: false });

  // Handle error display
  useEffect(() => {
    if (error) {
      setErrorDetails({
        title: 'Error loading customers',
        message: error,
        details: 'Please check your connection and try again'
      });
      setShowErrorModal(true);
    }
  }, [error]);

  // Load view mode from localStorage
  useEffect(() => {
    const savedViewMode = localStorage.getItem('customers-view-mode');
    if (savedViewMode && (savedViewMode === 'table' || savedViewMode === 'card')) {
      dispatch(setViewMode(savedViewMode));
    }
  }, [dispatch]);

  // Fetch customers from API
  const fetchCustomers = useCallback(async (isLoadMore = false, cursor = null) => {
    if (!storeId && !isLoadMore) return;
    
    const params = {
      search: searchValue,
      limit: 10,
      nextCursor: isLoadMore ? cursor : null
    };

    if (storeId) {
      params.store = storeId;
    }
    
    // Create a unique key for this fetch
    const fetchKey = `${storeId}-${searchValue}-${isLoadMore}-${cursor}`;

    // Prevent duplicate calls with same parameters
    if (lastFetchRef.current === fetchKey) {
      return;
    }

    if (!isLoadMore) {
      const lastFetched = hasFetchedRef.current;
      if (
        lastFetched.fetched &&
        lastFetched.storeId === storeId &&
        lastFetched.searchValue === searchValue
      ) {
        return;
      }
    }

    lastFetchRef.current = fetchKey;
    
    try {
      if (isLoadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      
      const result = await customerService.getCustomers(params);
      
      if (result.success) {
        const customersData = result.data?.data || result.data || [];
        
        if (isLoadMore) {
          setCustomers(prev => [...prev, ...customersData]);
        } else {
          setCustomers(customersData);
          // Update fetch ref for initial load
          hasFetchedRef.current = {
            storeId,
            searchValue,
            fetched: true
          };
        }
        
        // Update pagination
        setPagination({
          hasNextPage: result.data?.hasNextPage || false,
          nextCursor: result.data?.nextCursor || null
        });
      } else {
        setError(result.message || 'Failed to fetch customers');
      }
    } catch (error) {
      setError(error.message || 'Failed to fetch customers');
    } finally {
      if (isLoadMore) {
        setIsLoadingMore(false);
      } else {
        setIsLoading(false);
      }
    }
  }, [storeId, searchValue]);

  // Reset fetch refs and pagination when search or store changes
  useEffect(() => {
    lastFetchRef.current = null;
    hasFetchedRef.current = { storeId: null, searchValue: null, fetched: false };
    setPagination({
      hasNextPage: false,
      nextCursor: null
    });
  }, [storeId, searchValue]);

  // Fetch customers on component mount and when dependencies change
  useEffect(() => {
    if (!storeId) return;
    
    // Prevent duplicate calls
    const lastFetched = hasFetchedRef.current;
    if (
      lastFetched.fetched &&
      lastFetched.storeId === storeId &&
      lastFetched.searchValue === searchValue
    ) {
      return;
    }

    // Prevent call if already loading
    if (isLoading) {
      return;
    }

    fetchCustomers(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId, searchValue]);

  // Infinite scroll logic - load more customers
  const handleLoadMore = async () => {
    if (isLoadingMore || !pagination.hasNextPage || !pagination.nextCursor) return;

    setIsLoadingMore(true);

    try {
      await fetchCustomers(true, pagination.nextCursor);
    } catch (error) {
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Infinite scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current || isLoadingMore || !pagination.hasNextPage || !pagination.nextCursor) return;

      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const threshold = 100;

      if (scrollTop + clientHeight >= scrollHeight - threshold) {
        handleLoadMore();
      }
    };

    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, [isLoadingMore, pagination.hasNextPage, pagination.nextCursor]);

  const handleStoreChange = () => {
    // Store change is handled by Redux, no need for local state
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchValue(value);
  };

  const handleAddCustomer = () => {
    setShowCustomerDrawer(true);
  };

  // Handle customer creation success from drawer
  const handleCustomerSuccess = async (customerData) => {
    // Refresh customers list
    lastFetchRef.current = null;
    await fetchCustomers(false);
    // Close drawer
    setShowCustomerDrawer(false);
  };

  const handleEditCustomer = (customerId) => {
    router.push(`/dashboard/customers/edit/${customerId}`);
  };

  const handleViewCustomer = (customerId) => {
    router.push(`/dashboard/customers/view/${customerId}`);
  };

  // Customer selection handlers
  const handleCustomerSelect = (customerIds) => {
    const idsArray = Array.isArray(customerIds) ? customerIds : [customerIds];
    dispatch(setSelectedCustomers(idsArray));
  };

  const handleCardSelect = (customerId) => {
    dispatch(toggleCustomerSelection(customerId));
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      dispatch(selectAllCustomers());
    } else {
      dispatch(deselectAllCustomers());
    }
  };

  const handleDeleteCustomer = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    setCustomerToDelete({ id: customerId, name: customer?.name || 'Customer' });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;

    setIsDeleting(true);
    try {
      const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id;
      const result = await dispatch(deleteCustomer({
        customerId: customerToDelete.id,
        storeId: storeId
      }));

      if (result.payload?.success) {
        setDeletedCustomerName(customerToDelete.name);
        setShowDeleteSuccessModal(true);
      }

      setShowDeleteModal(false);
      setCustomerToDelete(null);
    } catch (error) {
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setCustomerToDelete(null);
  };

  // Save view mode to localStorage
  const handleViewModeChange = (mode) => {
    dispatch(setViewMode(mode));
    localStorage.setItem('customers-view-mode', mode);
  };

  return (
    <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
      <AnimatedBackground variant="default" />
      <Sidebar onStoreChange={handleStoreChange} />

      {/* Main Content Area */}
      <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
        {/* Header */}
        <Header title="Customers" description="Manage your customer database and customer information" />

        {/* Main Content */}
        <div className="flex-1 p-5">
          <div className="max-w-8xl mx-auto">
            {/* Loading State */}
            {isLoading && customers.length === 0 && (
              <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-8 mb-6">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                      Loading Customers...
                    </h2>
                    <p className="text-[rgb(var(--color-text-secondary))]">
                      Please wait while we fetch your customers
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Search and Filter Card */}
            {customers.length > 0 && (
              <div className="mb-3">
                <div className="flex justify-between items-center lg:flex-row gap-4 mb-0">
                  {/* Search */}
                  <div className="w-100">
                    <Input
                      type="text"
                      placeholder="Search customers..."
                      value={searchValue}
                      onChange={(value) => handleSearch(value)}
                      leftIcon={Search}
                      className="w-100"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {/* View Toggle */}
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

                    <Button variant="primary" onClick={handleAddCustomer} leftIcon={Plus}>
                      Add Customer
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && customers.length === 0 && (
              <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))]">
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 bg-[rgb(var(--color-bg-tertiary))] rounded-full flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-[rgb(var(--color-text-tertiary))]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                    No customers found
                  </h3>
                  <p className="text-[rgb(var(--color-text-secondary))] text-center max-w-md">
                    {error ? `Error: ${error}` : 'No customers match your current criteria. Try adjusting your search or add new customers.'}
                  </p>
                  <div className="pt-4">
                    <Button variant="primary" onClick={handleAddCustomer} leftIcon={Plus}>
                      Add Customer
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Customers List */}
            {customers.length > 0 && (
              <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] overflow-hidden">
                <div className="h-[calc(100vh-200px)] overflow-y-auto" ref={scrollRef}>
                  {viewMode === 'table' ? (
                    <div className="h-full">
                      <CustomerTable
                        customers={customers}
                        selectedCustomers={selectedCustomers}
                        onSelect={handleCustomerSelect}
                        onSelectAll={handleSelectAll}
                        onEdit={handleEditCustomer}
                        onDelete={handleDeleteCustomer}
                        onViewDetails={handleViewCustomer}
                        loading={isLoading}
                        emptyMessage="No customers found"
                        hasMore={pagination.hasNextPage}
                        onLoadMore={handleLoadMore}
                        isLoadingMore={isLoadingMore}
                      />
                    </div>
                  ) : (
                    <div>
                      {/* Select All Header for Card View */}
                      {customers.length > 0 && (
                        <div className="bg-gradient-to-r from-[rgb(var(--color-bg-tertiary))] to-[rgb(var(--color-bg-secondary))] border-b border-[rgb(var(--color-border-primary))] px-6 py-4 sticky top-0 z-20">
                          <div className="flex items-center gap-4">
                            <input
                              type="checkbox"
                              checked={selectedCustomers.length === customers.length && customers.length > 0}
                              onChange={(e) => handleSelectAll(e.target.checked)}
                              className="w-4 h-4 text-[rgb(var(--color-primary))] border-[rgb(var(--color-border-primary))] rounded focus:ring-[rgb(var(--color-primary))] focus:ring-2"
                            />
                            <span className="text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                              Select all {customers.length} customers
                            </span>
                            {selectedCustomers.length > 0 && (
                              <span className="text-xs text-[rgb(var(--color-primary))] font-medium">
                                ({selectedCustomers.length} selected)
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {customers.map((customer) => (
                          <CustomerCard
                            key={customer.id}
                            customer={customer}
                            onSelect={handleCardSelect}
                            selected={selectedCustomers.includes(customer.id)}
                            onEdit={handleEditCustomer}
                            onDelete={handleDeleteCustomer}
                            onViewDetails={handleViewCustomer}
                          />
                        ))}

                        {/* Infinite Scroll Loading for Card View */}
                        {isLoadingMore && (
                          <div className="col-span-full flex items-center justify-center py-8">
                            <div className="flex items-center gap-3">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[rgb(var(--color-primary))]"></div>
                              <span className="text-sm text-[rgb(var(--color-text-secondary))]">Loading more customers...</span>
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
                          Showing <span className="font-semibold text-[rgb(var(--color-text-primary))]">{customers.length}</span> customers
                          <span className="ml-2 text-xs text-[rgb(var(--color-primary))]">
                            • Scroll down to load more
                          </span>
                        </>
                      ) : (
                        <>
                          Showing <span className="font-semibold text-[rgb(var(--color-text-primary))]">{customers.length}</span> customers
                          <span className="ml-2 text-xs text-[rgb(var(--color-text-tertiary))]">
                            • No more customers
                          </span>
                        </>
                      )}
                    </div>
                    <div className="text-sm text-[rgb(var(--color-text-secondary))]">
                      {selectedCustomers.length > 0 && (
                        <span className="font-semibold text-[rgb(var(--color-primary))]">
                          {selectedCustomers.length} selected
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
          <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4">
              Delete Customer
            </h3>
            <p className="text-[rgb(var(--color-text-secondary))] mb-6">
              Are you sure you want to delete "{customerToDelete?.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={handleCancelDelete} disabled={isDeleting}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleConfirmDelete} loading={isDeleting}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Success Modal */}
      {showDeleteSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                Customer Deleted Successfully!
              </h3>
              <p className="text-[rgb(var(--color-text-secondary))] mb-6">
                "{deletedCustomerName}" has been removed from your customer list.
              </p>
              <Button variant="primary" onClick={() => setShowDeleteSuccessModal(false)}>
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
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

      {/* Customer Drawer */}
      <SideDrawer
        isOpen={showCustomerDrawer}
        onClose={() => {
          setShowCustomerDrawer(false);
        }}
        title="Add New Customer"
        icon={Users}
        description="Add a new customer to your database"
        width="w-full md:w-2/3 lg:w-1/2"
      >
        <div className="p-3 sm:p-4 md:p-6 h-full">
          <CreateCustomer
            storeId={selectedStore?.storeId || selectedStore?._id || selectedStore?.id || ''}
            onSuccess={handleCustomerSuccess}
            onCancel={() => setShowCustomerDrawer(false)}
            showCancelButton={true}
            autoRedirect={false}
            mode="drawer"
          />
        </div>
      </SideDrawer>
    </div>
  );
};

export default CustomersPage;