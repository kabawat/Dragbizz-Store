"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus } from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { invoiceService } from '@/service';
import { useAppSelector } from '@/store/hooks';
import Link from 'next/link';
import { useGlobalToast } from '@/contexts/ToastContext';
import DeleteInvoiceModal from './components/DeleteInvoiceModal';
import CancelInvoiceModal from './components/CancelInvoiceModal';
import { ReleaseInvoiceModal, UpdatePaymentStatusModal } from '@/components/invoice';
import InvoiceSummaryCard from './components/InvoiceSummaryCard';
import InvoiceActionButtons from './components/InvoiceActionButtons';
import { calculateGstAmount, getItemsWithGst, calculateSubtotal } from './utils/invoiceCalculations.utils';
import { getTemplateComponent } from './utils/invoiceView.utils';
import { useInvoicePrint } from './hooks/useInvoicePrint';


const ViewInvoicePage = ({ invoiceId }) => {
    const router = useRouter();
    const { selectedStore } = useAppSelector((state) => state.profile);
    const storeId = selectedStore?.storeId;

    const [fetching, setFetching] = useState(true);
    const [invoiceData, setInvoiceData] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [showReleaseModal, setShowReleaseModal] = useState(false);
    const [isReleasing, setIsReleasing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('PAID');
    const [showPaymentStatusModal, setShowPaymentStatusModal] = useState(false);
    const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState('modern');
    const hasFetched = useRef(false);
    const { showSuccess, showError } = useGlobalToast();
    const { handlePrint, handleDownloadPDF } = useInvoicePrint(fetching, invoiceData);

    const calculatedGstAmount = invoiceData ? calculateGstAmount(invoiceData) : 0;
    const itemsWithGst = invoiceData ? getItemsWithGst(invoiceData) : [];
    const calculatedSubtotal = invoiceData ? calculateSubtotal(invoiceData, calculatedGstAmount, itemsWithGst) : 0;

    // Fetch invoice data on component mount
    useEffect(() => {
        const fetchInvoiceData = async () => {
            if (hasFetched.current) return;
            hasFetched.current = true;

            try {
                setFetching(true);
                const result = await invoiceService.getInvoices({ id: invoiceId, store: storeId });
                if (result.success && result.data) {
                    setInvoiceData(result.data);
                } else {
                    showError(result.message || 'Failed to fetch invoice data');
                }
            } catch (error) {
                showError('Failed to fetch invoice data. Please try again.');
            } finally {
                setFetching(false);
            }
        };

        fetchInvoiceData();
    }, [invoiceId, storeId]);

    // Load default template from localStorage
    useEffect(() => {
        const savedTemplate = localStorage.getItem('invoice-template');
        if (savedTemplate) {
            setSelectedTemplate(savedTemplate);
        }
    }, []);


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
                showSuccess('Invoice deleted successfully');
                setTimeout(() => {
                    router.push('/dashboard/invoices');
                }, 1000);
            } else {
                showError(result.message || 'Failed to delete invoice');
            }
        } catch (error) {
            showError('Failed to delete invoice. Please try again.');
        } finally {
            setIsDeleting(false);
        }
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
                showSuccess('Invoice cancelled successfully');
                const refreshResult = await invoiceService.getInvoiceById(invoiceId, storeId);
                if (refreshResult.success && refreshResult.data) {
                    setInvoiceData(refreshResult.data);
                }
            } else {
                showError(result.message || 'Failed to cancel invoice');
            }
        } catch (error) {
            showError('Failed to cancel invoice. Please try again.');
        } finally {
            setIsCancelling(false);
        }
    };

    // Handle release invoice
    const handleReleaseInvoice = () => {
        setShowReleaseModal(true);
    };

    // Handle confirm release
    const handleConfirmRelease = async (payload) => {
        if (!invoiceId) return;

        setIsReleasing(true);
        try {
            const result = await invoiceService.releaseInvoice(
                invoiceId, 
                payload.paymentStatus, 
                storeId,
                payload.paidAmount || null
            );

            if (result.success) {
                showSuccess('Invoice released successfully');
                setShowReleaseModal(false);
                const refreshResult = await invoiceService.getInvoices({ id: invoiceId, store: storeId });
                if (refreshResult.success && refreshResult.data) {
                    setInvoiceData(refreshResult.data);
                }
            } else {
                showError(result.message || 'Failed to release invoice');
            }
        } catch (error) {
            showError('Failed to release invoice. Please try again.');
        } finally {
            setIsReleasing(false);
        }
    };

    // Handle update payment status
    const handleUpdatePaymentStatus = () => {
        setShowPaymentStatusModal(true);
    };

    // Handle confirm payment status update
    const handleConfirmPaymentStatusUpdate = async (payload) => {
        if (!invoiceId) return;

        setIsUpdatingPayment(true);
        try {
            const result = await invoiceService.updatePaymentStatus(
                invoiceId,
                payload.paymentStatus,
                null, // paymentMode (optional)
                storeId,
                payload.paidAmount || null // paidAmount (optional, for PAY_LATTER)
            );

            if (result.success) {
                showSuccess('Payment status updated successfully');
                setShowPaymentStatusModal(false);
                const refreshResult = await invoiceService.getInvoices({ id: invoiceId, store: storeId });
                if (refreshResult.success && refreshResult.data) {
                    setInvoiceData(refreshResult.data);
                }
            } else {
                showError(result.message || 'Failed to update payment status');
            }
        } catch (error) {
            showError('Failed to update payment status. Please try again.');
        } finally {
            setIsUpdatingPayment(false);
        }
    };


    // Loading state
    if (fetching) {
        return (
            <div className="flex h-screen relative w-full overflow-hidden">
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
        <>
            {/* Global Print Styles - Hide UI elements */}
            <style jsx global>{`
                @media print {
                    /* Hide navigation and UI elements */
                    .no-print,
                    nav,
                    header,
                    .sidebar,
                    .header,
                    button,
                    .btn,
                    .action-buttons,
                    .right-sidebar {
                        display: none !important;
                    }
                    
                    /* Body setup */
                    body {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                    }
                    
                    /* Main container */
                    .main-content {
                        width: 100% !important;
                        max-width: none !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                    }
                    
                    /* Page setup */
                    @page {
                        margin: 1cm;
                        size: A4;
                    }
                }
            `}</style>

            <div className="flex h-screen relative w-full overflow-hidden">
                {/* Sidebar */}
                <div className="no-print">
                    <Sidebar />
                </div>

                {/* Main Content */}
                <div className="min-h-screen w-full flex flex-col main-content">
                    {/* Header */}
                    <div className="no-print">
                        <Header title="View Invoice" description="Invoice information and details" />
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 p-6">
                        <div className="max-w-8xl mx-auto w-full">
                            {/* Back Button and Create New Invoice Button */}
                            <div className="mb-4 no-print flex items-center justify-between">
                                <Link href="/dashboard/invoices" className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors">
                                    <ArrowLeft className="w-4 h-4" />
                                    <span className="text-sm font-medium">Back to Invoices</span>
                                </Link>
                                <Link href="/dashboard/invoices/add">
                                    <Button variant="primary" leftIcon={Plus}>
                                        Create New Invoice
                                    </Button>
                                </Link>
                            </div>
                            {/* Invoice Details - Two Column Layout */}
                            {invoiceData && (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ height: 'calc(100vh - 150px)' }}>

                                    {/* Left Column - Invoice Format */}
                                    <div className="lg:col-span-2 flex flex-col h-full">
                                        <div className="flex-1 overflow-y-auto pe-3 max-h-[calc(100vh-150px)]">
                                            {/* Invoice Document with Template */}
                                            <div id="invoice-area" className="bg-white rounded-lg">
                                                {invoiceData && React.createElement(getTemplateComponent(selectedTemplate), {
                                                    invoiceData: {
                                                        ...invoiceData,
                                                        items: itemsWithGst.length > 0 ? itemsWithGst : invoiceData.items,
                                                        subtotal: calculatedSubtotal > 0 ? calculatedSubtotal : invoiceData.subtotal,
                                                        gstAmount: calculatedGstAmount > 0 ? calculatedGstAmount : invoiceData.gstAmount
                                                    },
                                                    selectedStore
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Sidebar - Compact Design */}
                                    <div className="flex flex-col h-full no-print right-sidebar">
                                        <div className="flex-1 overflow-y-auto px-3 max-h-[calc(100vh-204px)]">
                                            <div className="space-y-4">
                                                <InvoiceSummaryCard
                                                    invoiceData={invoiceData}
                                                    calculatedSubtotal={calculatedSubtotal}
                                                    calculatedGstAmount={calculatedGstAmount}
                                                />
                                                <InvoiceActionButtons
                                                    invoiceData={invoiceData}
                                                    onEdit={handleEditInvoice}
                                                    onRelease={handleReleaseInvoice}
                                                    onUpdatePaymentStatus={handleUpdatePaymentStatus}
                                                    onDownloadPDF={() => handleDownloadPDF(invoiceData, invoiceId)}
                                                    onPrint={handlePrint}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}


                        </div>
                    </div>
                </div>

                <DeleteInvoiceModal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={handleConfirmDelete}
                    invoiceNumber={invoiceData?.invoiceNumber}
                    isDeleting={isDeleting}
                />

                <CancelInvoiceModal
                    isOpen={showCancelModal}
                    onClose={() => setShowCancelModal(false)}
                    onConfirm={handleConfirmCancel}
                    invoiceNumber={invoiceData?.invoiceNumber}
                    isCancelling={isCancelling}
                />

                <ReleaseInvoiceModal
                    isOpen={showReleaseModal}
                    onClose={() => setShowReleaseModal(false)}
                    onConfirm={handleConfirmRelease}
                    invoiceNumber={invoiceData?.invoiceNumber}
                    paymentStatus={paymentStatus}
                    onPaymentStatusChange={(value) => setPaymentStatus(value)}
                    isReleasing={isReleasing}
                    totalAmount={invoiceData?.totalAmount || 0}
                />

                <UpdatePaymentStatusModal
                    isOpen={showPaymentStatusModal}
                    onClose={() => setShowPaymentStatusModal(false)}
                    onConfirm={handleConfirmPaymentStatusUpdate}
                    invoiceNumber={invoiceData?.invoiceNumber}
                    currentPaymentStatus={invoiceData?.paymentStatus}
                    totalAmount={invoiceData?.totalAmount || 0}
                    isUpdating={isUpdatingPayment}
                />
            </div>
        </>
    );
};

export default ViewInvoicePage;
