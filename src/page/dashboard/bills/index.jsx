"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { getBills, setCurrentFilter, addMoreBills } from '@/store/slices/billsSlice';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import {
  Receipt,
  Plus,
  Search,
  List,
  Grid3X3,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { BillTable, BillGrid, BillDeleteConfirmModal, BillPaymentDrawer } from '@/components/bills';
import { billService } from '@/service/retailer';
import { getStatusBadge } from '@/utils/statusBadge';

const Bills = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { bills, isLoading, error, currentFilter, pagination } = useAppSelector((state) => state.bills);
  const { selectedStore } = useAppSelector((state) => state.profile);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [selectedBills, setSelectedBills] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRefs = useRef({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [billToDelete, setBillToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const scrollRef = useRef(null);
  const lastFetchRef = useRef({ fetchKey: null });
  const [viewMode, setViewMode] = useState('table');
  const [showPaymentDrawer, setShowPaymentDrawer] = useState(false);
  const [selectedBillForPayment, setSelectedBillForPayment] = useState(null);

  // Handle view mode change
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('bills-view-mode', mode);
  };

  // Load saved view mode
  useEffect(() => {
    const savedViewMode = localStorage.getItem('bills-view-mode');
    if (savedViewMode && (savedViewMode === 'table' || savedViewMode === 'card')) {
      setViewMode(savedViewMode);
    }
  }, []);

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
  };
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

  // Handle menu toggle
  const handleMenuToggle = (billId) => {
    setOpenMenuId(openMenuId === billId ? null : billId);
  };

  // Handle menu action
  const handleMenuAction = (billId, action) => {
    const bill = bills.find(b => (b._id || b.id) === billId);
    if (!bill) return;

    switch (action) {
      case 'view':
        router.push(`/dashboard/bills/${bill._id || bill.id}`);
        break;
      case 'edit':
        router.push(`/dashboard/bills/${bill._id || bill.id}/edit`);
        break;
      case 'payment':
        setSelectedBillForPayment(bill);
        setShowPaymentDrawer(true);
        break;
      case 'delete':
        handleDeleteBill(bill);
        break;
      default:
        break;
    }
    setOpenMenuId(null);
  };
  const handleManualApiCall = () => {
    const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id;
    dispatch(getBills({
      store: storeId || 'test-store',
      limit: 20,
      page: 1
    }));
  };

  // Fetch bills and stats on component mount
  useEffect(() => {
    const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id;

    // Fetch only if store exists
    if (!storeId) return;

    // Create unique key for this fetch to prevent duplicates
    const fetchKey = `${storeId}-${searchTerm}`;
    
    // Prevent duplicate fetch
    if (lastFetchRef.current.fetchKey === fetchKey) {
      return;
    }

    lastFetchRef.current = { storeId, searchValue: searchTerm, fetchKey };

    const fetchBills = async () => {
      const params = {
        store: storeId,
        search: searchTerm,
        limit: 20,
        cursor: null,
        isFreshLoad: true
      };
      await dispatch(getBills(params));
    };

    fetchBills();
  }, [dispatch, selectedStore, searchTerm]);

  // Infinite scroll
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

  // Handle load more
  const handleLoadMore = async () => {
    if (isLoadingMore || !pagination.hasNextPage) return;

    setIsLoadingMore(true);

    try {
      const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id;
      const params = {
        store: storeId,
        search: searchTerm,
        limit: 20,
        cursor: pagination.nextCursor
      };

      const result = await dispatch(getBills(params));
      if (result.payload?.success) {
        dispatch(addMoreBills(result.payload.data.data));
      }
    } catch (error) {
    } finally {
      setIsLoadingMore(false);
    }
  };
  const getFilteredBills = () => {
    let filteredBills = [...bills];

    // Filter by status
    if (statusFilter !== 'all') {
      filteredBills = filteredBills.filter(bill => {
        const isOverdue = new Date(bill.dueDate) < new Date() && bill.dueAmount > 0;

        switch (statusFilter) {
          case 'pending':
            return bill.paymentStatus === 'UNPAID' || bill.paymentStatus === 'PARTIAL';
          case 'overdue':
            return isOverdue;
          case 'paid':
            return bill.paymentStatus === 'PAID';
          default:
            return true;
        }
      });
    }

    // Filter by supplier
    if (supplierFilter !== 'all') {
      filteredBills = filteredBills.filter(bill =>
        bill.supplier?.name?.toLowerCase().includes(supplierFilter.toLowerCase())
      );
    }

    // Filter by date range
    if (dateRange !== 'all') {
      const now = new Date();
      filteredBills = filteredBills.filter(bill => {
        const billDate = new Date(bill.billDate);

        switch (dateRange) {
          case 'today':
            return billDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return billDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return billDate >= monthAgo;
          case 'year':
            const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            return billDate >= yearAgo;
          default:
            return true;
        }
      });
    }

    // Filter by search term
    if (searchTerm) {
      filteredBills = filteredBills.filter(bill =>
        bill.billNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.totalAmount?.toString().includes(searchTerm)
      );
    }

    return filteredBills;
  };

  // Get filtered bills
  const filteredBills = getFilteredBills();

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case 'status':
        setStatusFilter(value);
        dispatch(setCurrentFilter(value));

        // All bills come from the same API, filtering is done on frontend
        const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id;
        if (storeId) {
          dispatch(getBills({ store: storeId }));
        }
        break;
      case 'supplier':
        setSupplierFilter(value);
        break;
      case 'date':
        setDateRange(value);
        break;
      default:
        break;
    }
  };

  // Handle bill selection
  const handleBillSelect = (billId) => {
    setSelectedBills(prev =>
      prev.includes(billId)
        ? prev.filter(id => id !== billId)
        : [...prev, billId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedBills.length === bills.length) {
      setSelectedBills([]);
    } else {
      setSelectedBills(bills.map(bill => bill._id || bill.id));
    }
  };

  // Handle delete bill
  const handleDeleteBill = (bill) => {
    setBillToDelete(bill);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!billToDelete) return;

    const billId = billToDelete._id || billToDelete.id;
    const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id;

    setIsDeleting(true);
    try {
      const result = await billService.deleteBill(billId, storeId);
      
      if (result.success) {
        // Refresh bills list after successful deletion
        dispatch(getBills({ store: storeId }));
        setShowDeleteModal(false);
        setBillToDelete(null);
      } else {
        // You can add a toast notification here
      }
    } catch (error) {
      // You can add a toast notification here
    } finally {
      setIsDeleting(false);
    }
  };

  // Get status badge variant - wrapper to handle overdue logic and compatibility
  const getBillStatusBadge = (bill) => {
    // Check if bill is overdue
    const isOverdue = new Date(bill.dueDate) < new Date() && bill.dueAmount > 0;

    if (isOverdue) {
      return {
        variant: 'danger',
        icon: AlertTriangle,
        text: 'Overdue',
        color: 'bg-red-500/10 text-red-600 border-red-500/20'
      };
    }

    const config = getStatusBadge(bill.paymentStatus, 'bill');
    // Map icons for compatibility with BillTable/BillCard
    const iconMap = {
      'PAID': CheckCircle,
      'PARTIAL': Clock,
      'UNPAID': Clock
    };
    
    // Convert style object to className string for compatibility
    const getColorClass = (variant) => {
      switch(variant) {
        case 'success': return 'bg-green-500/10 text-green-600 border-green-500/20';
        case 'warning': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
        case 'danger': return 'bg-red-500/10 text-red-600 border-red-500/20';
        case 'primary': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
        default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
      }
    };
    
    return {
      variant: config.variant,
      icon: iconMap[bill.paymentStatus] || Clock,
      text: config.text,
      color: getColorClass(config.variant)
    };
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
        {/* Header */}
        <Header
          title="Bills"
          description="Manage supplier bills and track payment status"
        />

        {/* Main Content */}
        <div className="flex-1 p-5">
          <div className="max-w-8xl mx-auto">
            {/* Loading */}
            {isLoading && bills.length === 0 && (
              <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-8 mb-6">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                      Loading Bills...
                    </h2>
                    <p className="text-[rgb(var(--color-text-secondary))]">
                      Please wait while we fetch your bills
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Search and filter */}
            {bills.length > 0 && (
              <div className="mb-3">
                <div className="flex justify-between items-center lg:flex-row gap-4 mb-0">
                  {/* Search */}
                  <div className="w-100 bg-red">
                    <Input
                      type="text"
                      placeholder="Search bills..."
                      value={searchTerm}
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

                    <Button variant="primary" onClick={() => router.push('/dashboard/bills/create')} leftIcon={Plus}>
                      Create Bill
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && bills.length === 0 && (
              <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))]">
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 bg-[rgb(var(--color-bg-tertiary))] rounded-full flex items-center justify-center mb-4">
                    <Receipt className="w-8 h-8 text-[rgb(var(--color-text-tertiary))]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                    No bills found
                  </h3>
                  <p className="text-[rgb(var(--color-text-secondary))] text-center max-w-md">
                    No bills match your current criteria. Try adjusting your search or add new bills.
                  </p>
                  <div className="pt-4">
                    <Button
                      variant="primary"
                      onClick={() => router.push('/dashboard/bills/create')}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Bill
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Bills list */}
            {bills.length > 0 && (
              <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] overflow-hidden">
                <div className="h-[calc(100vh-200px)] overflow-y-auto" ref={scrollRef}>
                  {viewMode === 'table' ? (
                    <BillTable
                      bills={filteredBills}
                      selectedBills={selectedBills}
                      onSelect={handleBillSelect}
                      onSelectAll={handleSelectAll}
                      onEdit={(billId) => router.push(`/dashboard/bills/${billId}/edit`)}
                      onDelete={handleDeleteBill}
                      onViewDetails={(billId) => router.push(`/dashboard/bills/${billId}`)}
                      loading={isLoading}
                      emptyMessage="No bills found"
                      hasMore={pagination.hasNextPage}
                      onLoadMore={handleLoadMore}
                      isLoadingMore={isLoadingMore}
                      openMenuId={openMenuId}
                      onMenuToggle={handleMenuToggle}
                      onMenuAction={handleMenuAction}
                      menuRefs={menuRefs}
                      formatCurrency={formatCurrency}
                      formatDate={formatDate}
                    />
                  ) : (
                    <BillGrid
                      bills={filteredBills}
                      selectedBills={selectedBills}
                      onSelect={handleBillSelect}
                      onSelectAll={handleSelectAll}
                      onEdit={(billId) => router.push(`/dashboard/bills/${billId}/edit`)}
                      onDelete={handleDeleteBill}
                      onViewDetails={(billId) => router.push(`/dashboard/bills/${billId}`)}
                      isLoadingMore={isLoadingMore}
                      openMenuId={openMenuId}
                      onMenuToggle={handleMenuToggle}
                      onMenuAction={handleMenuAction}
                      menuRefs={menuRefs}
                      formatCurrency={formatCurrency}
                      formatDate={formatDate}
                    />
                  )}
                </div>

                {/* Footer */}
                <div className="bg-[rgb(var(--color-bg-tertiary))] border-t border-[rgb(var(--color-border-primary))] px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-[rgb(var(--color-text-secondary))]">
                      {pagination.hasNextPage ? (
                        <>
                          Showing <span className="font-semibold text-[rgb(var(--color-text-primary))]">{bills.length}</span> bills
                          <span className="ml-2 text-xs text-[rgb(var(--color-primary))]">
                            • Scroll down to load more
                          </span>
                        </>
                      ) : (
                        <>
                          Showing <span className="font-semibold text-[rgb(var(--color-text-primary))]">{bills.length}</span> bills
                          <span className="ml-2 text-xs text-[rgb(var(--color-text-tertiary))]">
                            • No more bills
                          </span>
                        </>
                      )}
                    </div>
                    <div className="text-sm text-[rgb(var(--color-text-secondary))]">
                      {selectedBills.length > 0 && (
                        <span className="font-semibold text-[rgb(var(--color-primary))]">
                          {selectedBills.length} selected
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
      <BillDeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        billToDelete={billToDelete}
        formatCurrency={formatCurrency}
        isDeleting={isDeleting}
      />

      {/* Payment Drawer */}
      <BillPaymentDrawer
        isOpen={showPaymentDrawer}
        onClose={() => {
          setShowPaymentDrawer(false);
          setSelectedBillForPayment(null);
        }}
        bill={selectedBillForPayment}
        onSuccess={() => {
          // Refresh bills list after successful payment
          const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id;
          if (storeId) {
            dispatch(getBills({ store: storeId, limit: 20 }));
          }
        }}
      />
    </div>
  );
};

export default Bills;
