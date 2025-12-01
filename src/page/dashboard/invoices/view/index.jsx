"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Calendar, User, IndianRupee, Package, Edit, Copy, Trash2, CheckCircle, Hash, Clock, AlertCircle, XCircle, Printer, Download, Eye, BookOpen, Receipt, ChevronDown, Settings } from 'lucide-react';
import moment from 'moment';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Import components
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { Button, AnimatedBackground, Badge, Card, Select } from '@/components/ui';
import { invoiceService } from '@/service';
import { useAppSelector } from '@/store/hooks';
import Link from 'next/link';

// Import all invoice templates
import {
    ClassicTemplate,
    ModernTemplate,
    MinimalTemplate,
    ProfessionalTemplate,
    ElegantTemplate,
    VintageTemplate,
    AeroTemplate,
    CrystalTemplate,
    StructedTemplate,
    AetherTemplate,
    AuroraTemplate,
    CelesteTemplate,
    EclipseTemplate,
    ApexTemplate,
    ZenithTemplate,
    TerraTemplate,
    LumosTemplate,
    AuraTemplate,
    FusionTemplate,
    OrionTemplate,
    PrismTemplate,
    SpectrumTemplate,
    FlexviewTemplate,
    ElitePaperTemplate,
    NeoEdgeTemplate,
    LuminousLedgerTemplate,
    AurumTemplate,
    VelocityLedgerTemplate,
    SleekStreamTemplate,
    RoyalEdgeTemplate,
    CosmicReceiptTemplate,
    GeometricEdgeTemplate,
    CleanDataSheetTemplate,
    NeoGeometricTemplate,
    PillarProTemplate,
    MatrixLedgerTemplate,
    ProfessionalBlueTemplate,
    MinimalistMonochromeTemplate,
    ModernStackedTemplate,
    RusticEleganceTemplate
} from '@/components/invoice/templates';
import { TEMPLATE_OPTIONS } from '@/components/invoice/templates';


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
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('modern');
    const [showPrintMenu, setShowPrintMenu] = useState(false);
    const hasFetched = useRef(false);

    // Helper function to show error in popup
    const showError = (message) => {
        setErrorMessage(message);
        setShowErrorModal(true);
    };

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

    // Close print menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showPrintMenu && !event.target.closest('.print-menu-container')) {
                setShowPrintMenu(false);
            }
        };

        if (showPrintMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [showPrintMenu]);

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
                showError(result.message || 'Failed to delete invoice');
                setShowDeleteModal(false);
            }
        } catch (error) {
            showError('Failed to delete invoice. Please try again.');
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
                showError(result.message || 'Failed to cancel invoice');
                setShowCancelModal(false);
            }
        } catch (error) {
            showError('Failed to cancel invoice. Please try again.');
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
                const refreshResult = await invoiceService.getInvoices({ id: invoiceId, store: storeId });
                if (refreshResult.success && refreshResult.data) {
                    setInvoiceData(refreshResult.data);
                }
                setShowReleaseModal(false);
            } else {
                showError(result.message || 'Failed to release invoice');
                setShowReleaseModal(false);
            }
        } catch (error) {
            showError('Failed to release invoice. Please try again.');
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

    // Handle template change and save to localStorage
    const handleTemplateChange = (template) => {
        setSelectedTemplate(template);
        localStorage.setItem('invoice-template', template);
    };

    // Get template component
    const getTemplateComponent = () => {
        switch (selectedTemplate) {
            case 'classic': return ClassicTemplate;
            case 'modern': return ModernTemplate;
            case 'minimal': return MinimalTemplate;
            case 'professional': return ProfessionalTemplate;
            case 'elegant': return ElegantTemplate;
            case 'vintage': return VintageTemplate;
            case 'aero': return AeroTemplate;
            case 'crystal': return CrystalTemplate;
            case 'structed': return StructedTemplate;
            case 'aether': return AetherTemplate;
            case 'aurora': return AuroraTemplate;
            case 'celeste': return CelesteTemplate;
            case 'eclipse': return EclipseTemplate;
            case 'apex': return ApexTemplate;
            case 'zentith': return ZenithTemplate;
            case 'terra': return TerraTemplate;
            case 'lumos': return LumosTemplate;
            case 'aura': return AuraTemplate;
            case 'fusion': return FusionTemplate;
            case 'orion': return OrionTemplate;
            case 'spectrum': return SpectrumTemplate;
            case 'PrismTemplate': return PrismTemplate;
            case 'flexview': return FlexviewTemplate;
            case 'elitepaper': return ElitePaperTemplate;
            case 'neoedge': return NeoEdgeTemplate;
            case 'luminousledger': return LuminousLedgerTemplate;
            case 'aurum': return AurumTemplate;
            case 'velocityledger': return VelocityLedgerTemplate;
            case 'sleekstream': return SleekStreamTemplate;
            case 'royaledge': return RoyalEdgeTemplate;
            case 'cosmicreceipt': return CosmicReceiptTemplate;
            case 'geometricedge': return GeometricEdgeTemplate;
            case 'cleandatasheet': return CleanDataSheetTemplate;
            case 'neogeometric': return NeoGeometricTemplate;
            case 'pillarPro': return PillarProTemplate;
            case 'matrixLedger': return MatrixLedgerTemplate;
            case 'professionalblue': return ProfessionalBlueTemplate;
            case 'minimalistmonochrome': return MinimalistMonochromeTemplate;
            case 'modernstacked': return ModernStackedTemplate;
            case 'rusticelegance': return RusticEleganceTemplate;
            default: return ModernTemplate;
        }
    };

    // Handle print invoice
    const handlePrint = (mode = 'standard') => {
        try {
            // Remove previous print stylesheet
            const old = document.getElementById("app-print-stylesheet");
            if (old) old.remove();

            document.body.classList.remove("print-mode-mini", "print-mode-standard");

            const cls = mode === "mini" ? "print-mode-mini" : "print-mode-standard";
            document.body.classList.add(cls);

            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.id = "app-print-stylesheet";
            link.href = mode === "mini" ? "/print-mini.css" : "/print-a4.css";
            document.head.appendChild(link);

            const cleanup = () => {
                setTimeout(() => {
                    const l = document.getElementById("app-print-stylesheet");
                    if (l) l.remove();
                    document.body.classList.remove("print-mode-mini", "print-mode-standard");
                    window.onafterprint = null;
                }, 200);
            };

            window.onafterprint = cleanup;
            window.print();
            setTimeout(cleanup, 8000);
            setShowPrintMenu(false);
        } catch (e) {
            alert("Printing failed.");
        }
    };

    // Handle download PDF
    const handleDownloadPDF = async () => {
        const invoice = document.getElementById("invoice-area");
        if (!invoice) {
            alert("Invoice not found!");
            return;
        }

        try {
            const canvas = await html2canvas(invoice, {
                scale: 3,
                useCORS: true,
                allowTaint: true,
            });

            const imgData = canvas.toDataURL("image/jpeg", 0.7);
            const pdf = new jsPDF("p", "mm", "a4");

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`invoice-${invoiceData?.invoiceNumber || invoiceId}.pdf`);
        } catch (error) {
            alert('Failed to download PDF. Please try again.');
        }
    };

    // Auto-print when print query parameter is present
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const shouldPrint = urlParams.get('print') === 'true';

        if (shouldPrint && !fetching && invoiceData) {
            // Small delay to ensure page is fully loaded
            setTimeout(() => {
                window.print();
            }, 500);
        }
    }, [fetching, invoiceData]);

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
                <AnimatedBackground variant="default" />
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
                            {/* Back Button */}
                            <div className="mb-4 no-print">
                                <Link href="/dashboard/invoices" className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors">
                                    <ArrowLeft className="w-4 h-4" />
                                    <span className="text-sm font-medium">Back to Invoices</span>
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
                                                {invoiceData && React.createElement(getTemplateComponent(), {
                                                    invoiceData,
                                                    selectedStore
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Sidebar - Compact Design */}
                                    <div className="flex flex-col h-full no-print right-sidebar">
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
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-[rgb(var(--color-text-secondary))]">GST:</span>
                                                            <span className="font-medium text-[rgb(var(--color-text-primary))]">
                                                                ₹{invoiceData.gstAmount?.toLocaleString() || '0'}
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
                                                <div className="mt-auto space-y-3 no-print action-buttons">
                                                    {/* Print, Preview, Download Buttons */}
                                                    <div className="space-y-2">
                                                        {/* Download PDF and Print Options - Side by Side */}
                                                        <div className="flex gap-2">
                                                            {/* Download PDF Button */}
                                                            <Button
                                                                onClick={handleDownloadPDF}
                                                                variant="outline"
                                                                className="flex-1 flex items-center justify-center gap-2 h-10 text-sm font-medium"
                                                            >
                                                                <Download className="w-4 h-4" />
                                                                <span>Download PDF</span>
                                                            </Button>

                                                            {/* Print Options Button */}
                                                            <div className="relative print-menu-container flex-1">
                                                                <Button
                                                                    onClick={() => setShowPrintMenu(!showPrintMenu)}
                                                                    variant="primary"
                                                                    className="w-full flex items-center justify-center gap-2 h-10 text-sm font-medium"
                                                                >
                                                                    <Printer className="w-4 h-4" />
                                                                    <span>Print</span>
                                                                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showPrintMenu ? 'rotate-180' : ''}`} />
                                                                </Button>

                                                                {/* Print Menu Dropdown */}
                                                                {showPrintMenu && (
                                                                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] rounded-lg shadow-lg z-50 overflow-hidden print-menu-container">
                                                                        <button
                                                                            onClick={() => handlePrint('standard')}
                                                                            className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[rgb(var(--color-bg-secondary))] transition-colors"
                                                                        >
                                                                            <BookOpen className="w-4 h-4" />
                                                                            <span className="text-sm">Standard (A4 / Letter)</span>
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handlePrint('mini')}
                                                                            className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[rgb(var(--color-bg-secondary))] transition-colors border-t border-[rgb(var(--color-border-primary))]"
                                                                        >
                                                                            <Receipt className="w-4 h-4" />
                                                                            <span className="text-sm">Mini / Thermal Printer</span>
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Template Settings Button */}
                                                        <Button
                                                            onClick={() => router.push('/dashboard/invoices/print-preview')}
                                                            variant="outline"
                                                            className="w-full flex items-center justify-center gap-2 h-10 text-sm font-medium"
                                                        >
                                                            <Settings className="w-4 h-4" />
                                                            <span>Template Settings</span>
                                                        </Button>
                                                    </div>

                                                    {/* Status-specific buttons */}
                                                    {invoiceData?.invoiceStatus === 'DRAFT' ? (
                                                        <div className="flex gap-2">
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
                                                        </div>
                                                    ) : (
                                                        <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg border border-[rgb(var(--color-border-primary))] p-4">
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

                {/* Error Modal */}
                {showErrorModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
                        <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 max-w-md w-full mx-4 border border-[rgb(var(--color-border-primary))]">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-10 h-10 bg-[rgb(var(--color-danger))]/10 rounded-full flex items-center justify-center">
                                    <XCircle className="w-5 h-5 text-[rgb(var(--color-danger))]" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Error</h3>
                                    <p className="text-sm text-[rgb(var(--color-text-secondary))]">Something went wrong</p>
                                </div>
                            </div>
                            <p className="text-[rgb(var(--color-text-primary))] mb-6">
                                {errorMessage}
                            </p>
                            <div className="flex space-x-3">
                                <Button
                                    onClick={() => setShowErrorModal(false)}
                                    className="flex-1"
                                >
                                    OK
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default ViewInvoicePage;
