"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Calendar, User, DollarSign, Package, Edit, Copy, Trash2, CheckCircle, Hash, IndianRupee, Clock, AlertCircle, XCircle } from 'lucide-react';
import moment from 'moment';

// Import components
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { Button, AnimatedBackground, Badge, Card } from '@/components/ui';
import { invoiceService } from '@/service';
import { useAppSelector } from '@/store/hooks';
import Link from 'next/link';

const ViewInvoicePage = ({ invoiceId }) => {
    const router = useRouter();
    const { selectedStore } = useAppSelector((state) => state.profile);
    const storeId = selectedStore?.storeId;

    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState(null);
    const [invoiceData, setInvoiceData] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
    const [deletedInvoiceNumber, setDeletedInvoiceNumber] = useState('');
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [showReleaseModal, setShowReleaseModal] = useState(false);
    const [isReleasing, setIsReleasing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('PAID');
    const hasFetched = useRef(false);

    // Fetch invoice data on component mount
    useEffect(() => {
        const fetchInvoiceData = async () => {
            if (hasFetched.current) return;
            hasFetched.current = true;

            try {
                setFetching(true);
                setError(null);

                const result = await invoiceService.getInvoices({ id: invoiceId, store :storeId });
                if (result.success && result.data) {
                    console.log(result.data);
                    setInvoiceData(result.data);
                } else {
                    setError(result.message || 'Failed to fetch invoice data');
                }
            } catch (error) {
                console.error('Error fetching invoice:', error);
                setError('Failed to fetch invoice data. Please try again.');
            } finally {
                setFetching(false);
            }
        };

        fetchInvoiceData();
    }, [invoiceId, storeId]);

    // Handle edit invoice
    const handleEditInvoice = () => {
        router.push(`/dashboard/invoices/edit/${invoiceId}`);
    };

    // Handle delete invoice
    const handleDeleteInvoice = () => {
        setShowDeleteModal(true);
    };

    // Handle confirm delete
    const handleConfirmDelete = async () => {
        if (!invoiceId) return;

        setIsDeleting(true);
        try {
            const result = await invoiceService.deleteInvoice(invoiceId);

            if (result.success) {
                setDeletedInvoiceNumber(invoiceData?.invoiceNumber || 'Invoice');
                setShowDeleteSuccessModal(true);
                setShowDeleteModal(false);
            } else {
                setError(result.message || 'Failed to delete invoice');
                setShowDeleteModal(false);
            }
        } catch (error) {
            console.error('Error deleting invoice:', error);
            setError('Failed to delete invoice. Please try again.');
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
        router.push('/dashboard/invoices');
    };

    // Handle cancel invoice
    const handleCancelInvoice = () => {
        setShowCancelModal(true);
    };

    // Handle confirm cancel
    const handleConfirmCancel = async () => {
        if (!invoiceId) return;

        setIsCancelling(true);
        try {
            const result = await invoiceService.cancelInvoice(invoiceId, 'Cancelled by user');

            if (result.success) {
                // Refresh invoice data
                const refreshResult = await invoiceService.getInvoiceById(invoiceId, storeId);
                if (refreshResult.success && refreshResult.data) {
                    setInvoiceData(refreshResult.data);
                }
                setShowCancelModal(false);
            } else {
                setError(result.message || 'Failed to cancel invoice');
                setShowCancelModal(false);
            }
        } catch (error) {
            console.error('Error cancelling invoice:', error);
            setError('Failed to cancel invoice. Please try again.');
            setShowCancelModal(false);
        } finally {
            setIsCancelling(false);
        }
    };

    // Handle release invoice
    const handleReleaseInvoice = () => {
        setShowReleaseModal(true);
    };

    // Handle confirm release
    const handleConfirmRelease = async () => {
        if (!invoiceId) return;

        setIsReleasing(true);
        try {
            const result = await invoiceService.releaseInvoice(invoiceId, paymentStatus);

            if (result.success) {
                // Refresh invoice data
                const refreshResult = await invoiceService.getInvoiceById(invoiceId, storeId);
                if (refreshResult.success && refreshResult.data) {
                    setInvoiceData(refreshResult.data);
                }
                setShowReleaseModal(false);
            } else {
                setError(result.message || 'Failed to release invoice');
                setShowReleaseModal(false);
            }
        } catch (error) {
            console.error('Error releasing invoice:', error);
            setError('Failed to release invoice. Please try again.');
            setShowReleaseModal(false);
        } finally {
            setIsReleasing(false);
        }
    };

     // Get status color
     const getStatusColor = (status) => {
         switch (status) {
             case 'DRAFT': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300';
             case 'RELEASED': return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300';
             case 'CANCELLED': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300';
             default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
         }
     };

     // Get payment status color
     const getPaymentStatusColor = (status) => {
         switch (status) {
             case 'PAID': return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300';
             case 'PENDING': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300';
             case 'OVERDUE': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300';
             default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
         }
     };

    // Copy invoice number to clipboard
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // You could add a toast notification here
    };

    // Loading state
    if (fetching) {
        return (
            <div className="flex h-screen relative w-full overflow-hidden">
                <AnimatedBackground variant="default" />
                <Sidebar />
                <div className="min-h-screen w-full flex flex-col">
                    <Header
                        title="View Invoice"
                        description="Invoice information and details"
                    />
                    <div className="flex-1 p-6 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                    title="View Invoice"
                    description="Invoice information and details"
                />

                {/* Main Content */}
                <div className="flex-1 p-6">
                    <div className="">
                        {/* Back Button */}
                        <div className="mb-6">
                            <Link href="/dashboard/invoices" className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors">
                                <ArrowLeft className="w-4 h-4" />
                                <span className="text-sm font-medium">Back to Invoices</span>
                            </Link>
                        </div>

                         {/* Error State - Full Page */}
                         {error && (
                             <div className="w-full">
                                 <div className="bg-[rgb(var(--color-bg-primary))] p-8 rounded-xl border border-[rgb(var(--color-border-primary))]">
                                     <div className="flex flex-col items-center space-y-4">
                                         <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                                             <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                                         </div>
                                         <div>
                                             <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">Error Loading Invoice</h3>
                                             <p className="text-[rgb(var(--color-text-secondary))] mb-4">{error}</p>
                                             <Button onClick={() => window.location.reload()}>
                                                 Try Again
                                             </Button>
                                         </div>
                                     </div>
                                 </div>
                             </div>
                         )}

                        {/* Invoice Details */}
                        {invoiceData && (
                            <div className="space-y-6">
                                 {/* Header Section */}
                                 <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-6">
                                     <div className="flex justify-between items-start mb-6">
                                         <div className="flex items-center space-x-4">
                                             <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                                 <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                             </div>
                                             <div>
                                                 <h1 className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">
                                                     {invoiceData.invoiceNumber}
                                                 </h1>
                                                 <div className="flex items-center space-x-2 mt-1">
                                                     <Badge className={getStatusColor(invoiceData.status)}>
                                                         {invoiceData.status}
                                                     </Badge>
                                                     <Badge className={getPaymentStatusColor(invoiceData.paymentStatus)}>
                                                         {invoiceData.paymentStatus}
                                                     </Badge>
                                                 </div>
                                             </div>
                                         </div>

                                        {/* Action Buttons */}
                                        <div className="flex space-x-3">
                                            {invoiceData.status === 'DRAFT' && (
                                                <>
                                                    <Button onClick={handleEditInvoice} variant="outline" className="flex items-center space-x-2">
                                                        <Edit className="w-4 h-4" />
                                                        <span>Edit</span>
                                                    </Button>
                                                    <Button onClick={handleReleaseInvoice} className="flex items-center space-x-2">
                                                        <CheckCircle className="w-4 h-4" />
                                                        <span>Release</span>
                                                    </Button>
                                                    <Button onClick={handleCancelInvoice} variant="outline" className="flex items-center space-x-2 text-red-600 hover:text-red-700">
                                                        <XCircle className="w-4 h-4" />
                                                        <span>Cancel</span>
                                                    </Button>
                                                </>
                                            )}
                                            <Button onClick={handleDeleteInvoice} variant="outline" className="flex items-center space-x-2 text-red-600 hover:text-red-700">
                                                <Trash2 className="w-4 h-4" />
                                                <span>Delete</span>
                                            </Button>
                                        </div>
                                    </div>

                                     {/* Invoice Info Grid */}
                                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                         <div className="flex items-center space-x-3">
                                             <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                                 <Hash className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                             </div>
                                             <div>
                                                 <p className="text-sm text-[rgb(var(--color-text-secondary))]">Invoice Number</p>
                                                 <div className="flex items-center space-x-2">
                                                     <p className="font-semibold text-[rgb(var(--color-text-primary))]">{invoiceData.invoiceNumber}</p>
                                                     <Button
                                                         onClick={() => copyToClipboard(invoiceData.invoiceNumber)}
                                                         variant="ghost"
                                                         size="sm"
                                                         className="p-1 h-6 w-6"
                                                     >
                                                         <Copy className="w-3 h-3" />
                                                     </Button>
                                                 </div>
                                             </div>
                                         </div>

                                         <div className="flex items-center space-x-3">
                                             <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                                 <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                             </div>
                                             <div>
                                                 <p className="text-sm text-[rgb(var(--color-text-secondary))]">Created Date</p>
                                                 <p className="font-semibold text-[rgb(var(--color-text-primary))]">
                                                     {moment(invoiceData.createdAt).format('MMM DD, YYYY')}
                                                 </p>
                                             </div>
                                         </div>

                                         <div className="flex items-center space-x-3">
                                             <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                                 <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                             </div>
                                             <div>
                                                 <p className="text-sm text-[rgb(var(--color-text-secondary))]">Customer</p>
                                                 <p className="font-semibold text-[rgb(var(--color-text-primary))]">
                                                     {invoiceData.customer?.name || 'Walk-in Customer'}
                                                 </p>
                                             </div>
                                         </div>

                                         <div className="flex items-center space-x-3">
                                             <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                                 <IndianRupee className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                             </div>
                                             <div>
                                                 <p className="text-sm text-[rgb(var(--color-text-secondary))]">Total Amount</p>
                                                 <p className="font-semibold text-[rgb(var(--color-text-primary))]">
                                                     ₹{invoiceData.totalAmount?.toLocaleString()}
                                                 </p>
                                             </div>
                                         </div>
                                     </div>
                                 </div>

                                 {/* Items Section */}
                                 {invoiceData.items && invoiceData.items.length > 0 && (
                                     <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-6">
                                         <h2 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4">Invoice Items</h2>
                                         <div className="overflow-x-auto">
                                             <table className="w-full">
                                                 <thead>
                                                     <tr className="border-b border-[rgb(var(--color-border-primary))]">
                                                         <th className="text-left py-3 px-4 font-medium text-[rgb(var(--color-text-secondary))]">Product</th>
                                                         <th className="text-right py-3 px-4 font-medium text-[rgb(var(--color-text-secondary))]">Quantity</th>
                                                         <th className="text-right py-3 px-4 font-medium text-[rgb(var(--color-text-secondary))]">Unit Price</th>
                                                         <th className="text-right py-3 px-4 font-medium text-[rgb(var(--color-text-secondary))]">Total</th>
                                                     </tr>
                                                 </thead>
                                                 <tbody>
                                                     {invoiceData.items.map((item, index) => (
                                                         <tr key={index} className="border-b border-[rgb(var(--color-border-primary))]">
                                                             <td className="py-3 px-4">
                                                                 <div>
                                                                     <p className="font-medium text-[rgb(var(--color-text-primary))]">{item.product?.name || 'Unknown Product'}</p>
                                                                     {item.product?.sku && (
                                                                         <p className="text-sm text-[rgb(var(--color-text-tertiary))]">SKU: {item.product.sku}</p>
                                                                     )}
                                                                 </div>
                                                             </td>
                                                             <td className="text-right py-3 px-4 font-medium text-[rgb(var(--color-text-primary))]">
                                                                 {item.quantity}
                                                             </td>
                                                             <td className="text-right py-3 px-4 text-[rgb(var(--color-text-secondary))]">
                                                                 ₹{item.price?.toLocaleString()}
                                                             </td>
                                                             <td className="text-right py-3 px-4 font-medium text-[rgb(var(--color-text-primary))]">
                                                                 ₹{(item.quantity * item.price)?.toLocaleString()}
                                                             </td>
                                                         </tr>
                                                     ))}
                                                 </tbody>
                                             </table>
                                         </div>

                                         {/* Summary */}
                                         <div className="mt-6 pt-6 border-t border-[rgb(var(--color-border-primary))]">
                                             <div className="flex justify-end">
                                                 <div className="w-64 space-y-2">
                                                     <div className="flex justify-between text-sm">
                                                         <span className="text-[rgb(var(--color-text-secondary))]">Subtotal:</span>
                                                         <span className="text-[rgb(var(--color-text-primary))]">₹{invoiceData.subtotal?.toLocaleString()}</span>
                                                     </div>
                                                     {invoiceData.totalDiscount > 0 && (
                                                         <div className="flex justify-between text-sm">
                                                             <span className="text-[rgb(var(--color-text-secondary))]">Discount:</span>
                                                             <span className="text-red-600 dark:text-red-400">-₹{invoiceData.totalDiscount?.toLocaleString()}</span>
                                                         </div>
                                                     )}
                                                     <div className="flex justify-between text-lg font-semibold border-t border-[rgb(var(--color-border-primary))] pt-2">
                                                         <span className="text-[rgb(var(--color-text-primary))]">Total:</span>
                                                         <span className="text-[rgb(var(--color-text-primary))]">₹{invoiceData.totalAmount?.toLocaleString()}</span>
                                                     </div>
                                                 </div>
                                             </div>
                                         </div>
                                     </div>
                                 )}

                                 {/* Customer Details */}
                                 {invoiceData.customer && (
                                     <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-6">
                                         <h2 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4">Customer Details</h2>
                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                             <div>
                                                 <p className="text-sm text-[rgb(var(--color-text-secondary))]">Name</p>
                                                 <p className="font-medium text-[rgb(var(--color-text-primary))]">{invoiceData.customer.name}</p>
                                             </div>
                                             {invoiceData.customer.email && (
                                                 <div>
                                                     <p className="text-sm text-[rgb(var(--color-text-secondary))]">Email</p>
                                                     <p className="font-medium text-[rgb(var(--color-text-primary))]">{invoiceData.customer.email}</p>
                                                 </div>
                                             )}
                                             {invoiceData.customer.phone && (
                                                 <div>
                                                     <p className="text-sm text-[rgb(var(--color-text-secondary))]">Phone</p>
                                                     <p className="font-medium text-[rgb(var(--color-text-primary))]">{invoiceData.customer.phone}</p>
                                                 </div>
                                             )}
                                             {invoiceData.customer.address && (
                                                 <div>
                                                     <p className="text-sm text-[rgb(var(--color-text-secondary))]">Address</p>
                                                     <p className="font-medium text-[rgb(var(--color-text-primary))]">{invoiceData.customer.address}</p>
                                                 </div>
                                             )}
                                         </div>
                                     </div>
                                 )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

             {/* Delete Confirmation Modal */}
             {showDeleteModal && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                     <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 max-w-md w-full mx-4 border border-[rgb(var(--color-border-primary))]">
                         <div className="flex items-center space-x-3 mb-4">
                             <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                                 <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                             </div>
                             <div>
                                 <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Delete Invoice</h3>
                                 <p className="text-sm text-[rgb(var(--color-text-secondary))]">This action cannot be undone</p>
                             </div>
                         </div>
                         <p className="text-[rgb(var(--color-text-primary))] mb-6">
                             Are you sure you want to delete invoice <strong>{invoiceData?.invoiceNumber}</strong>?
                             This will permanently remove the invoice and all its data.
                         </p>
                         <div className="flex space-x-3">
                             <Button
                                 onClick={handleCancelDelete}
                                 variant="outline"
                                 className="flex-1"
                                 disabled={isDeleting}
                             >
                                 Cancel
                             </Button>
                             <Button
                                 onClick={handleConfirmDelete}
                                 className="flex-1 bg-red-600 hover:bg-red-700"
                                 disabled={isDeleting}
                             >
                                 {isDeleting ? 'Deleting...' : 'Delete'}
                             </Button>
                         </div>
                     </div>
                 </div>
             )}

             {/* Delete Success Modal */}
             {showDeleteSuccessModal && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                     <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 max-w-md w-full mx-4 border border-[rgb(var(--color-border-primary))]">
                         <div className="flex items-center space-x-3 mb-4">
                             <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                                 <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                             </div>
                             <div>
                                 <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Invoice Deleted</h3>
                                 <p className="text-sm text-[rgb(var(--color-text-secondary))]">Successfully removed from your store</p>
                             </div>
                         </div>
                         <p className="text-[rgb(var(--color-text-primary))] mb-6">
                             Invoice <strong>{deletedInvoiceNumber}</strong> has been successfully deleted.
                         </p>
                         <Button onClick={handleDeleteSuccess} className="w-full">
                             Back to Invoices
                         </Button>
                     </div>
                 </div>
             )}

             {/* Cancel Confirmation Modal */}
             {showCancelModal && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                     <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 max-w-md w-full mx-4 border border-[rgb(var(--color-border-primary))]">
                         <div className="flex items-center space-x-3 mb-4">
                             <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                                 <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                             </div>
                             <div>
                                 <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Cancel Invoice</h3>
                                 <p className="text-sm text-[rgb(var(--color-text-secondary))]">This will mark the invoice as cancelled</p>
                             </div>
                         </div>
                         <p className="text-[rgb(var(--color-text-primary))] mb-6">
                             Are you sure you want to cancel invoice <strong>{invoiceData?.invoiceNumber}</strong>?
                             This action can be reversed later.
                         </p>
                         <div className="flex space-x-3">
                             <Button
                                 onClick={() => setShowCancelModal(false)}
                                 variant="outline"
                                 className="flex-1"
                                 disabled={isCancelling}
                             >
                                 Cancel
                             </Button>
                             <Button
                                 onClick={handleConfirmCancel}
                                 className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                                 disabled={isCancelling}
                             >
                                 {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
                             </Button>
                         </div>
                     </div>
                 </div>
             )}

             {/* Release Confirmation Modal */}
             {showReleaseModal && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                     <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 max-w-md w-full mx-4 border border-[rgb(var(--color-border-primary))]">
                         <div className="flex items-center space-x-3 mb-4">
                             <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                                 <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                             </div>
                             <div>
                                 <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Release Invoice</h3>
                                 <p className="text-sm text-[rgb(var(--color-text-secondary))]">This will finalize the invoice</p>
                             </div>
                         </div>
                         <p className="text-[rgb(var(--color-text-primary))] mb-4">
                             Are you sure you want to release invoice <strong>{invoiceData?.invoiceNumber}</strong>?
                             This will finalize the invoice and it cannot be edited afterwards.
                         </p>
                         <div className="mb-6">
                             <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                                 Payment Status
                             </label>
                             <select
                                 value={paymentStatus}
                                 onChange={(e) => setPaymentStatus(e.target.value)}
                                 className="w-full px-3 py-2 border border-[rgb(var(--color-border-primary))] rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))]"
                             >
                                 <option value="PAID">Paid</option>
                                 <option value="PENDING">Pending</option>
                                 <option value="OVERDUE">Overdue</option>
                             </select>
                         </div>
                         <div className="flex space-x-3">
                             <Button
                                 onClick={() => setShowReleaseModal(false)}
                                 variant="outline"
                                 className="flex-1"
                                 disabled={isReleasing}
                             >
                                 Cancel
                             </Button>
                             <Button
                                 onClick={handleConfirmRelease}
                                 className="flex-1"
                                 disabled={isReleasing}
                             >
                                 {isReleasing ? 'Releasing...' : 'Release Invoice'}
                             </Button>
                         </div>
                     </div>
                 </div>
             )}
        </div>
    );
};

export default ViewInvoicePage;
