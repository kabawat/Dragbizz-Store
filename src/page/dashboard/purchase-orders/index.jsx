"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { getPurchaseOrders as getPOs, addMorePurchaseOrders } from '@/store/slices/purchaseOrdersSlice';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { AnimatedBackground } from '@/components/ui';
import {
  FileText,
  Plus,
  Search,
  List,
  Grid3X3,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Button, Input } from '@/components/ui';

// Reuse bill table/grid components to mirror UI (data naming stays generic)
import { BillTable as PurchaseOrderTable, BillGrid as PurchaseOrderGrid, BillDeleteConfirmModal as PurchaseOrderDeleteConfirmModal } from '@/components/bills';

const PurchaseOrders = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { list: purchaseOrders, isLoading, error, pagination } = useAppSelector((state) => state.purchaseOrders);
  const { selectedStore } = useAppSelector((state) => state.profile);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [selectedPOs, setSelectedPOs] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRefs = useRef({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [poToDelete, setPoToDelete] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const scrollRef = useRef(null);
  const [viewMode, setViewMode] = useState('table');
  const lastFetchRef = useRef({ storeId: null, search: null, cursor: null });

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('purchase-orders-view-mode', mode);
  };

  useEffect(() => {
    const savedViewMode = localStorage.getItem('purchase-orders-view-mode');
    if (savedViewMode && (savedViewMode === 'table' || savedViewMode === 'card')) {
      setViewMode(savedViewMode);
    }
  }, []);

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

  // Fetch POs
  useEffect(() => {
    const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id;
    if (!storeId) return;

    if (
      lastFetchRef.current.storeId === storeId &&
      lastFetchRef.current.search === searchTerm &&
      lastFetchRef.current.cursor === null
    ) {
      return;
    }

    lastFetchRef.current = { storeId, search: searchTerm, cursor: null };
    dispatch(getPOs({ store: storeId, search: searchTerm, limit: 20, cursor: null }));
  }, [dispatch, selectedStore, searchTerm]);

  const handleMenuToggle = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleMenuAction = (id, action) => {
    const po = purchaseOrders.find(b => (b._id || b.id) === id);
    if (!po) return;
    switch (action) {
      case 'view':
        router.push(`/dashboard/purchase-orders/${po._id || po.id}`);
        break;
      case 'edit':
        router.push(`/dashboard/purchase-orders/${po._id || po.id}/edit`);
        break;
      case 'delete':
        handleDelete(po);
        break;
      default:
        break;
    }
    setOpenMenuId(null);
  };

  const handleLoadMore = async () => {
    if (isLoadingMore || !pagination.hasNextPage) return;
    const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id;
    if (!storeId) return;
    try {
      setIsLoadingMore(true);
      const nextCursor = pagination.nextCursor;

      // Prevent duplicate load-more with the same cursor
      if (
        lastFetchRef.current.storeId === storeId &&
        lastFetchRef.current.search === searchTerm &&
        lastFetchRef.current.cursor === nextCursor
      ) {
        return;
      }

      lastFetchRef.current = { storeId, search: searchTerm, cursor: nextCursor };
      const resultAction = await dispatch(getPOs({ store: storeId, search: searchTerm, limit: 20, cursor: nextCursor }));
      const payload = resultAction?.payload;
      if (payload?.data) {
        dispatch(addMorePurchaseOrders(payload.data));
      }
    } finally {
      setIsLoadingMore(false);
    }
  };

  const getFilteredPOs = () => {
    let filtered = [...purchaseOrders];
    if (statusFilter !== 'all') {
      filtered = filtered.filter(po => {
        const isOverdue = new Date(po.dueDate) < new Date() && (po.dueAmount || 0) > 0;
        switch (statusFilter) {
          case 'pending':
            return po.paymentStatus === 'UNPAID' || po.paymentStatus === 'PARTIAL';
          case 'overdue':
            return isOverdue;
          case 'paid':
            return po.paymentStatus === 'PAID';
          default:
            return true;
        }
      });
    }
    if (supplierFilter !== 'all') {
      filtered = filtered.filter(po => po.supplier?.name?.toLowerCase().includes(supplierFilter.toLowerCase()));
    }
    if (dateRange !== 'all') {
      const now = new Date();
      filtered = filtered.filter(po => {
        const date = new Date(po.billDate);
        switch (dateRange) {
          case 'today':
            return date.toDateString() === now.toDateString();
          case 'week':
            return date >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          case 'month':
            return date >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          case 'year':
            return date >= new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          default:
            return true;
        }
      });
    }
    if (searchTerm) {
      filtered = filtered.filter(po =>
        (po.poNumber || po.billNumber)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.totalAmount?.toString().includes(searchTerm)
      );
    }
    return filtered;
  };

  const filteredPOs = getFilteredPOs();

  const mapPoStatusToPaymentStatus = (status) => {
    // Map PO status to table's payment-like status just for badge coloring
    switch ((status || '').toUpperCase()) {
      case 'CLOSED':
      case 'RECEIVED':
      case 'COMPLETED':
      case 'FULLY_RECEIVED':
        return 'PAID';
      case 'PARTIALLY_RECEIVED':
        return 'PARTIAL';
      case 'CANCELLED':
      case 'EXPIRED':
        return 'UNPAID';
      case 'OPEN':
      case 'PENDING':
      case 'DRAFT':
      case 'SENT':
      case 'ACKNOWLEDGED':
      default:
        return 'UNPAID';
    }
  };

  const normalizedPOs = filteredPOs.map((po) => ({
    ...po,
    billNumber: po.poNumber || po.billNumber,
    billDate: po.poDate || po.billDate,
    dueDate: po.expectedDeliveryDate || po.dueDate,
    paidAmount: po.advanceAmount ?? po.paidAmount ?? 0,
    dueAmount: po.remainingAmount ?? po.dueAmount ?? Math.max((po.totalAmount || 0) - (po.advanceAmount || 0), 0),
    paymentStatus: mapPoStatusToPaymentStatus(po.status || po.paymentStatus),
  }));

  const handleSelect = (id) => {
    setSelectedPOs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (selectedPOs.length === purchaseOrders.length) {
      setSelectedPOs([]);
    } else {
      setSelectedPOs(purchaseOrders.map(po => po._id || po.id));
    }
  };

  const handleDelete = (po) => {
    setPoToDelete(po);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (poToDelete) {
      // Implement PO delete when API exists
      setShowDeleteModal(false);
      setPoToDelete(null);
    }
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

  const getStatusBadge = (po) => {
    const isOverdue = new Date(po.dueDate) < new Date() && (po.dueAmount || 0) > 0;
    if (isOverdue) {
      return { variant: 'danger', icon: AlertTriangle, text: 'Overdue', color: 'bg-red-500/10 text-red-600 border-red-500/20' };
    }
    // Prefer explicit PO status text if available
    const statusText = (po.status || '').toUpperCase();
    if (statusText) {
      switch (statusText) {
        case 'DRAFT':
          return { variant: 'secondary', icon: Clock, text: 'Draft', color: 'bg-gray-500/10 text-gray-600 border-gray-500/20' };
        case 'SENT':
          return { variant: 'info', icon: Clock, text: 'Sent', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' };
        case 'ACKNOWLEDGED':
          return { variant: 'info', icon: CheckCircle, text: 'Acknowledged', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' };
        case 'OPEN':
          return { variant: 'secondary', icon: Clock, text: 'Open', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' };
        case 'APPROVED':
          return { variant: 'info', icon: CheckCircle, text: 'Approved', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' };
        case 'PENDING':
          return { variant: 'secondary', icon: Clock, text: 'Pending', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' };
        case 'PARTIALLY_RECEIVED':
          return { variant: 'warning', icon: Clock, text: 'Partially Received', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' };
        case 'RECEIVED':
        case 'COMPLETED':
        case 'FULLY_RECEIVED':
          return { variant: 'success', icon: CheckCircle, text: 'Completed', color: 'bg-green-500/10 text-green-600 border-green-500/20' };
        case 'CANCELLED':
          return { variant: 'danger', icon: AlertTriangle, text: 'Cancelled', color: 'bg-red-500/10 text-red-600 border-red-500/20' };
        case 'EXPIRED':
          return { variant: 'danger', icon: AlertTriangle, text: 'Expired', color: 'bg-red-500/10 text-red-600 border-red-500/20' };
        default:
          break;
      }
    }
    // If approvalStatus is provided and significant, reflect it
    const approval = (po.approvalStatus || '').toUpperCase();
    switch (approval) {
      case 'PENDING':
        return { variant: 'info', icon: Clock, text: 'Approval Pending', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' };
      case 'APPROVED':
        return { variant: 'success', icon: CheckCircle, text: 'Approved', color: 'bg-green-500/10 text-green-600 border-green-500/20' };
      case 'REJECTED':
        return { variant: 'danger', icon: AlertTriangle, text: 'Rejected', color: 'bg-red-500/10 text-red-600 border-red-500/20' };
      default:
        break;
    }
    switch (po.paymentStatus) {
      case 'PAID':
        return { variant: 'success', icon: CheckCircle, text: 'Paid', color: 'bg-green-500/10 text-green-600 border-green-500/20' };
      case 'PARTIAL':
        return { variant: 'warning', icon: Clock, text: 'Partial', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' };
      case 'UNPAID':
        return { variant: 'secondary', icon: Clock, text: 'Pending', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' };
      default:
        return { variant: 'secondary', icon: Clock, text: 'Unknown', color: 'bg-gray-500/10 text-gray-600 border-gray-500/20' };
    }
  };

  return (
    <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
      <AnimatedBackground variant="default" />
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
        {/* Header */}
        <Header
          title="Purchase Orders"
          description="Manage supplier purchase orders"
        />

        {/* Main Content */}
        <div className="flex-1 p-5">
          <div className="max-w-8xl mx-auto">
            {/* Loading */}
            {isLoading && purchaseOrders.length === 0 && (
              <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-8 mb-6">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                      Loading Purchase Orders...
                    </h2>
                    <p className="text-[rgb(var(--color-text-secondary))]">
                      Please wait while we fetch your purchase orders
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Search and filter */}
            {purchaseOrders.length > 0 && (
              <div className="mb-3">
                <div className="flex justify-between items-center lg:flex-row gap-4 mb-0">
                  {/* Search */}
                  <div className="w-100 bg-red">
                    <Input
                      type="text"
                      placeholder="Search purchase orders..."
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

                    <Button variant="primary" onClick={() => router.push('/dashboard/purchase-orders/create')} leftIcon={Plus}>
                      Create PO
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && purchaseOrders.length === 0 && (
              <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))]">
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 bg-[rgb(var(--color-bg-tertiary))] rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-[rgb(var(--color-text-tertiary))]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                    No purchase orders found
                  </h3>
                  <p className="text-[rgb(var(--color-text-secondary))] text-center max-w-md">
                    No purchase orders match your current criteria. Try adjusting your search or add new purchase orders.
                  </p>
                  <div className="pt-4">
                    <Button
                      variant="primary"
                      onClick={() => router.push('/dashboard/purchase-orders/create')}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create PO
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* PO list */}
            {purchaseOrders.length > 0 && (
              <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] overflow-hidden">
                <div className="h-[calc(100vh-208px)] overflow-y-auto" ref={scrollRef}>
                  {viewMode === 'table' ? (
                    <PurchaseOrderTable
                      bills={normalizedPOs}
                      selectedBills={selectedPOs}
                      onSelect={handleSelect}
                      onSelectAll={handleSelectAll}
                      onEdit={(id) => router.push(`/dashboard/purchase-orders/${id}/edit`)}
                      onDelete={handleDelete}
                      onViewDetails={(id) => router.push(`/dashboard/purchase-orders/${id}`)}
                      loading={isLoading}
                      emptyMessage="No purchase orders found"
                      hasMore={pagination.hasNextPage}
                      onLoadMore={handleLoadMore}
                      isLoadingMore={isLoadingMore}
                      openMenuId={openMenuId}
                      onMenuToggle={handleMenuToggle}
                      onMenuAction={handleMenuAction}
                      menuRefs={menuRefs}
                      getStatusBadge={getStatusBadge}
                      formatCurrency={formatCurrency}
                      formatDate={formatDate}
                    />
                  ) : (
                    <PurchaseOrderGrid
                      bills={normalizedPOs}
                      selectedBills={selectedPOs}
                      onSelect={handleSelect}
                      onSelectAll={handleSelectAll}
                      onEdit={(id) => router.push(`/dashboard/purchase-orders/${id}/edit`)}
                      onDelete={handleDelete}
                      onViewDetails={(id) => router.push(`/dashboard/purchase-orders/${id}`)}
                      isLoadingMore={isLoadingMore}
                      openMenuId={openMenuId}
                      onMenuToggle={handleMenuToggle}
                      onMenuAction={handleMenuAction}
                      menuRefs={menuRefs}
                      getStatusBadge={getStatusBadge}
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
                          Showing <span className="font-semibold text-[rgb(var(--color-text-primary))]">{purchaseOrders.length}</span> purchase orders
                          <span className="ml-2 text-xs text-[rgb(var(--color-primary))]">
                            • Scroll down to load more
                          </span>
                        </>
                      ) : (
                        <>
                          Showing <span className="font-semibold text-[rgb(var(--color-text-primary))]">{purchaseOrders.length}</span> purchase orders
                          <span className="ml-2 text-xs text-[rgb(var(--color-text-tertiary))]">
                            • No more purchase orders
                          </span>
                        </>
                      )}
                    </div>
                    <div className="text-sm text-[rgb(var(--color-text-secondary))]">
                      {selectedPOs.length > 0 && (
                        <span className="font-semibold text-[rgb(var(--color-primary))]">
                          {selectedPOs.length} selected
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
      <PurchaseOrderDeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        billToDelete={poToDelete}
        formatCurrency={formatCurrency}
      />
    </div>
  );
};

export default PurchaseOrders;


