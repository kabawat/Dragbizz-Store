"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar, Edit, Copy, Trash2, CheckCircle, Building2, FileText, Wallet, TrendingUp, ShoppingCart, Receipt, IndianRupee, AlertCircle } from 'lucide-react';
import moment from 'moment';

// Import components
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { customerService } from '@/service';
import { useAppSelector } from '@/store/hooks';
import Link from 'next/link';

const ViewCustomerPage = ({ customerId }) => {
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id;

  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [deletedCustomerName, setDeletedCustomerName] = useState('');
  const hasFetched = useRef(false);

  // Fetch customer data on component mount
  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!customerId || !storeId || hasFetched.current) return;

      hasFetched.current = true;
      try {
        setFetching(true);
        setError(null);

        const result = await customerService.getCustomers({ id: customerId, store: storeId });
        if (result.success && result.data) {
          setCustomerData(result.data);
        } else {
          setError(result.message || 'Failed to fetch customer data');
        }
      } catch (error) {
        setError('Failed to fetch customer data. Please try again.');
      } finally {
        setFetching(false);
      }
    };

    fetchCustomerData();
  }, [customerId, storeId]);

  // Handle edit customer
  const handleEditCustomer = () => {
    router.push(`/dashboard/customers/edit/${customerId}`);
  };


  // Handle delete customer
  const handleDeleteCustomer = () => {
    setShowDeleteModal(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!customerId || !storeId) return;

    setIsDeleting(true);
    try {
      const result = await customerService.deleteCustomer(customerId, storeId);

      if (result.success) {
        setDeletedCustomerName(customerData?.name || 'Customer');
        setShowDeleteSuccessModal(true);
        setShowDeleteModal(false);
      } else {
        setError(result.message || 'Failed to delete customer');
        setShowDeleteModal(false);
      }
    } catch (error) {
      setError('Failed to delete customer. Please try again.');
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
    router.push('/dashboard/customers');
  };

  // Loading state while fetching customer data
  if (fetching) {
    return (
      <div className="flex w-full h-screen relative overflow-hidden">
        <Sidebar />

        <div className="min-h-screen w-full flex flex-col">
          <Header
            title="View Customer"
            description="Customer information and details"
          />

          <div className="flex-1 p-6">
            <div className="max-w-8xl mx-auto w-full">
              <div className="bg-[rgb(var(--color-bg-primary))] p-8">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                      Loading Customer Data...
                    </h2>
                    <p className="text-[rgb(var(--color-text-secondary))]">
                      Please wait while we fetch the customer information
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
      <Sidebar />

      {/* Main Content */}
      <div className="min-h-screen w-full flex flex-col">
        {/* Header */}
        <Header
          title="View Customer"
          description="Customer information and details"
        />

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="">
            {/* Back Button */}
            <div className="mb-6">
              <Link href="/dashboard/customers" className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Customers</span>
              </Link>
            </div>

            {/* Error State - Full Page */}
            {error && (
              <div className="w-full">
                <div className="bg-[rgb(var(--color-bg-primary))] p-8">
                  <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center max-w-md">
                      <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
                        <User className="w-10 h-10 text-red-600" />
                      </div>
                      <h2 className="text-lg font-bold text-[rgb(var(--color-text-primary))] mb-3">
                        Customer Not Found
                      </h2>
                      <p className="text-[rgb(var(--color-text-secondary))] mb-8 leading-relaxed">
                        The customer you're looking for doesn't exist or has been removed. Please check the customer ID and try again.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                          variant="outline"
                          onClick={() => router.push('/dashboard/customers')}
                          className="px-6 py-3"
                        >
                          Back to Customers
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

            {/* Customer Details - Only show when no error */}
            {!error && customerData && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" style={{ height: 'calc(100vh - 300px)' }}>
                {/* Left Side - Customer Info */}
                <div className="lg:col-span-2 flex flex-col h-full">
                  <div className="overflow-y-auto pe-3 space-y-6" style={{ height: 'calc(100vh - 200px)', maxHeight: 'calc(100vh - 200px)' }}>
                    {/* Basic Information Card */}
                    <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-[rgb(var(--color-primary))]/20 to-[rgb(var(--color-primary))]/10 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-[rgb(var(--color-primary))]" />
                          </div>
                          <div>
                            <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">Customer Information</h2>
                            <p className="text-sm text-[rgb(var(--color-text-secondary))]">Basic customer details</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Customer Name */}
                        <div className="relative p-4 bg-gradient-to-br from-[rgb(var(--color-primary))]/15 to-[rgb(var(--color-primary))]/10 dark:from-[rgb(var(--color-primary))]/5 dark:to-[rgb(var(--color-primary))]/3 rounded-xl overflow-hidden">
                          <User className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 text-[rgb(var(--color-primary))]/35 dark:!text-[rgb(var(--color-primary))] dark:opacity-40" />
                          <div className="relative z-10">
                            <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">Customer Name</p>
                            <p className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                              {customerData.name || 'N/A'}
                            </p>
                          </div>
                        </div>

                        {/* Phone Number */}
                        <div className="relative p-4 bg-gradient-to-br from-blue-50/15 to-blue-100/10 dark:from-blue-900/5 dark:to-blue-800/3 rounded-xl overflow-hidden">
                          <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 text-blue-500/35 dark:!text-blue-400 dark:opacity-40" />
                          <div className="relative z-10">
                            <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">Phone Number</p>
                            <p className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                              {customerData.phone || 'N/A'}
                            </p>
                          </div>
                        </div>

                        {/* Email Address */}
                        <div className="relative p-4 bg-gradient-to-br from-purple-50/15 to-purple-100/10 dark:from-purple-900/5 dark:to-purple-800/3 rounded-xl overflow-hidden">
                          <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 text-purple-500/35 dark:!text-purple-400 dark:opacity-40" />
                          <div className="relative z-10">
                            <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">Email Address</p>
                            <p className="text-base font-semibold text-[rgb(var(--color-text-primary))] break-all">
                              {customerData.email || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Company Details Card */}
                    {customerData.companyDetails && (customerData.companyDetails.companyName || customerData.companyDetails.gstin) && (
                      <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-6">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-full flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-green-500" />
                          </div>
                          <div>
                            <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">Company Details</h2>
                            <p className="text-sm text-[rgb(var(--color-text-secondary))]">Business information</p>
                          </div>
                        </div>

                        <div className="space-y-6">
                          {/* Company Name */}
                          {customerData.companyDetails.companyName && (
                            <div className="flex items-start space-x-4 pb-4 border-b border-[rgb(var(--color-border-primary))]/30">
                              <div className="flex-shrink-0 w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-green-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">Company Name</p>
                                <p className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                                  {customerData.companyDetails.companyName}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* GSTIN */}
                          {customerData.companyDetails.gstin && (
                            <div className="flex items-start space-x-4">
                              <div className="flex-shrink-0 w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5 text-orange-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">GSTIN</p>
                                <p className="text-base font-semibold text-[rgb(var(--color-text-primary))] font-mono">
                                  {customerData.companyDetails.gstin}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Account Details Card */}
                    {customerData.account && (
                      <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-6">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-full flex items-center justify-center">
                            <Wallet className="w-6 h-6 text-blue-500" />
                          </div>
                          <div>
                            <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">Account Details</h2>
                            <p className="text-sm text-[rgb(var(--color-text-secondary))]">Customer purchase and payment information</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {/* Total Amount */}
                          <div className="relative p-4 bg-gradient-to-br from-blue-50/15 to-blue-100/10 dark:from-blue-900/5 dark:to-blue-800/3 rounded-xl overflow-hidden">
                            <IndianRupee className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 text-blue-500/35 dark:!text-blue-400 dark:opacity-40" />
                            <div className="relative z-10">
                              <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">Total Amount</p>
                              <p className="text-lg font-bold text-[rgb(var(--color-text-primary))]">
                                ₹{customerData.account.totalAmount?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || '0.00'}
                              </p>
                            </div>
                          </div>

                          {/* Total Invoices */}
                          <div className="relative p-4 bg-gradient-to-br from-purple-50/15 to-purple-100/10 dark:from-purple-900/5 dark:to-purple-800/3 rounded-xl overflow-hidden">
                            <Receipt className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 text-purple-500/35 dark:!text-purple-400" style={{ opacity: '0.4' }} />
                            <div className="relative z-10">
                              <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">Total Invoices</p>
                              <p className="text-lg font-bold text-[rgb(var(--color-text-primary))]">
                                {customerData.account.totalInvoices || 0}
                              </p>
                            </div>
                          </div>

                          {/* Total Items Purchased */}
                          <div className="relative p-4 bg-gradient-to-br from-indigo-50/15 to-indigo-100/10 dark:from-indigo-900/5 dark:to-indigo-800/3 rounded-xl overflow-hidden">
                            <ShoppingCart className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 text-indigo-500/35 dark:!text-indigo-400 dark:opacity-40" />
                            <div className="relative z-10">
                              <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">Items Purchased</p>
                              <p className="text-lg font-bold text-[rgb(var(--color-text-primary))]">
                                {customerData.account.totalItemsPurchased || 0}
                              </p>
                            </div>
                          </div>

                          {/* Total Profit */}
                          <div className="relative p-4 bg-gradient-to-br from-green-50/15 to-green-100/10 dark:from-green-900/5 dark:to-green-800/3 rounded-xl overflow-hidden">
                            <TrendingUp className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 text-green-500/35 dark:!text-green-400 dark:opacity-40" />
                            <div className="relative z-10">
                              <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">Total Profit</p>
                              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                ₹{customerData.account.totalProfit?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || '0.00'}
                              </p>
                            </div>
                          </div>

                          {/* Total Paid */}
                          <div className="relative p-4 bg-gradient-to-br from-emerald-50/15 to-emerald-100/10 dark:from-emerald-900/5 dark:to-emerald-800/3 rounded-xl overflow-hidden">
                            <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 text-emerald-500/35 dark:text-emerald-400/40" />
                            <div className="relative z-10">
                              <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">Total Paid</p>
                              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                ₹{customerData.account.totalPaid?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || '0.00'}
                              </p>
                            </div>
                          </div>

                          {/* Total Due */}
                          <div className="relative p-4 bg-gradient-to-br from-orange-50/15 to-orange-100/10 dark:from-orange-900/5 dark:to-orange-800/3 rounded-xl overflow-hidden">
                            <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 text-orange-500/35 dark:!text-orange-400 dark:opacity-40" />
                            <div className="relative z-10">
                              <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">Total Due</p>
                              <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                ₹{customerData.account.totalDue?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || '0.00'}
                              </p>    
                            </div>
                          </div>

                          {/* Account Status */}
                          <div className="relative p-4 bg-gradient-to-br from-gray-50/15 to-gray-100/10 dark:from-gray-900/5 dark:to-gray-800/3 rounded-xl overflow-hidden">
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center">
                              <div className={`w-8 h-8 rounded-full ${customerData.account.accountStatus === 'ACTIVE' ? 'bg-green-500/35 dark:!bg-green-400 dark:opacity-40' : customerData.account.accountStatus === 'BLOCKED' ? 'bg-red-500/35 dark:!bg-red-400 dark:opacity-40' : 'bg-gray-500/35 dark:!bg-gray-400 dark:opacity-40'}`}></div>
                            </div>
                            <div className="relative z-10">
                              <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">Account Status</p>
                              <p className={`text-lg font-bold ${customerData.account.accountStatus === 'ACTIVE' ? 'text-green-600 dark:text-green-400' : customerData.account.accountStatus === 'BLOCKED' ? 'text-red-600 dark:text-red-400' : 'text-[rgb(var(--color-text-primary))]'}`}>
                                {customerData.account.accountStatus || 'ACTIVE'}
                              </p>
                            </div>
                          </div>

                          {/* Joined At */}
                          {customerData.account.joinedAt && (
                            <div className="relative p-4 bg-gradient-to-br from-teal-50/15 to-teal-100/10 dark:from-teal-900/5 dark:to-teal-800/3 rounded-xl overflow-hidden">
                              <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 text-teal-500/35 dark:!text-teal-400 dark:opacity-40" />
                              <div className="relative z-10">
                                <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1">Joined At</p>
                                <p className="text-lg font-bold text-[rgb(var(--color-text-primary))]">
                                  {moment(customerData.account.joinedAt).format('DD MMM YYYY')}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Additional Account Info */}
                        {(customerData.account.totalReturns > 0 || customerData.account.netProfit !== undefined) && (
                          <div className="mt-6 pt-6 border-t border-[rgb(var(--color-border-primary))]">
                            <h3 className="text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-4">Additional Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {customerData.account.totalReturns > 0 && (
                                <div>
                                  <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">Total Returns</p>
                                  <p className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                                    {customerData.account.totalReturns || 0}
                                  </p>
                                </div>
                              )}
                              {customerData.account.netProfit !== undefined && (
                                <div>
                                  <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">Net Profit</p>
                                  <p className="text-base font-semibold text-green-600 dark:text-green-400">
                                    ₹{customerData.account.netProfit?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || '0.00'}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Addresses Card */}
                    {customerData.addresses && (customerData.addresses.billing || customerData.addresses.shipping) && (
                      <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-6">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-full flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-purple-500" />
                          </div>
                          <div>
                            <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">Addresses</h2>
                            <p className="text-sm text-[rgb(var(--color-text-secondary))]">Billing and shipping addresses</p>
                          </div>
                        </div>

                        <div className="space-y-6">
                          {/* Billing Address */}
                          {customerData.addresses.billing && (
                            <div className="border border-[rgb(var(--color-border-primary))]/30 rounded-lg p-4">
                              <h3 className="text-lg font-medium text-[rgb(var(--color-text-primary))] mb-4">Billing Address</h3>
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">Address Line 1</p>
                                    <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                                      {customerData.addresses.billing.addressLine1 || 'N/A'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">City</p>
                                    <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                                      {customerData.addresses.billing.city || 'N/A'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">State</p>
                                    <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                                      {customerData.addresses.billing.state || 'N/A'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">Pincode</p>
                                    <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                                      {customerData.addresses.billing.pincode || 'N/A'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">Country</p>
                                    <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                                      {customerData.addresses.billing.country || 'N/A'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Shipping Address */}
                          {customerData.addresses.shipping && (
                            <div className="border border-[rgb(var(--color-border-primary))]/30 rounded-lg p-4">
                              <h3 className="text-lg font-medium text-[rgb(var(--color-text-primary))] mb-4">Shipping Address</h3>
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">Address Line 1</p>
                                    <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                                      {customerData.addresses.shipping.addressLine1 || 'N/A'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">City</p>
                                    <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                                      {customerData.addresses.shipping.city || 'N/A'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">State</p>
                                    <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                                      {customerData.addresses.shipping.state || 'N/A'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">Pincode</p>
                                    <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                                      {customerData.addresses.shipping.pincode || 'N/A'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">Country</p>
                                    <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                                      {customerData.addresses.shipping.country || 'N/A'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
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
                        <User className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Quick Actions</h3>
                        <p className="text-sm text-[rgb(var(--color-text-secondary))]">Manage this customer</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="primary"
                        className="flex-1"
                        onClick={handleEditCustomer}
                        leftIcon={Edit}
                      >
                        Edit Customer
                      </Button>

                      <Button
                        variant="danger"
                        className="flex-1"
                        onClick={handleDeleteCustomer}
                        leftIcon={Trash2}
                      >
                        Delete Customer
                      </Button>
                    </div>

                    {/* Customer Stats */}
                    <div className="mt-6 p-4 bg-[rgb(var(--color-bg-primary))]/20 rounded-lg border border-[rgb(var(--color-border-primary))]/30">
                      <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-3">Quick Stats</h4>
                      <div className="space-y-2 text-sm">
                        {customerData.account ? (
                          <>
                            <div className="flex justify-between">
                              <span className="text-[rgb(var(--color-text-secondary))]">Total Invoices:</span>
                              <span className="font-medium text-[rgb(var(--color-text-primary))]">{customerData.account.totalInvoices || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[rgb(var(--color-text-secondary))]">Total Spent:</span>
                              <span className="font-medium text-[rgb(var(--color-text-primary))]">₹{customerData.account.totalAmount?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || '0.00'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[rgb(var(--color-text-secondary))]">Total Due:</span>
                              <span className={`font-medium ${customerData.account.totalDue > 0 ? 'text-orange-500' : 'text-[rgb(var(--color-text-primary))]'}`}>
                                ₹{customerData.account.totalDue?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || '0.00'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[rgb(var(--color-text-secondary))]">Items Purchased:</span>
                              <span className="font-medium text-[rgb(var(--color-text-primary))]">{customerData.account.totalItemsPurchased || 0}</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex justify-between">
                              <span className="text-[rgb(var(--color-text-secondary))]">Total Orders:</span>
                              <span className="font-medium text-[rgb(var(--color-text-primary))]">0</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[rgb(var(--color-text-secondary))]">Total Spent:</span>
                              <span className="font-medium text-[rgb(var(--color-text-primary))]">₹0</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[rgb(var(--color-text-secondary))]">Last Order:</span>
                              <span className="font-medium text-[rgb(var(--color-text-primary))]">Never</span>
                            </div>
                          </>
                        )}
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
              Delete Customer
            </h3>
            <p className="text-[rgb(var(--color-text-secondary))] mb-6">
              Are you sure you want to delete "{customerData?.name || 'Customer'}"? This action cannot be undone.
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
                Customer Deleted Successfully!
              </h3>
              <p className="text-[rgb(var(--color-text-secondary))] mb-6">
                "{deletedCustomerName}" has been removed from your customer list.
              </p>
              <Button variant="primary" onClick={handleDeleteSuccess}>
                Back to Customers
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewCustomerPage;
