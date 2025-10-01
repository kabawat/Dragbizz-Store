"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { getBills, getBillStats, setCurrentFilter, setViewMode } from '@/store/slices/billsSlice';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { AnimatedBackground } from '@/components/ui';
import { 
  Receipt, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  MoreVertical,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building2
} from 'lucide-react';
import { Button, Input, Select, Badge, Card, Modal } from '@/components/ui';

const Bills = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { bills, stats, isLoading, error, currentFilter, viewMode, pagination } = useAppSelector((state) => state.bills);
  const { selectedStore } = useAppSelector((state) => state.profile);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [selectedBills, setSelectedBills] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [billToDelete, setBillToDelete] = useState(null);

  // Fetch bills and stats on component mount
  useEffect(() => {
    if (selectedStore?.id) {
      dispatch(getBills({ 
        store: selectedStore.id,
        limit: 20,
        page: 1
      }));
      dispatch(getBillStats(selectedStore.id));
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
      setSelectedBills(bills.map(bill => bill.id));
    }
  };

  // Handle delete bill
  const handleDeleteBill = (bill) => {
    setBillToDelete(bill);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (billToDelete) {
      // Implement delete logic here
      console.log('Deleting bill:', billToDelete.id);
      setShowDeleteModal(false);
      setBillToDelete(null);
    }
  };

  // Get status badge variant
  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return { variant: 'success', icon: CheckCircle, text: 'Paid' };
      case 'pending':
        return { variant: 'warning', icon: Clock, text: 'Pending' };
      case 'overdue':
        return { variant: 'danger', icon: AlertTriangle, text: 'Overdue' };
      case 'draft':
        return { variant: 'secondary', icon: Edit, text: 'Draft' };
      default:
        return { variant: 'secondary', icon: Clock, text: 'Unknown' };
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
          title="Bills"
          description="Manage supplier bills and track payment status"
        />

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Bills</p>
                  <p className="text-2xl font-bold">{stats.totalBills}</p>
                </div>
                <Receipt className="w-8 h-8 text-blue-200" />
              </div>
            </Card>

            <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">Pending Bills</p>
                  <p className="text-2xl font-bold">{stats.pendingBills}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-200" />
              </div>
            </Card>

            <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Overdue Bills</p>
                  <p className="text-2xl font-bold">{stats.overdueBills}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-200" />
              </div>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Total Amount</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-200" />
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
                    placeholder="Search bills..."
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
                    { value: 'paid', label: 'Paid' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'overdue', label: 'Overdue' },
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
                  onClick={() => router.push('/dashboard/bills/create')}
                >
                  Create Bill
                </Button>
              </div>
            </div>
          </Card>

          {/* Bills Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-4">
                      <input
                        type="checkbox"
                        checked={selectedBills.length === bills.length && bills.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="text-left p-4 font-medium text-gray-900">Bill Number</th>
                    <th className="text-left p-4 font-medium text-gray-900">Supplier</th>
                    <th className="text-left p-4 font-medium text-gray-900">Date</th>
                    <th className="text-left p-4 font-medium text-gray-900">Due Date</th>
                    <th className="text-left p-4 font-medium text-gray-900">Amount</th>
                    <th className="text-left p-4 font-medium text-gray-900">Status</th>
                    <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map((bill) => {
                    const statusBadge = getStatusBadge(bill.status);
                    const StatusIcon = statusBadge.icon;
                    
                    return (
                      <tr key={bill.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedBills.includes(bill.id)}
                            onChange={() => handleBillSelect(bill.id)}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-gray-900">{bill.billNumber}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center">
                            <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">{bill.supplier?.name || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-600">{formatDate(bill.billDate)}</td>
                        <td className="p-4 text-gray-600">{formatDate(bill.dueDate)}</td>
                        <td className="p-4 font-medium text-gray-900">{formatCurrency(bill.totalAmount)}</td>
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
                              onClick={() => router.push(`/dashboard/bills/${bill.id}`)}
                            >
                              View
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={Edit}
                              onClick={() => router.push(`/dashboard/bills/${bill.id}/edit`)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={Trash2}
                              onClick={() => handleDeleteBill(bill)}
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
            {bills.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bills found</h3>
                <p className="text-gray-600 mb-4">Get started by creating your first bill.</p>
                <Button
                  variant="primary"
                  leftIcon={Plus}
                  onClick={() => router.push('/dashboard/bills/create')}
                >
                  Create Bill
                </Button>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading bills...</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Bill"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this bill? This action cannot be undone.
          </p>
          {billToDelete && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">Bill: {billToDelete.billNumber}</p>
              <p className="text-sm text-gray-600">Amount: {formatCurrency(billToDelete.totalAmount)}</p>
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
              Delete Bill
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Bills;
