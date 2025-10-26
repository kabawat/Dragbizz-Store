"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, IndianRupee, Building, FileText, Edit, Trash2, CheckCircle, Hash, Phone, Mail, CreditCard } from 'lucide-react';
import moment from 'moment';

// Import components
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { Button, AnimatedBackground, Badge } from '@/components/ui';
import { expenseService } from '@/service';
import { useAppSelector } from '@/store/hooks';
import Link from 'next/link';
import {
  getCategoryLabel,
  getPaymentMethodLabel,
  getPaymentMethodIcon,
  getStatusLabel,
  getStatusColor
} from '@/data/constants/expenses';

const ViewExpensePage = ({ expenseId }) => {
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id;
  
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [expenseData, setExpenseData] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [deletedExpenseName, setDeletedExpenseName] = useState('');
  const hasFetched = useRef(false);

  // Fetch expense data on component mount
  useEffect(() => {
    const fetchExpenseData = async () => {
      if (!expenseId || !storeId || hasFetched.current) return;

      hasFetched.current = true;
      try {
        setFetching(true);
        setError(null);

        const result = await expenseService.getExpenses({ id: expenseId, store: storeId });
        if (result.success && result.data) {
          setExpenseData(result.data);
        } else {
          setError(result.message || 'Failed to fetch expense data');
        }
      } catch (error) {
        console.error('Error fetching expense:', error);
        setError('Failed to fetch expense data. Please try again.');
      } finally {
        setFetching(false);
      }
    };

    fetchExpenseData();
  }, [expenseId, storeId]);

  // Handle edit expense
  const handleEditExpense = () => {
    router.push(`/dashboard/expenses/edit/${expenseId}`);
  };

  // Handle delete expense
  const handleDeleteExpense = () => {
    setShowDeleteModal(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!expenseId || !storeId) return;

    setIsDeleting(true);
    try {
      const result = await expenseService.deleteExpense(expenseId, storeId);

      if (result.success) {
        setDeletedExpenseName(expenseData?.title || 'Expense');
        setShowDeleteSuccessModal(true);
        setShowDeleteModal(false);
      } else {
        setError(result.message || 'Failed to delete expense');
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      setError('Failed to delete expense. Please try again.');
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  // Handle delete success
  const handleDeleteSuccess = () => {
    setShowDeleteSuccessModal(false);
    router.push('/dashboard/expenses');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Loading state while fetching expense data
  if (fetching) {
    return (
      <div className="flex w-full h-screen relative overflow-hidden">
        <AnimatedBackground variant="default" />
        <Sidebar />

        <div className="min-h-screen w-full flex flex-col">
          <Header title="View Expense" description="Expense information and details" />

          <div className="flex-1 p-6">
            <div className="max-w-8xl mx-auto w-full">
              <div className="bg-[rgb(var(--color-bg-primary))] p-8">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                      Loading Expense Data...
                    </h2>
                    <p className="text-[rgb(var(--color-text-secondary))]">
                      Please wait while we fetch the expense information
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen relative w-full overflow-hidden">
      {/* Sidebar */}
      <AnimatedBackground variant="default" />
      <Sidebar />

      {/* Main Content */}
      <div className="min-h-screen w-full flex flex-col">
        {/* Header */}
        <Header
          title="View Expense"
          description="Expense information and details"
        />

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="">
            {/* Back Button */}
            <div className="mb-6">
              <Link href="/dashboard/expenses" className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Expenses</span>
              </Link>
            </div>

            {/* Error State - Full Page */}
            {error && (
              <div className="w-full">
                <div className="bg-[rgb(var(--color-bg-primary))] p-8">
                  <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center max-w-md">
                      <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FileText className="w-10 h-10 text-red-600" />
                      </div>
                      <h2 className="text-lg font-bold text-[rgb(var(--color-text-primary))] mb-3">
                        Expense Not Found
                      </h2>
                      <p className="text-[rgb(var(--color-text-secondary))] mb-8 leading-relaxed">
                        The expense you're looking for doesn't exist or has been removed. Please check the expense ID and try again.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                          variant="outline"
                          onClick={() => router.push('/dashboard/expenses')}
                          className="px-6 py-3"
                        >
                          Back to Expenses
                        </Button>
                        <Button
                          variant="primary"
                          onClick={() => window.location.reload()}
                          className="px-6 py-3"
                        >
                          Try Again
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Expense Details - Only show when no error */}
            {!error && expenseData && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side - Expense Info */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Basic Information Card */}
                  <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[rgb(var(--color-primary))]/20 to-[rgb(var(--color-primary))]/10 rounded-full flex items-center justify-center">
                          <IndianRupee className="w-6 h-6 text-[rgb(var(--color-primary))]" />
                        </div>
                        <div>
                          <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">Expense Information</h2>
                          <p className="text-sm text-[rgb(var(--color-text-secondary))]">Basic expense details</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={expenseData.status === 'PAID' ? 'success' : expenseData.status === 'PENDING' ? 'warning' : 'danger'}>
                          {getStatusLabel(expenseData.status)}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Expense Title */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Expense Title</label>
                        <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                          <FileText className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                          <span className="text-[rgb(var(--color-text-primary))] font-medium">
                            {expenseData.title || 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Bill Number */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Bill Number</label>
                        <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                          <Hash className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                          <span className="text-[rgb(var(--color-text-primary))] font-medium">
                            {expenseData.billNumber || 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Date</label>
                        <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                          <Calendar className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                          <span className="text-[rgb(var(--color-text-primary))] font-medium">
                            {formatDate(expenseData.date)}
                          </span>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Amount</label>
                        <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                          <IndianRupee className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                          <span className="text-[rgb(var(--color-text-primary))] font-medium">
                            ₹{formatCurrency(expenseData.amount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Category & Vendor Information Card */}
                  <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-full flex items-center justify-center">
                        <FileText className="w-6 h-6 text-green-500" />
                      </div>
                      <div>
                        <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">Category & Vendor</h2>
                        <p className="text-sm text-[rgb(var(--color-text-secondary))]">Classification details</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Category */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Category</label>
                        <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                          <FileText className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                          <span className="text-[rgb(var(--color-text-primary))] font-medium">
                            {getCategoryLabel(expenseData.category?.name || expenseData.category)}
                          </span>
                        </div>
                      </div>

                      {/* Vendor */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Vendor</label>
                        <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                          <Building className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                          <span className="text-[rgb(var(--color-text-primary))] font-medium">
                            {expenseData.vendor?.name || expenseData.vendor || 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Payment Method */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Payment Method</label>
                        <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                          <CreditCard className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                          <span className="text-[rgb(var(--color-text-primary))] font-medium">
                            {getPaymentMethodIcon(expenseData.paymentMethod)} {getPaymentMethodLabel(expenseData.paymentMethod)}
                          </span>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Status</label>
                        <div className="p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                          <Badge variant={expenseData.status === 'PAID' ? 'success' : expenseData.status === 'PENDING' ? 'warning' : 'danger'}>
                            {getStatusLabel(expenseData.status)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {expenseData.description && (
                    <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-6">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-full flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Description</h3>
                          <p className="text-sm text-[rgb(var(--color-text-secondary))]">Additional details</p>
                        </div>
                      </div>

                      <div className="p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                        <p className="text-[rgb(var(--color-text-primary))] whitespace-pre-wrap">
                          {expenseData.description}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Side - Quick Actions */}
                <div className="lg:col-span-1">
                  <div className="bg-gradient-to-br from-[rgb(var(--color-primary))]/5 to-[rgb(var(--color-primary))]/10 backdrop-blur-md rounded-lg border border-[rgb(var(--color-primary))]/20 p-6 sticky top-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-[rgb(var(--color-primary))]/20 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Quick Actions</h3>
                        <p className="text-sm text-[rgb(var(--color-text-secondary))]">Manage this expense</p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <Button
                        variant="primary"
                        className="w-full"
                        onClick={handleEditExpense}
                        leftIcon={Edit}
                      >
                        Edit Expense
                      </Button>

                      <Button
                        variant="danger"
                        className="w-full"
                        onClick={handleDeleteExpense}
                        leftIcon={Trash2}
                      >
                        Delete Expense
                      </Button>
                    </div>

                    {/* Expense Summary */}
                    <div className="p-4 bg-[rgb(var(--color-bg-primary))]/20 rounded-lg border border-[rgb(var(--color-border-primary))]/30">
                      <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-3">Expense Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[rgb(var(--color-text-secondary))]">Amount:</span>
                          <span className="font-medium text-[rgb(var(--color-text-primary))]">₹{formatCurrency(expenseData.amount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[rgb(var(--color-text-secondary))]">Payment Method:</span>
                          <span className="font-medium text-[rgb(var(--color-text-primary))]">{getPaymentMethodLabel(expenseData.paymentMethod)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[rgb(var(--color-text-secondary))]">Status:</span>
                          <Badge variant={expenseData.status === 'PAID' ? 'success' : expenseData.status === 'PENDING' ? 'warning' : 'danger'} size="sm">
                            {getStatusLabel(expenseData.status)}
                          </Badge>
                        </div>
                      </div>
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
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-[9999]">
          <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 max-w-md w-full mx-4 transform transition-all duration-300">
            <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4">
              Delete Expense
            </h3>
            <p className="text-[rgb(var(--color-text-secondary))] mb-6">
              Are you sure you want to delete "{expenseData?.title || 'Expense'}"? This action cannot be undone.
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
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-[9999]">
          <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                Expense Deleted Successfully!
              </h3>
              <p className="text-[rgb(var(--color-text-secondary))] mb-6">
                "{deletedExpenseName}" has been removed from your expense list.
              </p>
              <Button variant="primary" onClick={handleDeleteSuccess}>
                Back to Expenses
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewExpensePage;
