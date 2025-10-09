"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Calendar, User, DollarSign, Package, Edit, Copy, Trash2, CheckCircle, Hash, IndianRupee, Clock, AlertCircle, XCircle } from 'lucide-react';
import moment from 'moment';

// Import components
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { Button, AnimatedBackground, Badge, Card, Select } from '@/components/ui';
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

                const result = await invoiceService.getInvoices({ id: invoiceId, store: storeId });
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
            const result = await invoiceService.releaseInvoice(invoiceId, paymentStatus, storeId);

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
            case 'DRAFT': return 'bg-[rgb(var(--color-warning))]/10 text-[rgb(var(--color-warning))]';
            case 'RELEASED': return 'bg-[rgb(var(--color-success))]/10 text-[rgb(var(--color-success))]';
            case 'CANCELLED': return 'bg-[rgb(var(--color-danger))]/10 text-[rgb(var(--color-danger))]';
            default: return 'bg-[rgb(var(--color-bg-tertiary))] text-[rgb(var(--color-text-secondary))]';
        }
    };

    // Get payment status color
    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'PAID': return 'bg-[rgb(var(--color-success))]/10 text-[rgb(var(--color-success))]';
            case 'UNPAID': return 'bg-[rgb(var(--color-warning))]/10 text-[rgb(var(--color-warning))]';
            case 'PAY_LATTER': return 'bg-[rgb(var(--color-warning))]/10 text-[rgb(var(--color-warning))]';
            case 'CANCELLED': return 'bg-[rgb(var(--color-danger))]/10 text-[rgb(var(--color-danger))]';
            default: return 'bg-[rgb(var(--color-bg-tertiary))] text-[rgb(var(--color-text-secondary))]';
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
                    <div className="max-w-8xl mx-auto w-full">
                        {/* Back Button */}
                        <div className="mb-4">
                            <Link href="/dashboard/invoices" className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors">
                                <ArrowLeft className="w-4 h-4" />
                                <span className="text-sm font-medium">Back to Invoices</span>
                            </Link>
                        </div>

                        {/* Error State */}
                        {error && (
                            <div className="w-full">
                                <div className="bg-[rgb(var(--color-bg-primary))] p-8 rounded-xl border border-[rgb(var(--color-border-primary))]">
                                    <div className="flex flex-col items-center space-y-4">
                                        <div className="w-16 h-16 bg-[rgb(var(--color-danger))]/10 rounded-full flex items-center justify-center">
                                            <XCircle className="w-8 h-8 text-[rgb(var(--color-danger))]" />
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

                        {/* Invoice Details - Two Column Layout */}
                        {invoiceData && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ height: 'calc(100vh - 150px)' }}>

                                {/* Left Column - Invoice Format */}
                                <div className="lg:col-span-2 flex flex-col h-full">
                                    <div className="flex-1 overflow-y-auto pe-3 max-h-[calc(100vh-150px)]">
                                        {/* Invoice Document */}
                                        <div className="bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-lg shadow-sm">
                                            {/* Invoice Header */}
                                            <div className="p-8 border-b border-[rgb(var(--color-border-primary))]">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div>
                                                        <h1 className="text-xl font-bold text-[rgb(var(--color-text-primary))] mb-2">
                                                            INVOICE
                                                        </h1>
                                                        <div className="flex items-center space-x-2">
                                                            <Badge className={getStatusColor(invoiceData?.invoiceStatus)}>
                                                                {invoiceData?.invoiceStatus}
                                                            </Badge>
                                                            <Badge className={getPaymentStatusColor(invoiceData.paymentStatus)}>
                                                                {invoiceData.paymentStatus}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-2xl font-bold text-[rgb(var(--color-text-primary))] mb-2">
                                                            {invoiceData.invoiceNumber}
                                                        </div>
                                                        <div className="text-sm text-[rgb(var(--color-text-secondary))]">
                                                            Date: {moment(invoiceData.createdAt).format('MMM DD, YYYY')}
                                                        </div>
                                                        <div className="text-sm text-[rgb(var(--color-text-secondary))]">
                                                            Due: {moment(invoiceData.createdAt).add(30, 'days').format('MMM DD, YYYY')}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Company and Customer Info */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    {/* Company Info */}
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-3">From:</h3>
                                                        <div className="text-[rgb(var(--color-text-primary))]">
                                                            <div className="font-semibold text-lg">{selectedStore?.storeName || 'Your Store'}</div>
                                                            <div className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">
                                                                {selectedStore?.address || '123 Business Street, City, State 12345'}
                                                            </div>
                                                            <div className="text-sm text-[rgb(var(--color-text-secondary))]">
                                                                Phone: {selectedStore?.phone || '+91 9876543210'}
                                                            </div>
                                                            <div className="text-sm text-[rgb(var(--color-text-secondary))]">
                                                                Email: {selectedStore?.email || 'info@yourstore.com'}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Customer Info */}
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-3">Bill To:</h3>
                                                        <div className="text-[rgb(var(--color-text-primary))]">
                                                            <div className="font-semibold text-lg">
                                                                {invoiceData.customer?.name || 'Walk-in Customer'}
                                                            </div>
                                                            {invoiceData.customer?.email && (
                                                                <div className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">
                                                                    Email: {invoiceData.customer.email}
                                                                </div>
                                                            )}
                                                            {invoiceData.customer?.phone && (
                                                                <div className="text-sm text-[rgb(var(--color-text-secondary))]">
                                                                    Phone: {invoiceData.customer.phone}
                                                                </div>
                                                            )}
                                                            {invoiceData.customer?.address && (
                                                                <div className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">
                                                                    {invoiceData.customer.address}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Invoice Items Table */}
                                            <div className="p-8">
                                                <div className="overflow-x-auto">
                                                    <table className="w-full">
                                                        <thead>
                                                            <tr className="border-b-2 border-[rgb(var(--color-border-primary))]">
                                                                <th className="text-left py-4 px-2 font-semibold text-[rgb(var(--color-text-primary))]">Description</th>
                                                                <th className="text-center py-4 px-2 font-semibold text-[rgb(var(--color-text-primary))]">Qty</th>
                                                                <th className="text-right py-4 px-2 font-semibold text-[rgb(var(--color-text-primary))]">Rate</th>
                                                                <th className="text-right py-4 px-2 font-semibold text-[rgb(var(--color-text-primary))]">Amount</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {invoiceData.items?.map((item, index) => (
                                                                <tr key={index} className="border-b border-[rgb(var(--color-border-primary))]">
                                                                    <td className="py-4 px-2">
                                                                        <div>
                                                                            <div className="font-medium text-[rgb(var(--color-text-primary))]">
                                                                                {item.product?.name || 'Unknown Product'}
                                                                            </div>
                                                                            {item.product?.sku && (
                                                                                <div className="text-sm text-[rgb(var(--color-text-tertiary))] mt-1">
                                                                                    SKU: {item.product.sku}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                    <td className="text-center py-4 px-2 font-medium text-[rgb(var(--color-text-primary))]">
                                                                        {item.quantity}
                                                                    </td>
                                                                    <td className="text-right py-4 px-2 text-[rgb(var(--color-text-secondary))]">
                                                                        ₹{item.price?.toLocaleString()}
                                                                    </td>
                                                                    <td className="text-right py-4 px-2 font-medium text-[rgb(var(--color-text-primary))]">
                                                                        ₹{(item.quantity * item.price)?.toLocaleString()}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>

                                                {/* Invoice Totals */}
                                                <div className="mt-8 flex justify-end">
                                                    <div className="w-80">
                                                        <div className="space-y-3">
                                                            <div className="flex justify-between text-[rgb(var(--color-text-secondary))]">
                                                                <span>Subtotal:</span>
                                                                <span>₹{invoiceData.subtotal?.toLocaleString()}</span>
                                                            </div>
                                                            {invoiceData.totalDiscount > 0 && (
                                                                <div className="flex justify-between text-[rgb(var(--color-danger))]">
                                                                    <span>Discount:</span>
                                                                    <span>-₹{invoiceData.totalDiscount?.toLocaleString()}</span>
                                                                </div>
                                                            )}
                                                            <div className="border-t-2 border-[rgb(var(--color-border-primary))] pt-3">
                                                                <div className="flex justify-between text-lg font-bold text-[rgb(var(--color-text-primary))]">
                                                                    <span>Total:</span>
                                                                    <span>₹{invoiceData.totalAmount?.toLocaleString()}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Invoice Footer Signature */}
                                            <div className="mt-6 p-4 border-t border-[rgb(var(--color-border-primary))] text-center">
                                                <p className="text-xs text-[rgb(var(--color-text-tertiary))] font-medium">
                                                    This is a computer-generated invoice and does not require a signature.
                                                </p>
                                                <p className="text-xs text-[rgb(var(--color-text-tertiary))] mt-2">
                                                    Invoice generated on {moment(invoiceData.createdAt).format('MMMM DD, YYYY [at] HH:mm')}
                                                </p>
                                            </div>

                                        </div>
                                    </div>
                                </div>

                                {/* Right Sidebar - Compact Design */}
                                <div className="flex flex-col h-full">
                                    <div className="flex-1 overflow-y-auto px-3 max-h-[calc(100vh-204px)]">
                                        <div className="space-y-4">
                                            {/* Invoice Summary Card */}
                                            <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg border border-[rgb(var(--color-border-primary))] p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-8 h-8 bg-[rgb(var(--color-primary))]/10 rounded-lg flex items-center justify-center">
                                                            <FileText className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-bold text-[rgb(var(--color-text-primary))]">
                                                                {invoiceData.invoiceNumber}
                                                            </h3>
                                                            <div className="flex space-x-1">
                                                                <Badge className={getStatusColor(invoiceData?.invoiceStatus)}>
                                                                    {invoiceData?.invoiceStatus}
                                                                </Badge>
                                                                <Badge className={getPaymentStatusColor(invoiceData.paymentStatus)}>
                                                                    {invoiceData.paymentStatus}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-xl font-bold text-[rgb(var(--color-primary))]">
                                                            ₹{invoiceData.totalAmount?.toLocaleString()}
                                                        </div>
                                                        <div className="text-xs text-[rgb(var(--color-text-secondary))]">Total</div>
                                                    </div>
                                                </div>

                                                {/* Financial Details */}
                                                <div className="space-y-2 pt-3 border-t border-[rgb(var(--color-border-primary))]">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-[rgb(var(--color-text-secondary))]">Customer:</span>
                                                        <span className="font-medium text-[rgb(var(--color-text-primary))] truncate max-w-24">
                                                            {invoiceData.customer?.name || 'Walk-in'}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-[rgb(var(--color-text-secondary))]">Subtotal:</span>
                                                        <span className="font-medium text-[rgb(var(--color-text-primary))]">
                                                            ₹{invoiceData.subtotal?.toLocaleString()}
                                                        </span>
                                                    </div>
                                                    {invoiceData.totalDiscount > 0 && (
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-[rgb(var(--color-text-secondary))]">Discount:</span>
                                                            <span className="font-medium text-[rgb(var(--color-danger))]">
                                                                -₹{invoiceData.totalDiscount?.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-[rgb(var(--color-text-secondary))]">Items:</span>
                                                        <span className="font-medium text-[rgb(var(--color-text-primary))]">
                                                            {invoiceData.items?.length || 0}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>


                                            {/* Action Buttons - Bottom */}
                                            <div className="mt-auto flex gap-2">
                                                {invoiceData?.invoiceStatus === 'DRAFT' ? (
                                                    <>
                                                        <Button
                                                            onClick={handleEditInvoice}
                                                            variant="primary"
                                                            className="flex-1 flex items-center justify-center gap-2 h-10 text-sm font-medium"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                            <span>Edit Invoice</span>
                                                        </Button>
                                                        <Button
                                                            onClick={handleReleaseInvoice}
                                                            variant="success"
                                                            className="flex-1 flex items-center justify-center gap-2 h-10 text-sm font-medium"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                            <span>Release Invoice</span>
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <div className="flex-1 bg-[rgb(var(--color-bg-primary))] rounded-lg border border-[rgb(var(--color-border-primary))] p-4">
                                                        <div className="text-center">
                                                            <div className="text-2xl font-bold text-[rgb(var(--color-primary))] mb-1">
                                                                ₹{invoiceData.totalAmount?.toLocaleString()}
                                                            </div>
                                                            <div className="text-sm text-[rgb(var(--color-text-secondary))]">
                                                                Total Amount
                                                            </div>
                                                        </div>
                                                    </div>
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
                    <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 max-w-md w-full mx-4 border border-[rgb(var(--color-border-primary))]">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-[rgb(var(--color-danger))]/10 rounded-full flex items-center justify-center">
                                <Trash2 className="w-5 h-5 text-[rgb(var(--color-danger))]" />
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
                                className="flex-1 bg-[rgb(var(--color-danger))] hover:bg-[rgb(var(--color-danger))]/90"
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
                    <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 max-w-md w-full mx-4 border border-[rgb(var(--color-border-primary))]">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-[rgb(var(--color-success))]/10 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-[rgb(var(--color-success))]" />
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
                    <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 max-w-md w-full mx-4 border border-[rgb(var(--color-border-primary))]">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-[rgb(var(--color-warning))]/10 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-5 h-5 text-[rgb(var(--color-warning))]" />
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
                                className="flex-1 bg-[rgb(var(--color-warning))] hover:bg-[rgb(var(--color-warning))]/90"
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
                <div className="fixed inset-0 backdrop-blur-[1px] bg-black/10 flex items-center justify-center z-[9999]">
                    <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 max-w-md w-full mx-4 border border-[rgb(var(--color-border-primary))]">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-[rgb(var(--color-success))]/10 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-[rgb(var(--color-success))]" />
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
                            <Select
                                value={paymentStatus}
                                onChange={(value) => setPaymentStatus(value)}
                                options={[
                                    { value: 'UNPAID', label: 'Unpaid' },
                                    { value: 'PAID', label: 'Paid' },
                                    { value: 'PAY_LATTER', label: 'Pay Later' },
                                    { value: 'CANCELLED', label: 'Cancelled' }
                                ]}
                                placeholder="Select payment status"
                            />
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
