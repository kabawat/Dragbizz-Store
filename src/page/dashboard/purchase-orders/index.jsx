"use client"
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { getPurchaseOrders as getPOs, addMorePurchaseOrders, deletePurchaseOrder } from '@/store/slices/purchaseOrdersSlice';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
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
import { Button, Input, ToastContainer } from '@/components/ui';
import { useToast } from '@/hooks/useToast';
import { getStatusBadge as getCommonStatusBadge } from '@/utils/statusBadge';

// Import dedicated purchase order components
import PurchaseOrderTable from '@/components/purchaseOrders/PurchaseOrderTable';
import PurchaseOrderGrid from '@/components/purchaseOrders/PurchaseOrderGrid';
import CreateBillDrawer from '@/components/purchaseOrders/CreateBillDrawer';
import AdvancePaymentDrawer from '@/components/purchaseOrders/AdvancePaymentDrawer';
import { BillDeleteConfirmModal as PurchaseOrderDeleteConfirmModal } from '@/components/bills';

const PurchaseOrders = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { list: purchaseOrders, isLoading, pagination } = useAppSelector((state) => state.purchaseOrders);
  const { selectedStore } = useAppSelector((state) => state.profile);
  const { toasts, showToast, removeToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingDeleteIds, setPendingDeleteIds] = useState([]);
  
  // Create Bill Drawer state
  const [showCreateBillDrawer, setShowCreateBillDrawer] = useState(false);
  const [selectedPOForBill, setSelectedPOForBill] = useState(null);
  
  // Advance Payment Drawer state
  const [showAdvancePaymentDrawer, setShowAdvancePaymentDrawer] = useState(false);
  const [selectedPOForPayment, setSelectedPOForPayment] = useState(null);

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

useEffect(() => {
  if (pendingDeleteIds.length === 0) return;
  setPendingDeleteIds((prev) =>
    prev.filter((id) =>
      purchaseOrders.some((po) => (po._id || po.id) === id)
    )
  );
}, [purchaseOrders]);

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
    const poStatus = (po.status || '').toUpperCase();
    const isDeleted = poStatus === 'DELETED';

    switch (action) {
      case 'view':
        router.push(`/dashboard/purchase-orders/${po._id || po.id}`);
        break;
      case 'edit':
        if (isDeleted) return;
        router.push(`/dashboard/purchase-orders/${po._id || po.id}/edit`);
        break;
      case 'createBill':
        if (isDeleted) return;
        // Open create bill drawer with purchase order data
        setSelectedPOForBill(po);
        setShowCreateBillDrawer(true);
        setOpenMenuId(null);
        break;
      case 'advancePayment':
        if (isDeleted) return;
        // Open advance payment drawer with purchase order data
        setSelectedPOForPayment(po);
        setShowAdvancePaymentDrawer(true);
        setOpenMenuId(null);
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

const pendingDeleteSet = useMemo(() => new Set(pendingDeleteIds), [pendingDeleteIds]);

const getFilteredPOs = () => {
  let filtered = purchaseOrders
    .filter(po => !pendingDeleteSet.has(po._id || po.id));
    
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
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(po =>
        (po.poNumber || po.billNumber)?.toLowerCase().includes(lowerSearch) ||
        po.supplier?.name?.toLowerCase().includes(lowerSearch) ||
        (po.advanceAmount ?? 0).toString().includes(lowerSearch)
      );
    }
    return filtered;
  };

  const filteredPOs = getFilteredPOs();

  const normalizedPOs = filteredPOs.map((po) => {
    const billNumber = po.poNumber || po.billNumber;
    const billDate = po.poDate || po.billDate;
    const dueDate = po.expectedDeliveryDate || po.dueDate;
    const items = po.items || [];
    const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const receivedQuantity = items.reduce((sum, item) => sum + (item.receivedQuantity || 0), 0);
    const pendingQuantity = Math.max(totalQuantity - receivedQuantity, 0);
    const advanceAmount = po.advanceAmount ?? 0;
    return {
      ...po,
      billNumber,
      billDate,
      dueDate,
      totalQuantity,
      receivedQuantity,
      pendingQuantity,
      advanceAmount,
    };
  });

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

  const confirmDelete = async () => {
    if (!poToDelete || isDeleting) return;

    const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id;
    const poId = poToDelete._id || poToDelete.id;
    if (!poId) return;

    try {
      setIsDeleting(true);
      const result = await dispatch(deletePurchaseOrder({ id: poId, store: storeId })).unwrap();
      setPendingDeleteIds((prev) => (prev.includes(poId) ? prev : [...prev, poId]));
      setSelectedPOs((prev) => prev.filter((id) => id !== poId));
      setShowDeleteModal(false);
      setPoToDelete(null);
      const friendlyPo = poToDelete?.poNumber || poToDelete?.billNumber || poId;
      const poNumber = result?.poNumber || friendlyPo;
      
      // Show simple toast notification
      showToast(`Purchase Order ${poNumber} deletion has been scheduled.`, 'success', 3000);
    } catch (error) {
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCurrency = (amount = 0) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  const formatDate = (date) => {
    if (!date) return '--';
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return '--';
    return parsed.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusBadge = (po) => {
    const dueDateObj = po.dueDate ? new Date(po.dueDate) : null;
    const hasPending = (po.pendingQuantity ?? Math.max((po.totalQuantity || 0) - (po.receivedQuantity || 0), 0)) > 0;
    const isOverdue = !!dueDateObj && !Number.isNaN(dueDateObj.getTime()) && dueDateObj < new Date() && hasPending;
    
    if (isOverdue) {
      const config = getCommonStatusBadge('OVERDUE', 'purchase-order');
      return {
        variant: config.variant,
        icon: AlertTriangle,
        text: config.text,
        color: 'bg-red-500/10 text-red-600 border-red-500/20'
      };
    }

    const approval = (po.approvalStatus || '').toUpperCase();
    const config = getCommonStatusBadge(approval || 'PENDING', 'purchase-order');
    
    // Map icons for compatibility
    const iconMap = {
      'PENDING': Clock,
      'APPROVED': CheckCircle,
      'REJECTED': AlertTriangle
    };
    
    const getColorClass = (variant) => {
      switch(variant) {
        case 'success': return 'bg-green-500/10 text-green-600 border-green-500/20';
        case 'danger': return 'bg-red-500/10 text-red-600 border-red-500/20';
        case 'primary': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
        default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
      }
    };
    
    return {
      variant: config.variant,
      icon: iconMap[approval] || Clock,
      text: config.text,
      color: getColorClass(config.variant)
    };
  };

  return (
    <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
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
                        <List className={`w-4 h-4 ${viewMode === 'table' ? 'text-white' : 'text-[rgb(var(--color-text-secondary))] group-hover:text-[rgb(var(--color-text-primary))]'}`} />
                        Table
                      </button>
                      <button
                        onClick={() => handleViewModeChange('card')}
                        className={`px-3 cursor-pointer py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${viewMode === 'card' ? 'bg-[rgb(var(--color-primary))] text-white' : 'text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]'}`}
                      >
                        <Grid3X3 className={`w-4 h-4 ${viewMode === 'card' ? 'text-white' : 'text-[rgb(var(--color-text-secondary))] group-hover:text-[rgb(var(--color-text-primary))]'}`} />
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
                      <Plus className="w-4 h-4 mr-2 text-white" />
                      Create PO
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* PO list */}
            {purchaseOrders.length > 0 && (
              <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] overflow-hidden">
                <div className="h-[calc(100vh-200px)] overflow-y-auto" ref={scrollRef}>
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
                      formatCurrency={formatCurrency}
                      formatDate={formatDate}
                      enableSendMenu={true}
                    />
                  ) : (
                    <PurchaseOrderGrid
                      purchaseOrders={normalizedPOs}
                      selectedPurchaseOrders={selectedPOs}
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
                      formatCurrency={formatCurrency}
                      formatDate={formatDate}
                      enableSendMenu={true}
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
        isDeleting={isDeleting}
      />

      {/* Create Bill Drawer */}
      <CreateBillDrawer
        isOpen={showCreateBillDrawer}
        onClose={() => {
          setShowCreateBillDrawer(false);
          setSelectedPOForBill(null);
        }}
        purchaseOrder={selectedPOForBill}
        onSuccess={(bill) => {
          // Handle successful bill creation
          // You can add toast notification or refresh data here
        }}
      />

      <AdvancePaymentDrawer
        isOpen={showAdvancePaymentDrawer}
        onClose={() => {
          setShowAdvancePaymentDrawer(false);
          setSelectedPOForPayment(null);
        }}
        purchaseOrder={selectedPOForPayment}
        onSuccess={() => {
          // Handle successful advance payment creation
          // Refresh purchase orders list
          const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id;
          if (storeId) {
            dispatch(getPOs({ store: storeId, search: searchTerm, limit: 20, cursor: null }));
          }
        }}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default PurchaseOrders;


