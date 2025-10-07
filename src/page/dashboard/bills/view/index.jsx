"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Receipt, 
  Edit, 
  Trash2, 
  CheckCircle, 
  IndianRupee, 
  Calendar, 
  Building2, 
  Phone, 
  Mail, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Hash, 
  Package, 
  TrendingUp,
  CreditCard,
  DollarSign,
  Percent,
  Clock3,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import moment from 'moment';

// Import components
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { Button, AnimatedBackground, Badge } from '@/components/ui';
import { billService } from '@/service';
import { useAppSelector } from '@/store/hooks';
import Link from 'next/link';

const ViewBillPage = ({ billId }) => {
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id;

  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [billData, setBillData] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [deletedBillNumber, setDeletedBillNumber] = useState('');
  const hasFetched = useRef(false);

  // Fetch bill data on component mount
  useEffect(() => {
    const fetchBillData = async () => {
      if (!billId || !storeId || hasFetched.current) return;

      hasFetched.current = true;
      try {
        setFetching(true);
        setError(null);

        const params = {
          store: storeId,
          id: billId
        };
        const result = await billService.getBills(params);
        
        if (result.success && result.data) {
          console.log('Bill data:', result.data);
          setBillData(result.data);
        } else {
          setError(result.message || 'Failed to fetch bill data');
        }
      } catch (error) {
        console.error('Error fetching bill:', error);
        setError('Failed to fetch bill data. Please try again.');
      } finally {
        setFetching(false);
      }
    };

    fetchBillData();
  }, [billId, storeId]);

  // Handle edit bill
  const handleEditBill = () => {
    router.push(`/dashboard/bills/${billId}/edit`);
  };

  // Handle make payment
  const handleMakePayment = () => {
    // TODO: Implement payment functionality
    console.log('Make payment clicked for bill:', billId);
  };

  // Handle payment completed
  const handlePaymentCompleted = () => {
    // TODO: Implement payment completed functionality
    console.log('Payment completed for bill:', billId);
  };

  // Handle delete bill
  const handleDeleteBill = () => {
    setShowDeleteModal(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!billId || !storeId) return;

    setIsDeleting(true);
    try {
      const result = await billService.deleteBill(billId, storeId);

      if (result.success) {
        setDeletedBillNumber(billData?.billNumber || 'Bill');
        setShowDeleteSuccessModal(true);
        setShowDeleteModal(false);
      } else {
        setError(result.message || 'Failed to delete bill');
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error('Error deleting bill:', error);
      setError('Failed to delete bill. Please try again.');
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
    router.push('/dashboard/bills');
  };

  // Get payment status badge
  const getPaymentStatusBadge = (status, isOverdue = false) => {
    if (isOverdue) {
      return (
        <Badge variant="danger" className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Overdue
        </Badge>
      );
    }

    const statusConfig = {
      PAID: { variant: 'success', text: 'Paid', icon: CheckCircle2 },
      PARTIAL: { variant: 'warning', text: 'Partial', icon: Clock },
      UNPAID: { variant: 'secondary', text: 'Pending', icon: Clock3 }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: status, icon: Clock };
    const IconComponent = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="w-3 h-3" />
        {config.text}
      </Badge>
    );
  };

  // Get bill status badge
  const getBillStatusBadge = (status) => {
    const statusConfig = {
      CONFIRMED: { variant: 'success', text: 'Confirmed', icon: CheckCircle2 },
      PENDING: { variant: 'warning', text: 'Pending', icon: Clock },
      CANCELLED: { variant: 'danger', text: 'Cancelled', icon: XCircle },
      DRAFT: { variant: 'secondary', text: 'Draft', icon: FileText }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: status, icon: FileText };
    const IconComponent = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="w-3 h-3" />
        {config.text}
      </Badge>
    );
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
    return moment(date).format('MMM DD, YYYY');
  };

  // Format date with time
  const formatDateTime = (date) => {
    return moment(date).format('MMM DD, YYYY h:mm A');
  };

  // Loading state while fetching bill data
  if (fetching) {
    return (
      <div className="flex w-full h-screen relative overflow-hidden">
        <AnimatedBackground variant="default" />
        <Sidebar />

        <div className="min-h-screen w-full flex flex-col">
          <Header
            title="View Bill"
            description="Bill information and details"
          />

          <div className="flex-1 p-6">
            <div className="max-w-8xl mx-auto w-full">
              <div className="bg-[rgb(var(--color-bg-primary))] p-8">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                      Loading Bill Data...
                    </h2>
                    <p className="text-[rgb(var(--color-text-secondary))]">
                      Please wait while we fetch the bill information
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
          title="View Bill"
          description="Bill information and details"
        />

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="">
            {/* Back Button */}
            <div className="mb-6">
              <Link href="/dashboard/bills" className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Bills</span>
              </Link>
            </div>

            {/* Error State - Full Page */}
            {error && (
              <div className="w-full">
                <div className="bg-[rgb(var(--color-bg-primary))] p-8">
                  <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center max-w-md">
                      <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Receipt className="w-10 h-10 text-red-600" />
                      </div>
                      <h2 className="text-lg font-bold text-[rgb(var(--color-text-primary))] mb-3">
                        Bill Not Found
                      </h2>
                      <p className="text-[rgb(var(--color-text-secondary))] mb-8 leading-relaxed">
                        The bill you're looking for doesn't exist or has been removed. Please check the bill ID and try again.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                          variant="outline"
                          onClick={() => router.push('/dashboard/bills')}
                          className="px-6 py-3"
                        >
                          Back to Bills
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

            {/* Bill Details - Only show when no error */}
            {!error && billData && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" style={{ height: 'calc(100vh - 300px)' }}>
                {/* Left Side - Bill Info */}
                <div className="lg:col-span-2 flex flex-col h-full">
                  <div className="overflow-y-auto pe-3 space-y-6" style={{ height: 'calc(100vh - 200px)', maxHeight: 'calc(100vh - 200px)' }}>
                    
                    {/* Basic Information Card */}
                    <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-[rgb(var(--color-primary))]/20 to-[rgb(var(--color-primary))]/10 rounded-full flex items-center justify-center">
                            <Receipt className="w-6 h-6 text-[rgb(var(--color-primary))]" />
                          </div>
                          <div>
                            <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">Bill Information</h2>
                            <p className="text-sm text-[rgb(var(--color-text-secondary))]">Basic bill details</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getPaymentStatusBadge(billData.paymentStatus, billData.isOverdue)}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Bill Number */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Bill Number</label>
                          <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                            <Hash className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                            <span className="text-[rgb(var(--color-text-primary))] font-medium">
                              {billData.billNumber || 'N/A'}
                            </span>
                          </div>
                        </div>

                        {/* Bill Date */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Bill Date</label>
                          <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                            <Calendar className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                            <span className="text-[rgb(var(--color-text-primary))] font-medium">
                              {formatDate(billData.billDate)}
                            </span>
                          </div>
                        </div>

                        {/* Due Date */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Due Date</label>
                          <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                            <Clock className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                            <span className="text-[rgb(var(--color-text-primary))] font-medium">
                              {formatDate(billData.dueDate)}
                            </span>
                          </div>
                        </div>

                        {/* Payment Terms */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Payment Terms</label>
                          <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                            <CreditCard className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                            <span className="text-[rgb(var(--color-text-primary))] font-medium">
                              {billData.paymentTerms?.replace('_', ' ') || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Supplier Information Card */}
                    {billData.supplier && (
                      <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-6">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-full flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-green-500" />
                          </div>
                          <div>
                            <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">Supplier Information</h2>
                            <p className="text-sm text-[rgb(var(--color-text-secondary))]">Supplier details</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Supplier Name */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Supplier Name</label>
                            <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                              <Building2 className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                              <span className="text-[rgb(var(--color-text-primary))] font-medium">
                                {billData.supplier.name || 'N/A'}
                              </span>
                            </div>
                          </div>

                          {/* Agency */}
                          {billData.supplier.agency && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Agency</label>
                              <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                                <FileText className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                                <span className="text-[rgb(var(--color-text-primary))] font-medium">
                                  {billData.supplier.agency}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Phone */}
                          {billData.supplier.phone && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Phone</label>
                              <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                                <Phone className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                                <span className="text-[rgb(var(--color-text-primary))] font-medium">
                                  {billData.supplier.phone}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Email */}
                          {billData.supplier.email && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Email</label>
                              <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                                <Mail className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                                <span className="text-[rgb(var(--color-text-primary))] font-medium">
                                  {billData.supplier.email}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Financial Information Card */}
                    <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-6">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-full flex items-center justify-center">
                          <IndianRupee className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                          <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">Financial Information</h2>
                          <p className="text-sm text-[rgb(var(--color-text-secondary))]">Amount and payment details</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Subtotal */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Subtotal</label>
                          <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                            <DollarSign className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                            <span className="text-[rgb(var(--color-text-primary))] font-medium">
                              {formatCurrency(billData.subtotal)}
                            </span>
                          </div>
                        </div>

                        {/* Discount */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Discount</label>
                          <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                            <Percent className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                            <span className="text-[rgb(var(--color-text-primary))] font-medium">
                              {formatCurrency(billData.discount)}
                            </span>
                          </div>
                        </div>

                        {/* Total Amount */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Total Amount</label>
                          <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                            <IndianRupee className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                            <span className="text-[rgb(var(--color-text-primary))] font-medium">
                              {formatCurrency(billData.totalAmount)}
                            </span>
                          </div>
                        </div>

                        {/* Paid Amount */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Paid Amount</label>
                          <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                            <CheckCircle className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                            <span className="text-[rgb(var(--color-text-primary))] font-medium">
                              {formatCurrency(billData.paidAmount)}
                            </span>
                          </div>
                        </div>

                        {/* Due Amount */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Due Amount</label>
                          <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                            <AlertTriangle className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                            <span className="text-[rgb(var(--color-text-primary))] font-medium">
                              {formatCurrency(billData.dueAmount)}
                            </span>
                          </div>
                        </div>

                        {/* Payment Status */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Payment Status</label>
                          <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                            <CreditCard className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                            <span className="text-[rgb(var(--color-text-primary))] font-medium">
                              {billData.paymentStatus?.replace('_', ' ') || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Items Summary Card */}
                    {billData.itemsSummary && (
                      <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-6">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-purple-500" />
                          </div>
                          <div>
                            <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">Items Summary</h2>
                            <p className="text-sm text-[rgb(var(--color-text-secondary))]">Product details</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Total Value */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Total Value</label>
                            <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                              <TrendingUp className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                              <span className="text-[rgb(var(--color-text-primary))] font-medium">
                                {formatCurrency(billData.itemsSummary.totalValue)}
                              </span>
                            </div>
                          </div>

                          {/* Item Count */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Item Count</label>
                            <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                              <Package className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                              <span className="text-[rgb(var(--color-text-primary))] font-medium">
                                {billData.itemsSummary.itemCount} items
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Batches Card */}
                    {billData.batches && billData.batches.length > 0 && (
                      <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-6">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-orange-500/10 rounded-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-orange-500" />
                          </div>
                          <div>
                            <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">Product Batches</h2>
                            <p className="text-sm text-[rgb(var(--color-text-secondary))]">Stock batches for this bill</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {billData.batches.map((batch, index) => (
                            <div key={batch._id || index} className="border border-[rgb(var(--color-border-primary))]/30 rounded-lg p-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Batch Number</label>
                                  <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                                    <Hash className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                                    <span className="text-[rgb(var(--color-text-primary))] font-medium">
                                      {batch.batchNo || 'N/A'}
                                    </span>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Quantity</label>
                                  <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                                    <Package className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                                    <span className="text-[rgb(var(--color-text-primary))] font-medium">
                                      {batch.quantity || 'N/A'}
                                    </span>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Purchase Price</label>
                                  <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                                    <IndianRupee className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                                    <span className="text-[rgb(var(--color-text-primary))] font-medium">
                                      {formatCurrency(batch.purchasePrice)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes Card */}
                    {billData.notes && (
                      <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-6">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="w-12 h-12 bg-gradient-to-br from-gray-500/20 to-gray-500/10 rounded-full flex items-center justify-center">
                            <FileText className="w-6 h-6 text-gray-500" />
                          </div>
                          <div>
                            <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">Notes</h2>
                            <p className="text-sm text-[rgb(var(--color-text-secondary))]">Additional information</p>
                          </div>
                        </div>

                        <div className="p-4 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                          <p className="text-[rgb(var(--color-text-primary))] leading-relaxed">
                            {billData.notes}
                          </p>
                        </div>
                      </div>
                    )}

                  </div>
                </div>

                {/* Right Side - Quick Actions */}
                <div className="lg:col-span-1">
                  <div className="bg-gradient-to-br from-[rgb(var(--color-primary))]/5 to-[rgb(var(--color-primary))]/10 backdrop-blur-md rounded-lg border border-[rgb(var(--color-primary))]/20 p-6 sticky top-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-[rgb(var(--color-primary))]/20 rounded-lg flex items-center justify-center">
                        <Receipt className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Quick Actions</h3>
                        <p className="text-sm text-[rgb(var(--color-text-secondary))]">Manage this bill</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Conditional Payment Button */}
                      {billData.dueAmount > 0 ? (
                        <Button
                          variant="primary"
                          className="w-full"
                          onClick={handleMakePayment}
                          leftIcon={CreditCard}
                        >
                          Make Payment
                        </Button>
                      ) : (
                        <Button
                          variant="success"
                          className="w-full"
                          onClick={handlePaymentCompleted}
                          leftIcon={CheckCircle}
                        >
                          Payment Completed
                        </Button>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={handleEditBill}
                          leftIcon={Edit}
                        >
                          Edit
                        </Button>

                        <Button
                          variant="danger"
                          className="w-full"
                          onClick={handleDeleteBill}
                          leftIcon={Trash2}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>

                    {/* Bill Stats */}
                    <div className="mt-6 p-4 bg-[rgb(var(--color-bg-primary))]/20 rounded-lg border border-[rgb(var(--color-border-primary))]/30">
                      <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-3">Bill Stats</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[rgb(var(--color-text-secondary))]">Total Amount:</span>
                          <span className="font-medium text-[rgb(var(--color-text-primary))]">
                            {formatCurrency(billData.totalAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[rgb(var(--color-text-secondary))]">Paid Amount:</span>
                          <span className="font-medium text-[rgb(var(--color-text-primary))]">
                            {formatCurrency(billData.paidAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[rgb(var(--color-text-secondary))]">Due Amount:</span>
                          <span className="font-medium text-[rgb(var(--color-text-primary))]">
                            {formatCurrency(billData.dueAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[rgb(var(--color-text-secondary))]">Overdue Days:</span>
                          <span className="font-medium text-[rgb(var(--color-text-primary))]">
                            {billData.overdueDays || 0} days
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[rgb(var(--color-text-secondary))]">Created:</span>
                          <span className="font-medium text-[rgb(var(--color-text-primary))]">
                            {formatDate(billData.createdAt)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[rgb(var(--color-text-secondary))]">Last Updated:</span>
                          <span className="font-medium text-[rgb(var(--color-text-primary))]">
                            {formatDateTime(billData.updatedAt)}
                          </span>
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
          <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4">
              Delete Bill
            </h3>
            <p className="text-[rgb(var(--color-text-secondary))] mb-6">
              Are you sure you want to delete "{billData?.billNumber || 'Bill'}"? This action cannot be undone.
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
                Bill Deleted Successfully!
              </h3>
              <p className="text-[rgb(var(--color-text-secondary))] mb-6">
                "{deletedBillNumber}" has been removed from your bill list.
              </p>
              <Button variant="primary" onClick={handleDeleteSuccess}>
                Back to Bills
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewBillPage;
