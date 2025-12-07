"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar, Edit, Copy, Trash2, CheckCircle, Building2, FileText, Wallet, TrendingUp, ShoppingCart, Receipt, IndianRupee, AlertCircle } from 'lucide-react';
import moment from 'moment';

// Import components
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { Button, AnimatedBackground } from '@/components/ui';
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
        <AnimatedBackground variant="default" />
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
      <AnimatedBackground variant="default" />
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Customer Name */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Customer Name</label>
                          <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                            <User className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                            <span className="text-[rgb(var(--color-text-primary))] font-medium">
                              {customerData.name || 'N/A'}
                            </span>
                          </div>
                        </div>

                        {/* Phone Number */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Phone Number</label>
                          <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                            <Phone className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                            <span className="text-[rgb(var(--color-text-primary))] font-medium">
                              {customerData.phone || 'N/A'}
                            </span>
                          </div>
                        </div>

                        {/* Email Address */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Email Address</label>
                          <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                            <Mail className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                            <span className="text-[rgb(var(--color-text-primary))] font-medium">
                              {customerData.email || 'N/A'}
                            </span>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Company Name */}
                          {customerData.companyDetails.companyName && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Company Name</label>
                              <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                                <Building2 className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                                <span className="text-[rgb(var(--color-text-primary))] font-medium">
                                  {customerData.companyDetails.companyName}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* GSTIN */}
                          {customerData.companyDetails.gstin && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">GSTIN</label>
                              <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                                <FileText className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                                <span className="text-[rgb(var(--color-text-primary))] font-medium">
                                  {customerData.companyDetails.gstin}
                                </span>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Total Amount */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Total Amount</label>
                            <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                              <IndianRupee className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                              <span className="text-[rgb(var(--color-text-primary))] font-medium">
                                {customerData.account.totalAmount?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || '0.00'}
                              </span>
                            </div>
                          </div>

                          {/* Total Invoices */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Total Invoices</label>
                            <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                              <Receipt className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                              <span className="text-[rgb(var(--color-text-primary))] font-medium">
                                {customerData.account.totalInvoices || 0}
                              </span>
                            </div>
                          </div>

                          {/* Total Items Purchased */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Total Items Purchased</label>
                            <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                              <ShoppingCart className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                              <span className="text-[rgb(var(--color-text-primary))] font-medium">
                                {customerData.account.totalItemsPurchased || 0}
                              </span>
                            </div>
                          </div>

                          {/* Total Profit */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Total Profit</label>
                            <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                              <TrendingUp className="w-4 h-4 text-green-500" />
                              <span className="text-[rgb(var(--color-text-primary))] font-medium text-green-500">
                                ₹{customerData.account.totalProfit?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || '0.00'}
                              </span>
                            </div>
                          </div>

                          {/* Total Paid */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Total Paid</label>
                            <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-[rgb(var(--color-text-primary))] font-medium text-green-500">
                                ₹{customerData.account.totalPaid?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || '0.00'}
                              </span>
                            </div>
                          </div>

                          {/* Total Due */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Total Due</label>
                            <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                              <AlertCircle className="w-4 h-4 text-orange-500" />
                              <span className="text-[rgb(var(--color-text-primary))] font-medium text-orange-500">
                                ₹{customerData.account.totalDue?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || '0.00'}
                              </span>
                            </div>
                          </div>

                          {/* Account Status */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Account Status</label>
                            <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                              <div className={`w-2 h-2 rounded-full ${customerData.account.accountStatus === 'ACTIVE' ? 'bg-green-500' : customerData.account.accountStatus === 'BLOCKED' ? 'bg-red-500' : 'bg-gray-500'}`}></div>
                              <span className="text-[rgb(var(--color-text-primary))] font-medium">
                                {customerData.account.accountStatus || 'ACTIVE'}
                              </span>
                            </div>
                          </div>

                          {/* Joined At */}
                          {customerData.account.joinedAt && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Joined At</label>
                              <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                                <Calendar className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                                <span className="text-[rgb(var(--color-text-primary))] font-medium">
                                  {moment(customerData.account.joinedAt).format('DD MMM YYYY')}
                                </span>
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
                                <div className="space-y-2">
                                  <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))]">Total Returns</label>
                                  <div className="p-2 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                                    <span className="text-[rgb(var(--color-text-primary))] text-sm">
                                      {customerData.account.totalReturns || 0}
                                    </span>
                                  </div>
                                </div>
                              )}
                              {customerData.account.netProfit !== undefined && (
                                <div className="space-y-2">
                                  <label className="text-xs font-medium text-[rgb(var(--color-text-secondary))]">Net Profit</label>
                                  <div className="p-2 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                                    <span className="text-[rgb(var(--color-text-primary))] text-sm">
                                      ₹{customerData.account.netProfit?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || '0.00'}
                                    </span>
                                  </div>
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
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Address Line 1</label>
                                  <div className="p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                                    <span className="text-[rgb(var(--color-text-primary))] font-medium">
                                      {customerData.addresses.billing.addressLine1 || 'N/A'}
                                    </span>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">City</label>
                                  <div className="p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                                    <span className="text-[rgb(var(--color-text-primary))] font-medium">
                                      {customerData.addresses.billing.city || 'N/A'}
                                    </span>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">State</label>
                                  <div className="p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                                    <span className="text-[rgb(var(--color-text-primary))] font-medium">
                                      {customerData.addresses.billing.state || 'N/A'}
                                    </span>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Pincode</label>
                                  <div className="p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                                    <span className="text-[rgb(var(--color-text-primary))] font-medium">
                                      {customerData.addresses.billing.pincode || 'N/A'}
                                    </span>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Country</label>
                                  <div className="p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                                    <span className="text-[rgb(var(--color-text-primary))] font-medium">
                                      {customerData.addresses.billing.country || 'N/A'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Shipping Address */}
                          {customerData.addresses.shipping && (
                            <div className="border border-[rgb(var(--color-border-primary))]/30 rounded-lg p-4">
                              <h3 className="text-lg font-medium text-[rgb(var(--color-text-primary))] mb-4">Shipping Address</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Address Line 1</label>
                                  <div className="p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                                    <span className="text-[rgb(var(--color-text-primary))] font-medium">
                                      {customerData.addresses.shipping.addressLine1 || 'N/A'}
                                    </span>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">City</label>
                                  <div className="p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                                    <span className="text-[rgb(var(--color-text-primary))] font-medium">
                                      {customerData.addresses.shipping.city || 'N/A'}
                                    </span>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">State</label>
                                  <div className="p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                                    <span className="text-[rgb(var(--color-text-primary))] font-medium">
                                      {customerData.addresses.shipping.state || 'N/A'}
                                    </span>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Pincode</label>
                                  <div className="p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                                    <span className="text-[rgb(var(--color-text-primary))] font-medium">
                                      {customerData.addresses.shipping.pincode || 'N/A'}
                                    </span>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Country</label>
                                  <div className="p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                                    <span className="text-[rgb(var(--color-text-primary))] font-medium">
                                      {customerData.addresses.shipping.country || 'N/A'}
                                    </span>
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

                    <div className="space-y-3">
                      <Button
                        variant="primary"
                        className="w-full"
                        onClick={handleEditCustomer}
                        leftIcon={Edit}
                      >
                        Edit Customer
                      </Button>

                      <Button
                        variant="danger"
                        className="w-full"
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
