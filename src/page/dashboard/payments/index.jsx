"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { getPayments, deletePayment } from '@/store/slices/paymentsSlice';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Calendar,
  IndianRupee,
  CheckCircle,
  Clock,
  Building2,
  AlertTriangle,
  XCircle,
  List,
  Grid3X3
} from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { getStatusBadge as getCommonStatusBadge } from '@/utils/statusBadge';
import { useTranslation } from '@/hooks/useTranslation';

const Payments = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { payments, stats, isLoading, error, currentFilter, pagination } = useAppSelector((state) => state.payments);
  const { selectedStore } = useAppSelector((state) => state.profile);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  const [viewMode, setViewMode] = useState('card');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedPayments, setSelectedPayments] = useState([]);
  const menuRefs = useRef({});
  const scrollRef = useRef(null);
  const lastFetchedStoreId = useRef(null);
  const hasFetched = useRef(false);

  // Get stable storeId
  const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id;

  // Handle view mode change
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('payments-view-mode', mode);
  };

  // Load saved view mode
  useEffect(() => {
    const savedViewMode = localStorage.getItem('payments-view-mode');
    if (savedViewMode && (savedViewMode === 'table' || savedViewMode === 'card')) {
      setViewMode(savedViewMode);
    }
  }, []);

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

  // Handle menu toggle
  const handleMenuToggle = (paymentId) => {
    setOpenMenuId(openMenuId === paymentId ? null : paymentId);
  };

  // Handle menu action
  const handleMenuAction = (paymentId, action) => {
    const payment = payments.find(p => (p._id || p.id) === paymentId);
    if (!payment) return;

    switch (action) {
      case 'view':
        router.push(`/dashboard/payments/view/${payment._id || payment.id}`);
        break;
      case 'edit':
        router.push(`/dashboard/payments/${payment._id || payment.id}/edit`);
        break;
      case 'delete':
        handleDeletePayment(payment);
        break;
      default:
        break;
    }
    setOpenMenuId(null);
  };

  // Fetch payments on component mount or store change (only once per store)
  useEffect(() => {
    if (!storeId) return;
    
    // Prevent duplicate calls for the same store
    if (lastFetchedStoreId.current === storeId && hasFetched.current) {
      return;
    }

    // Prevent call if already loading
    if (isLoading) {
      return;
    }

    lastFetchedStoreId.current = storeId;
    hasFetched.current = true;

    dispatch(getPayments({
      store: storeId,
      limit: 20,
      page: 1
    }));
  }, [dispatch, storeId, isLoading]);

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current || isLoadingMore || !pagination?.hasNextPage) return;

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
  }, [isLoadingMore, pagination?.hasNextPage]);

  // Handle load more
  const handleLoadMore = async () => {
    if (isLoadingMore || !pagination?.hasNextPage) return;

    setIsLoadingMore(true);
    try {
      const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id;
      await dispatch(getPayments({
        store: storeId,
        limit: 20,
        page: pagination?.page ? pagination.page + 1 : 2
      }));
    } catch (error) {
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case 'status':
        setStatusFilter(value);
        break;
      case 'supplier':
        setSupplierFilter(value);
        break;
      case 'method':
        setMethodFilter(value);
        break;
      case 'date':
        setDateRange(value);
        break;
      default:
        break;
    }
  };

  // Handle payment selection
  const handlePaymentSelect = (paymentId) => {
    setSelectedPayments(prev => {
      if (prev.includes(paymentId)) {
        return prev.filter(id => id !== paymentId);
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

  // Confirm delete
  const confirmDelete = async () => {
    if (paymentToDelete) {
      const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id;
      const paymentId = paymentToDelete._id || paymentToDelete.id;

      if (storeId && paymentId) {
        try {
          await dispatch(deletePayment({ paymentId, storeId })).unwrap();
          setShowDeleteModal(false);
          setPaymentToDelete(null);
          // Refresh payments list
          dispatch(getPayments({
            store: storeId,
            limit: pagination?.limit || 20,
            page: 1
          }));
        } catch (error) {
          // Error is already handled by the slice
        }
      }
    }
  };

  // Get status badge variant - using common function
  const getStatusBadge = (status) => {
    const statusUpper = String(status).toUpperCase();
    let mappedStatus = statusUpper;
    
    // Map payment-specific statuses
    if (statusUpper === 'COMPLETED' || statusUpper === 'APPROVED') {
      mappedStatus = 'COMPLETED';
    } else if (statusUpper === 'FAILED' || statusUpper === 'REJECTED') {
      mappedStatus = 'FAILED';
    }
    
    const config = getCommonStatusBadge(mappedStatus, 'general');
    
    // Map icons for compatibility
    const iconMap = {
      'COMPLETED': CheckCircle,
      'PENDING': Clock,
      'FAILED': XCircle,
      'DRAFT': Edit
    };
    
    return {
      variant: config.variant,
      icon: iconMap[statusUpper] || Clock,
      text: config.text
    };
  };

  // Get payment method badge
  const getPaymentMethodBadge = (method) => {
    switch (method?.toUpperCase()) {
      case 'CASH':
        return { variant: 'success', text: t('payments.cash') };
      case 'BANK_TRANSFER':
      case 'BANK':
        return { variant: 'info', text: t('payments.bankTransfer') };
      case 'CHEQUE':
        return { variant: 'warning', text: t('payments.cheque') };
      case 'UPI':
        return { variant: 'primary', text: t('payments.upi') };
      case 'CARD':
        return { variant: 'secondary', text: t('payments.card') };
      default:
        return { variant: 'secondary', text: method || t('payments.unknown') };
    }
  };

  // Get payment type badge
  const getPaymentTypeBadge = (type) => {
    switch (type?.toUpperCase()) {
      case 'ADVANCE_PAYMENT':
        return { variant: 'primary', text: t('payments.advancePayment') };
      case 'BILL_PAYMENT':
        return { variant: 'info', text: t('payments.billPayment') };
      case 'ADJUSTMENT':
        return { variant: 'warning', text: t('payments.adjustment') };
      case 'REFUND':
        return { variant: 'danger', text: 'Refund' };
      default:
        return { variant: 'secondary', text: type || 'Unknown' };
    }
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
          title={t('payments.title')}
          description={t('payments.description')}
        />

        {/* Main Content */}
        <div className="flex-1 p-5">
          <div className="max-w-8xl mx-auto">
            {/* Loading */}
            {isLoading && payments.length === 0 && (
              <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-8 mb-6">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                      {t('common.loadingData')}
                    </h2>
                    <p className="text-[rgb(var(--color-text-secondary))]">
                      {t('common.loading')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Search and filter */}
            {payments.length > 0 && (
              <div className="mb-3">
                <div className="flex justify-between items-center lg:flex-row gap-4 mb-0">
                  {/* Search */}
                  <div className="w-100">
                    <Input
                      type="text"
                      placeholder={`${t('common.search')} ${t('payments.title').toLowerCase()}...`}
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
                        {t('common.tableView')}
                      </button>
                      <button
                        onClick={() => handleViewModeChange('card')}
                        className={`px-3 cursor-pointer py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${viewMode === 'card' ? 'bg-[rgb(var(--color-primary))] text-white' : 'text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]'}`}
                      >
                        <Grid3X3 className="w-4 h-4" />
                        {t('common.cardView')}
                      </button>
                    </div>

                    <Button variant="primary" onClick={() => router.push('/dashboard/payments/create')} leftIcon={Plus}>
                      {t('payments.createPayment')}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && payments.length === 0 && (
              <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))]">
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 bg-[rgb(var(--color-bg-tertiary))] rounded-full flex items-center justify-center mb-4">
                    <CreditCard className="w-8 h-8 text-[rgb(var(--color-text-tertiary))]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                    {t('payments.noPayments')}
                  </h3>
                  <p className="text-[rgb(var(--color-text-secondary))] text-center max-w-md">
                    {t('common.noData')}
                  </p>
                  <div className="pt-4">
                    <Button
                      variant="primary"
                      onClick={() => router.push('/dashboard/payments/create')}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {t('payments.createPayment')}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Payments list */}
            {payments.length > 0 && (
              <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] overflow-hidden">
                <div className="h-[calc(100vh-200px)] overflow-y-auto" ref={scrollRef}>
                  {viewMode === 'table' ? (
                    <>
                      {/* Fixed Header */}
                      <div className="bg-gradient-to-r from-[rgb(var(--color-bg-tertiary))] to-[rgb(var(--color-bg-secondary))] border-b border-[rgb(var(--color-border-primary))] sticky top-0 z-20">
                        <table className="w-full min-w-[1000px] table-fixed">
                          <thead>
                            <tr>
                              <th className="w-1/6 px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                                Payment
                              </th>
                              <th className="w-1/7 px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">Supplier</th>
                              <th className="w-1/7 px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">Date</th>
                              <th className="w-1/7 px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">Amount</th>
                              <th className="w-1/7 px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">Type</th>
                              <th className="w-1/7 px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">Method</th>
                              <th className="w-1/7 px-6 py-4 text-left text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">Status</th>
                              <th className="w-32 px-6 py-4 text-center text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                                <MoreVertical className="w-4 h-4 mx-auto" />
                              </th>
                            </tr>
                          </thead>
                        </table>
                      </div>

                      {/* Scrollable Body */}
                      <div className="overflow-auto min-h-[calc(100vh-400px)]">
                        <table className="w-full min-w-[1000px] table-fixed">
                          <tbody className="divide-y divide-gray-100">
                            {payments.map((payment) => {
                              const paymentId = payment._id || payment.id;
                              const statusBadge = getStatusBadge(payment.paymentStatus || payment.status);
                              const methodBadge = getPaymentMethodBadge(payment.paymentMethod);
                              const typeBadge = getPaymentTypeBadge(payment.paymentType);
                              const StatusIcon = statusBadge.icon;

                              return (
                                <tr key={paymentId} className="group transition-all duration-200 hover:bg-[rgb(var(--color-bg-tertiary))] border-b border-[rgb(var(--color-border-primary))]">
                                  <td className="w-1/6 px-6 py-4">
                                    <div className="font-medium text-[rgb(var(--color-text-primary))]">{payment.paymentNumber}</div>
                                  </td>
                                  <td className="w-1/7 px-6 py-4">
                                    <div className="flex items-center">
                                      <Building2 className="w-4 h-4 text-[rgb(var(--color-text-tertiary))] mr-2" />
                                      <span className="text-[rgb(var(--color-text-primary))]">{payment.supplier?.name || 'N/A'}</span>
                                    </div>
                                  </td>
                                  <td className="w-1/7 px-6 py-4 text-[rgb(var(--color-text-secondary))]">{formatDate(payment.paymentDate)}</td>
                                  <td className="w-1/7 px-6 py-4 font-medium text-[rgb(var(--color-text-primary))]">{formatCurrency(payment.totalAmount || payment.amount)}</td>
                                  <td className="w-1/7 px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${typeBadge.variant === 'primary' ? 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20' :
                                      typeBadge.variant === 'info' ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20' :
                                        typeBadge.variant === 'warning' ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20' :
                                          typeBadge.variant === 'danger' ? 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20' :
                                            'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20'
                                      }`}>
                                      {typeBadge.text}
                                    </span>
                                  </td>
                                  <td className="w-1/7 px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${methodBadge.variant === 'success' ? 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20' :
                                      methodBadge.variant === 'info' ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20' :
                                        methodBadge.variant === 'warning' ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20' :
                                          methodBadge.variant === 'primary' ? 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20' :
                                            'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20'
                                      }`}>
                                      {methodBadge.text}
                                    </span>
                                  </td>
                                  <td className="w-1/7 px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadge.variant === 'success' ? 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20' :
                                      statusBadge.variant === 'warning' ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20' :
                                        statusBadge.variant === 'danger' ? 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20' :
                                          'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20'
                                      }`}>
                                      <StatusIcon className="w-3 h-3 mr-1" />
                                      {statusBadge.text}
                                    </span>
                                  </td>
                                  <td className="w-32 px-6 py-4 text-center">
                                    <div className="relative inline-block" ref={(el) => (menuRefs.current[paymentId] = el)}>
                                      <button
                                        onClick={() => handleMenuToggle(paymentId)}
                                        className="p-2 hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors duration-200 group/btn cursor-pointer"
                                        title="More Actions"
                                      >
                                        <MoreVertical className="w-4 h-4 text-[rgb(var(--color-text-secondary))] group-hover/btn:text-[rgb(var(--color-primary))]" />
                                      </button>

                                      {/* Popup Menu */}
                                      {openMenuId === paymentId && (
                                        <div className="absolute right-0 top-full mt-1 w-48 bg-[rgb(var(--color-bg-primary))] rounded-lg shadow-lg border border-[rgb(var(--color-border-primary))] py-1 z-50">
                                          <button
                                            onClick={() => handleMenuAction(paymentId, 'view')}
                                            className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-[rgb(var(--color-bg-secondary))]"
                                          >
                                            <Eye className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                                            View Details
                                          </button>
                                          <button
                                            onClick={() => handleMenuAction(paymentId, 'edit')}
                                            className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-[rgb(var(--color-bg-secondary))]"
                                          >
                                            <Edit className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                                            Edit
                                          </button>
                                          <button
                                            onClick={() => handleMenuAction(paymentId, 'delete')}
                                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-500/10 flex items-center gap-3 transition-colors duration-200 cursor-pointer focus:outline-none focus:bg-red-500/10"
                                          >
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                            Delete
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>

                        {/* Infinite Scroll Loading */}
                        {isLoadingMore && (
                          <div className="flex items-center justify-center py-4">
                            <div className="flex items-center gap-3">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[rgb(var(--color-primary))]"></div>
                              <span className="text-sm text-[rgb(var(--color-text-secondary))]">{t('payments.loadingMore')}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="overflow-auto min-h-[calc(100vh-400px)] p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {payments.map((payment) => {
                          const paymentId = payment._id || payment.id;
                          const statusBadge = getStatusBadge(payment.paymentStatus || payment.status);
                          const methodBadge = getPaymentMethodBadge(payment.paymentMethod);
                          const typeBadge = getPaymentTypeBadge(payment.paymentType);
                          const StatusIcon = statusBadge.icon;

                          return (
                            <div key={paymentId} className="w-full max-w-sm mx-auto rounded-xl border border-[rgb(var(--color-border-primary))] transition-all duration-300 ease-out group overflow-hidden">
                              {/* Checkbox */}
                              <div className="absolute top-4 left-4 z-10">
                                <input
                                  type="checkbox"
                                  checked={selectedPayments.includes(paymentId)}
                                  onChange={() => handlePaymentSelect(paymentId)}
                                  className="w-4 h-4 rounded focus:ring-blue-500"
                                />
                              </div>

                              {/* Payment Header with Gradient Background */}
                              <div className="w-full h-32 sm:h-36 md:h-40 bg-gradient-to-br from-[rgb(var(--color-primary))]/10 to-[rgb(var(--color-primary))]/20 relative">
                                <div className="w-full h-full flex items-center justify-center">
                                  <CreditCard className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-[rgb(var(--color-primary))]" />
                                </div>

                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-t-xl"></div>

                                {/* Action Menu */}
                                <div className="absolute top-4 right-4 z-10">
                                  <div className="relative" ref={(el) => (menuRefs.current[paymentId] = el)}>
                                    <button
                                      onClick={() => handleMenuToggle(paymentId)}
                                      className="p-2 bg-white/90 hover:bg-white rounded-lg transition-colors duration-200 group/btn cursor-pointer shadow-sm"
                                      title="More Actions"
                                    >
                                      <MoreVertical className="w-4 h-4 text-[rgb(var(--color-text-secondary))] group-hover/btn:text-[rgb(var(--color-primary))]" />
                                    </button>

                                    {/* Popup Menu */}
                                    {openMenuId === paymentId && (
                                      <div className="absolute right-0 top-full mt-1 w-48 bg-[rgb(var(--color-bg-primary))] rounded-lg shadow-lg border border-[rgb(var(--color-border-primary))] py-1 z-50">
                                        <button
                                          onClick={() => handleMenuAction(paymentId, 'view')}
                                          className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-3 transition-colors duration-200 cursor-pointer"
                                        >
                                          <Eye className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                                          View Details
                                        </button>
                                        <button
                                          onClick={() => handleMenuAction(paymentId, 'edit')}
                                          className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] flex items-center gap-3 transition-colors duration-200 cursor-pointer"
                                        >
                                          <Edit className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                                          Edit
                                        </button>
                                        <div className="border-t border-[rgb(var(--color-border-primary))] my-1"></div>
                                        <button
                                          onClick={() => handleMenuAction(paymentId, 'delete')}
                                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-500/10 flex items-center gap-3 transition-colors duration-200 cursor-pointer"
                                        >
                                          <Trash2 className="w-4 h-4 text-red-500" />
                                          Delete
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Card Content */}
                              <div className="p-3 sm:p-4 md:p-6 space-y-2 sm:space-y-3 md:space-y-4">
                                {/* Payment Info */}
                                <div>
                                  <h3 className="font-bold text-md sm:text-lg xl:text-lg mb-1 text-[rgb(var(--color-text-primary))] line-clamp-1">{payment.paymentNumber}</h3>
                                  <p className="text-xs sm:text-sm font-medium text-[rgb(var(--color-text-secondary))]">
                                    {payment.supplier?.name || 'N/A'}
                                  </p>
                                </div>

                                {/* Status, Type and Method Badges */}
                                <div className="flex flex-wrap gap-1 sm:gap-2">
                                  <span className={`inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium border ${statusBadge.variant === 'success' ? 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20' :
                                    statusBadge.variant === 'warning' ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20' :
                                      statusBadge.variant === 'danger' ? 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20' :
                                        'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20'
                                    }`}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {statusBadge.text}
                                  </span>
                                  <span className={`inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium border ${typeBadge.variant === 'primary' ? 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20' :
                                    typeBadge.variant === 'info' ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20' :
                                      typeBadge.variant === 'warning' ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20' :
                                        typeBadge.variant === 'danger' ? 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20' :
                                          'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20'
                                    }`}>
                                    {typeBadge.text}
                                  </span>
                                  <span className={`inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium border ${methodBadge.variant === 'success' ? 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20' :
                                    methodBadge.variant === 'info' ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20' :
                                      methodBadge.variant === 'warning' ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20' :
                                        methodBadge.variant === 'primary' ? 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20' :
                                          'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20'
                                    }`}>
                                    {methodBadge.text}
                                  </span>
                                </div>

                                {/* Payment Details */}
                                <div className="space-y-2">
                                  <div className="flex items-center text-xs sm:text-sm text-[rgb(var(--color-text-secondary))]">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    <span>{formatDate(payment.paymentDate)}</span>
                                  </div>
                                </div>

                                {/* Amount */}
                                <div className="flex items-center justify-between">
                                  <div className="text-xs sm:text-sm text-[rgb(var(--color-text-secondary))]">
                                    <span className="font-medium">Amount:</span>
                                  </div>
                                  <div className="text-lg sm:text-lg xl:text-lg font-bold text-[rgb(var(--color-text-primary))]">
                                    {formatCurrency(payment.totalAmount || payment.amount)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {isLoadingMore && (
                        <div className="flex items-center justify-center py-8">
                          <div className="flex items-center gap-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[rgb(var(--color-primary))]"></div>
                            <span className="text-sm text-[rgb(var(--color-text-secondary))]">Loading more payments...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="bg-[rgb(var(--color-bg-tertiary))] border-t border-[rgb(var(--color-border-primary))] px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-[rgb(var(--color-text-secondary))]">
                      {pagination?.hasNextPage ? (
                        <>
                          Showing <span className="font-semibold text-[rgb(var(--color-text-primary))]">{payments.length}</span> payments
                          <span className="ml-2 text-xs text-[rgb(var(--color-primary))]">
                            • Scroll down to load more
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="font-semibold text-[rgb(var(--color-text-primary))]">{t('payments.showingPayments', { count: payments.length })}</span>
                          <span className="ml-2 text-xs text-[rgb(var(--color-text-tertiary))]">
                            • {t('payments.noMore')}
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
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-[9999]">
          <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4">
              Delete Payment
            </h3>
            <p className="text-[rgb(var(--color-text-secondary))] mb-6">
              Are you sure you want to delete this payment? This action cannot be undone.
            </p>
            {paymentToDelete && (
              <div className="bg-[rgb(var(--color-bg-secondary))] p-4 rounded-lg mb-6">
                <p className="font-medium text-[rgb(var(--color-text-primary))]">Payment: {paymentToDelete.paymentNumber}</p>
                <p className="text-sm text-[rgb(var(--color-text-secondary))]">Amount: {formatCurrency(paymentToDelete.totalAmount || paymentToDelete.amount)}</p>
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmDelete} >
                Delete Payment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
