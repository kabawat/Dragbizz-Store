"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Grid3X3, List, Users, Search, MoreHorizontal, Edit, Copy, Trash2, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  getCustomers,
  deleteCustomer,
  setSelectedCustomers,
  toggleCustomerSelection,
  selectAllCustomers,
  deselectAllCustomers,
  setViewMode
} from '@/store/slices/customersSlice';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { AnimatedBackground, Input, SettingsPanel } from '@/components/ui';
import { Button } from '@/components/ui';
import { CustomerTable, CustomerCard } from '@/components/customer';

const CustomersPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Get data from Redux store
  const {
    customers,
    selectedCustomers,
    isLoading,
    error,
    pagination,
    viewMode
  } = useAppSelector((state) => state.customers);

  const { selectedStore } = useAppSelector((state) => state.profile);

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

  useEffect(() => {
    const savedViewMode = localStorage.getItem('customers-view-mode');
    if (savedViewMode && (savedViewMode === 'table' || savedViewMode === 'card')) {
      dispatch(setViewMode(savedViewMode));
    }
  }, [dispatch]);

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
  const [openMenuId, setOpenMenuId] = useState(null);
  const scrollRef = useRef(null);
  const menuRefs = useRef({});
  const lastFetchRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && menuRefs.current[openMenuId] && !menuRefs.current[openMenuId].contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

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

  // Fetch customers on component mount and when search changes
  useEffect(() => {
    const fetchCustomers = async () => {
      const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id;
      const params = {
        store: storeId,
        search: searchValue,
        limit: 10,
        nextCursor: null,
        isFreshLoad: true
      };

      // Create a unique key for this fetch
      const fetchKey = `${storeId}-${searchValue}`;

      // Prevent duplicate calls with same parameters
      if (lastFetchRef.current === fetchKey) {
        return;
      }

      lastFetchRef.current = fetchKey;
      await dispatch(getCustomers(params));
    };

    // Only fetch if selectedStore is available and has a valid ID
    if (selectedStore && (selectedStore.storeId || selectedStore._id || selectedStore.id)) {
      fetchCustomers();
    }
  }, [selectedStore, searchValue]);

  // Infinite scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current || isLoadingMore || !pagination.hasNextPage) return;

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
  }, [isLoadingMore, pagination.hasNextPage]);

  const handleStoreChange = (storeObject) => {
    // Store change is handled by Redux, no need for local state
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchValue(value);
  };

  const handleAddCustomer = () => {
    router.push('/dashboard/customers/add');
  };

  const handleEditCustomer = (customerId) => {
    router.push(`/dashboard/customers/edit/${customerId}`);
  };

  const handleViewCustomer = (customerId) => {
    router.push(`/dashboard/customers/view/${customerId}`);
  };


  // Menu action handler
  const handleMenuAction = (customerId, action) => {
    setOpenMenuId(null);
    switch (action) {
      case 'view':
        handleViewCustomer(customerId);
        break;
      case 'edit':
        handleEditCustomer(customerId);
        break;
      case 'delete':
        handleDeleteCustomer(customerId);
        break;
      default:
        break;
    }
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
      console.error('Error deleting customer:', error);
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

  // Infinite scroll logic - load more customers
  const handleLoadMore = async () => {
    if (isLoadingMore || !pagination.hasNextPage) return;

    setIsLoadingMore(true);

    try {
      const params = {
        store: selectedStore?.storeId || selectedStore?._id || selectedStore?.id,
        search: searchValue,
        limit: 10,
        nextCursor: pagination.nextCursor,
        isFreshLoad: false
      };

      await dispatch(getCustomers(params));
    } catch (error) {
      console.error('Error loading more customers:', error);
    } finally {
      setIsLoadingMore(false);
    }
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
                  <div className="w-100 bg-red">
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
                    No customers match your current criteria. Try adjusting your search or add new customers.
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
                <div className="h-[calc(100vh-208px)] overflow-y-auto" ref={scrollRef}>
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

      {/* Theme Selector */}
      <SettingsPanel />

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
    </div>
  );
};

export default CustomersPage;
