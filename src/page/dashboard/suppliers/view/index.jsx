"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building, Phone, Mail, MapPin, Calendar, Edit, Copy, Trash2, CheckCircle, Hash } from 'lucide-react';
import moment from 'moment';

// Import components
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { Button, AnimatedBackground } from '@/components/ui';
import { supplierService } from '@/service';
import { useAppSelector } from '@/store/hooks';
import Link from 'next/link';

const ViewSupplierPage = ({ supplierId }) => {
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;

  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [supplierData, setSupplierData] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [deletedSupplierName, setDeletedSupplierName] = useState('');
  const hasFetched = useRef(false);

  // Fetch supplier data on component mount
  useEffect(() => {
    const fetchSupplierData = async () => {
      if (!supplierId || !storeId || hasFetched.current) return;

      hasFetched.current = true;
      try {
        setFetching(true);
        setError(null);

        const result = await supplierService.getSuppliers({ id: supplierId, store: storeId });
        if (result.success && result.data) {
          console.log(result.data);
          setSupplierData(result.data);
        } else {
          setError(result.message || 'Failed to fetch supplier data');
        }
      } catch (error) {
        console.error('Error fetching supplier:', error);
        setError('Failed to fetch supplier data. Please try again.');
      } finally {
        setFetching(false);
      }
    };

    fetchSupplierData();
  }, [supplierId, storeId]);

  // Handle edit supplier
  const handleEditSupplier = () => {
    router.push(`/dashboard/suppliers/edit/${supplierId}`);
  };

  // Handle delete supplier
  const handleDeleteSupplier = () => {
    setShowDeleteModal(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!supplierId || !storeId) return;

    setIsDeleting(true);
    try {
      const result = await supplierService.deleteSupplier(supplierId, storeId);

      if (result.success) {
        setDeletedSupplierName(supplierData?.name || 'Supplier');
        setShowDeleteSuccessModal(true);
        setShowDeleteModal(false);
      } else {
        setError(result.message || 'Failed to delete supplier');
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error('Error deleting supplier:', error);
      setError('Failed to delete supplier. Please try again.');
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
    router.push('/dashboard/suppliers');
  };

  // Loading state while fetching supplier data
  if (fetching) {
    return (
      <div className="flex w-full h-screen relative overflow-hidden">
        <AnimatedBackground variant="default" />
        <Sidebar />

        <div className="min-h-screen w-full flex flex-col">
          <Header
            title="View Supplier"
            description="Supplier information and details"
          />

          <div className="flex-1 p-6">
            <div className="max-w-8xl mx-auto w-full">
              <div className="bg-[rgb(var(--color-bg-primary))] p-8">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                      Loading Supplier Data...
                    </h2>
                    <p className="text-[rgb(var(--color-text-secondary))]">
                      Please wait while we fetch the supplier information
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
          title="View Supplier"
          description="Supplier information and details"
        />

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="">
            {/* Back Button */}
            <div className="mb-6">
              <Link href="/dashboard/suppliers" className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Suppliers</span>
              </Link>
            </div>

            {/* Error State - Full Page */}
            {error && (
              <div className="w-full">
                <div className="bg-[rgb(var(--color-bg-primary))] p-8">
                  <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center max-w-md">
                      <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Building className="w-10 h-10 text-red-600" />
                      </div>
                      <h2 className="text-lg font-bold text-[rgb(var(--color-text-primary))] mb-3">
                        Supplier Not Found
                      </h2>
                      <p className="text-[rgb(var(--color-text-secondary))] mb-8 leading-relaxed">
                        The supplier you're looking for doesn't exist or has been removed. Please check the supplier ID and try again.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                          variant="outline"
                          onClick={() => router.push('/dashboard/suppliers')}
                          className="px-6 py-3"
                        >
                          Back to Suppliers
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

            {/* Supplier Details - Only show when no error */}
            {!error && supplierData && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side - Supplier Info */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Basic Information Card */}
                  <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[rgb(var(--color-primary))]/20 to-[rgb(var(--color-primary))]/10 rounded-full flex items-center justify-center">
                          <Building className="w-6 h-6 text-[rgb(var(--color-primary))]" />
                        </div>
                        <div>
                          <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">Supplier Information</h2>
                          <p className="text-sm text-[rgb(var(--color-text-secondary))]">Basic supplier details</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleEditSupplier} leftIcon={Edit}>
                          Edit
                        </Button>
                        <Button variant="danger" size="sm" onClick={handleDeleteSupplier} leftIcon={Trash2}>
                          Delete
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Supplier Name */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Supplier Name</label>
                        <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                          <Building className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                          <span className="text-[rgb(var(--color-text-primary))] font-medium">
                            {supplierData.name || 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Agency */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Agency</label>
                        <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                          <Building className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                          <span className="text-[rgb(var(--color-text-primary))] font-medium">
                            {supplierData.agency || 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* GST Number */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">GST Number</label>
                        <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                          <Hash className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                          <span className="text-[rgb(var(--color-text-primary))] font-medium">
                            {supplierData.gstNumber || 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Phone Number */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Phone Number</label>
                        <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                          <Phone className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                          <span className="text-[rgb(var(--color-text-primary))] font-medium">
                            {supplierData.phone || 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Email Address */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Email Address</label>
                        <div className="flex items-center space-x-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                          <Mail className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                          <span className="text-[rgb(var(--color-text-primary))] font-medium">
                            {supplierData.email || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Information Card */}
                  <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-full flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Additional Information</h3>
                        <p className="text-sm text-[rgb(var(--color-text-secondary))]">Supplier metadata and timestamps</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Supplier ID */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Supplier ID</label>
                        <div className="p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                          <span className="text-[rgb(var(--color-text-primary))] font-mono text-sm">
                            {supplierData.id || 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Created Date */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Created Date</label>
                        <div className="p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                          <div className="space-y-1">
                            <span className="text-[rgb(var(--color-text-primary))] font-medium block">
                              {supplierData.timestamps?.createdAt ? moment(supplierData.timestamps.createdAt).format('MMMM DD, YYYY') : 'N/A'}
                            </span>
                            <span className="text-xs text-[rgb(var(--color-text-tertiary))]">
                              {supplierData.timestamps?.createdAt ? moment(supplierData.timestamps.createdAt).fromNow() : ''}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Last Updated */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Last Updated</label>
                        <div className="p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                          <div className="space-y-1">
                            <span className="text-[rgb(var(--color-text-primary))] font-medium block">
                              {supplierData.timestamps?.updatedAt ? moment(supplierData.timestamps.updatedAt).format('MMMM DD, YYYY') : 'N/A'}
                            </span>
                            <span className="text-xs text-[rgb(var(--color-text-tertiary))]">
                              {supplierData.timestamps?.updatedAt ? moment(supplierData.timestamps.updatedAt).fromNow() : ''}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">Status</label>
                        <div className="p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            supplierData.isActive 
                              ? 'bg-green-500/10 text-green-600 border border-green-500/20' 
                              : 'bg-red-500/10 text-red-600 border border-red-500/20'
                          }`}>
                            {supplierData.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side - Quick Actions */}
                <div className="lg:col-span-1">
                  <div className="bg-gradient-to-br from-[rgb(var(--color-primary))]/5 to-[rgb(var(--color-primary))]/10 backdrop-blur-md rounded-lg border border-[rgb(var(--color-primary))]/20 p-6 sticky top-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-[rgb(var(--color-primary))]/20 rounded-lg flex items-center justify-center">
                        <Building className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Quick Actions</h3>
                        <p className="text-sm text-[rgb(var(--color-text-secondary))]">Manage this supplier</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Button
                        variant="primary"
                        className="w-full"
                        onClick={handleEditSupplier}
                        leftIcon={Edit}
                      >
                        Edit Supplier
                      </Button>

                      <Button
                        variant="danger"
                        className="w-full"
                        onClick={handleDeleteSupplier}
                        leftIcon={Trash2}
                      >
                        Delete Supplier
                      </Button>
                    </div>

                    {/* Supplier Stats */}
                    <div className="mt-6 p-4 bg-[rgb(var(--color-bg-primary))]/20 rounded-lg border border-[rgb(var(--color-border-primary))]/30">
                      <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-3">Supplier Stats</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[rgb(var(--color-text-secondary))]">Total Products:</span>
                          <span className="font-medium text-[rgb(var(--color-text-primary))]">0</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[rgb(var(--color-text-secondary))]">Total Orders:</span>
                          <span className="font-medium text-[rgb(var(--color-text-primary))]">0</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[rgb(var(--color-text-secondary))]">Last Order:</span>
                          <span className="font-medium text-[rgb(var(--color-text-primary))]">Never</span>
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
              Delete Supplier
            </h3>
            <p className="text-[rgb(var(--color-text-secondary))] mb-6">
              Are you sure you want to delete "{supplierData?.name || 'Supplier'}"? This action cannot be undone.
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
                Supplier Deleted Successfully!
              </h3>
              <p className="text-[rgb(var(--color-text-secondary))] mb-6">
                "{deletedSupplierName}" has been removed from your supplier list.
              </p>
              <Button variant="primary" onClick={handleDeleteSuccess}>
                Back to Suppliers
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewSupplierPage;
