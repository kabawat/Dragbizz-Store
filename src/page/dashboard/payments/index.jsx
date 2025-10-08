"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { getPayments } from '@/store/slices/paymentsSlice';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { AnimatedBackground } from '@/components/ui';
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
  XCircle
} from 'lucide-react';
import { Button, Input, Select, Badge, Card, Modal } from '@/components/ui';

const Payments = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { payments, stats, isLoading, error, currentFilter, viewMode, pagination } = useAppSelector((state) => state.payments);
  const { selectedStore } = useAppSelector((state) => state.profile);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);

  // Fetch payments and stats on component mount
  useEffect(() => {
    if (selectedStore?.id) {
      dispatch(getPayments({ 
        store: selectedStore.id,
        limit: 20,
        page: 1
      }));
      dispatch(getPaymentStats(selectedStore.id));
    }
  }, [dispatch, selectedStore]);

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
    // Implement search logic here
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
    setSelectedPayments(prev => 
      prev.includes(paymentId) 
        ? prev.filter(id => id !== paymentId)
        : [...prev, paymentId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedPayments.length === payments.length) {
      setSelectedPayments([]);
    } else {
      setSelectedPayments(payments.map(payment => payment.id));
    }
  };

  // Handle delete payment
  const handleDeletePayment = (payment) => {
    setPaymentToDelete(payment);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (paymentToDelete) {
      // Implement delete logic here
      console.log('Deleting payment:', paymentToDelete.id);
      setShowDeleteModal(false);
      setPaymentToDelete(null);
    }
  };

  // Get status badge variant
  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return { variant: 'success', icon: CheckCircle, text: 'Approved' };
      case 'pending':
        return { variant: 'warning', icon: Clock, text: 'Pending' };
      case 'rejected':
        return { variant: 'danger', icon: XCircle, text: 'Rejected' };
      case 'draft':
        return { variant: 'secondary', icon: Edit, text: 'Draft' };
      default:
        return { variant: 'secondary', icon: Clock, text: 'Unknown' };
    }
  };

  // Get payment method badge
  const getPaymentMethodBadge = (method) => {
    switch (method) {
      case 'cash':
        return { variant: 'success', text: 'Cash' };
      case 'bank_transfer':
        return { variant: 'info', text: 'Bank Transfer' };
      case 'cheque':
        return { variant: 'warning', text: 'Cheque' };
      case 'upi':
        return { variant: 'primary', text: 'UPI' };
      case 'card':
        return { variant: 'secondary', text: 'Card' };
      default:
        return { variant: 'secondary', text: 'Unknown' };
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
    <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative">
      <AnimatedBackground variant="default" />
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
        {/* Header */}
        <Header
          title="Payments"
          description="Manage supplier payments and track payment status"
        />

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Payments</p>
                  <p className="text-2xl font-bold">{stats.totalPayments}</p>
                </div>
                <CreditCard className="w-8 h-8 text-blue-200" />
              </div>
            </Card>

            <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">Pending Payments</p>
                  <p className="text-2xl font-bold">{stats.pendingPayments}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-200" />
              </div>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Approved Payments</p>
                  <p className="text-2xl font-bold">{stats.approvedPayments}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-200" />
              </div>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Total Amount</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</p>
                </div>
                <IndianRupee className="w-8 h-8 text-purple-200" />
              </div>
            </Card>
          </div>

          {/* Filters and Actions */}
          <Card className="mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search payments..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="pl-10"
                  />
                </div>

                <Select
                  value={statusFilter}
                  onChange={(value) => handleFilterChange('status', value)}
                  options={[
                    { value: 'all', label: 'All Status' },
                    { value: 'approved', label: 'Approved' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'rejected', label: 'Rejected' },
                    { value: 'draft', label: 'Draft' }
                  ]}
                />

                <Select
                  value={supplierFilter}
                  onChange={(value) => handleFilterChange('supplier', value)}
                  options={[
                    { value: 'all', label: 'All Suppliers' },
                    { value: 'supplier1', label: 'Supplier 1' },
                    { value: 'supplier2', label: 'Supplier 2' }
                  ]}
                />

                <Select
                  value={methodFilter}
                  onChange={(value) => handleFilterChange('method', value)}
                  options={[
                    { value: 'all', label: 'All Methods' },
                    { value: 'cash', label: 'Cash' },
                    { value: 'bank_transfer', label: 'Bank Transfer' },
                    { value: 'cheque', label: 'Cheque' },
                    { value: 'upi', label: 'UPI' },
                    { value: 'card', label: 'Card' }
                  ]}
                />

                <Select
                  value={dateRange}
                  onChange={(value) => handleFilterChange('date', value)}
                  options={[
                    { value: 'all', label: 'All Time' },
                    { value: 'today', label: 'Today' },
                    { value: 'week', label: 'This Week' },
                    { value: 'month', label: 'This Month' },
                    { value: 'year', label: 'This Year' }
                  ]}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  leftIcon={Download}
                  onClick={() => {/* Export logic */}}
                >
                  Export
                </Button>
                <Button
                  variant="primary"
                  leftIcon={Plus}
                  onClick={() => router.push('/dashboard/payments/create')}
                >
                  Create Payment
                </Button>
              </div>
            </div>
          </Card>

          {/* Payments Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-4">
                      <input
                        type="checkbox"
                        checked={selectedPayments.length === payments.length && payments.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="text-left p-4 font-medium text-gray-900">Payment Number</th>
                    <th className="text-left p-4 font-medium text-gray-900">Supplier</th>
                    <th className="text-left p-4 font-medium text-gray-900">Date</th>
                    <th className="text-left p-4 font-medium text-gray-900">Amount</th>
                    <th className="text-left p-4 font-medium text-gray-900">Method</th>
                    <th className="text-left p-4 font-medium text-gray-900">Status</th>
                    <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => {
                    const statusBadge = getStatusBadge(payment.status);
                    const methodBadge = getPaymentMethodBadge(payment.paymentMethod);
                    const StatusIcon = statusBadge.icon;
                    
                    return (
                      <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedPayments.includes(payment.id)}
                            onChange={() => handlePaymentSelect(payment.id)}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-gray-900">{payment.paymentNumber}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center">
                            <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">{payment.supplier?.name || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-600">{formatDate(payment.paymentDate)}</td>
                        <td className="p-4 font-medium text-gray-900">{formatCurrency(payment.amount)}</td>
                        <td className="p-4">
                          <Badge variant={methodBadge.variant}>
                            {methodBadge.text}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge variant={statusBadge.variant} className="flex items-center gap-1">
                            <StatusIcon className="w-3 h-3" />
                            {statusBadge.text}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={Eye}
                              onClick={() => router.push(`/dashboard/payments/${payment.id}`)}
                            >
                              View
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={Edit}
                              onClick={() => router.push(`/dashboard/payments/${payment.id}/edit`)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={Trash2}
                              onClick={() => handleDeletePayment(payment)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {payments.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
                <p className="text-gray-600 mb-4">Get started by creating your first payment.</p>
                <Button
                  variant="primary"
                  leftIcon={Plus}
                  onClick={() => router.push('/dashboard/payments/create')}
                >
                  Create Payment
                </Button>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading payments...</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Payment"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this payment? This action cannot be undone.
          </p>
          {paymentToDelete && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">Payment: {paymentToDelete.paymentNumber}</p>
              <p className="text-sm text-gray-600">Amount: {formatCurrency(paymentToDelete.amount)}</p>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
            >
              Delete Payment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Payments;
