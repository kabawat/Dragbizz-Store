"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Printer, Download, Eye } from 'lucide-react';
import moment from 'moment';

// Import components
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { Button, AnimatedBackground } from '@/components/ui';
import { invoiceService } from '@/service';
import { useAppSelector } from '@/store/hooks';

// Import templates
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
    AuraTemplate,
    LumosTemplate,
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
import TemplateSelector from '@/components/invoice/TemplateSelector';

const PrintPreviewPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { selectedStore } = useAppSelector((state) => state.profile);
    const storeId = selectedStore?.storeId;

    const invoiceId = searchParams.get('id');

    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState(null);
    const [invoiceData, setInvoiceData] = useState(null);
    const [selectedTemplate, setSelectedTemplate] = useState('modern');
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const hasFetched = useRef(false);

    // Helper function to show error in popup
    const showError = (message) => {
        setErrorMessage(message);
        setShowErrorModal(true);
    };

    // Fetch invoice data on component mount
    useEffect(() => {
        const fetchInvoiceData = async () => {
            if (hasFetched.current || !invoiceId) {
                console.log('Skipping fetch:', { hasFetched: hasFetched.current, invoiceId, storeId });
                return;
            }
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
                console.error('Error fetching invoice:', error);
                showError('Failed to fetch invoice data. Please try again.');
            } finally {
                setFetching(false);
            }
        };

        fetchInvoiceData();
    }, [invoiceId, storeId]);

    // Handle template change
    const handleTemplateChange = (template) => {
        setSelectedTemplate(template);
        // Save template preference to localStorage
        localStorage.setItem('invoice-template', template);
    };

    // Handle print
   const handlePrint = (mode = 'standard') => {
        try {
            // remove previous
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
        } catch (e) {
            console.error(e);
            alert("Printing failed.");
        }
    };

    // Handle download PDF 
    const handleDownloadPDF = () => {
        alert('PDF download feature coming soon!');
    };

    // Get template component
    const getTemplateComponent = () => {
        switch (selectedTemplate) {
            case 'classic':
                return ClassicTemplate;
            case 'modern':
                return ModernTemplate;
            case 'minimal':
                return MinimalTemplate;
            case 'professional':
                return ProfessionalTemplate;
            case 'elegant':
                return ElegantTemplate;
            case 'vintage':
                return VintageTemplate;
            case 'aero':
                return AeroTemplate;
            case 'crystal':
                return CrystalTemplate;
            case 'structed':
                return StructedTemplate;
            case 'aether':
                return AetherTemplate;
            case 'aurora':
                return AuroraTemplate;
            case 'celeste':
                return CelesteTemplate;
            case 'eclipse':
                return EclipseTemplate;
            case 'apex':
                return ApexTemplate;
            case 'zentith':
                return ZenithTemplate;
            case 'terra':
                return TerraTemplate;
            case 'lumos':
                return LumosTemplate;
            case 'aura':
                return AuraTemplate;
            case 'fusion':
                return FusionTemplate;
            case 'orion':
                return OrionTemplate;
            case 'spectrum':
                return SpectrumTemplate;
            case 'PrismTemplate':
                return PrismTemplate;
            case 'flexview':
                return FlexviewTemplate;
            case 'elitepaper':
                return ElitePaperTemplate;
            case 'neoedge':
                return NeoEdgeTemplate;
            case 'luminousledger':
                return LuminousLedgerTemplate;
            case 'aurum':
                return AurumTemplate;
            case 'velocityledger':
                return VelocityLedgerTemplate;
            case 'sleekstream':
                return SleekStreamTemplate;
            case 'royaledge':
                return RoyalEdgeTemplate;
            case 'cosmicreceipt':
                return CosmicReceiptTemplate;
            case 'geometricedge':
                return GeometricEdgeTemplate;
            case 'cleandatasheet':
                return CleanDataSheetTemplate;
            case 'neogeometric':
                return NeoGeometricTemplate;
            case 'pillarPro':
                return PillarProTemplate;  
            case 'matrixLedger':
                return MatrixLedgerTemplate;
            case 'professionalblue':
                return ProfessionalBlueTemplate;
            case 'minimalistmonochrome':
                return MinimalistMonochromeTemplate;
            case 'modernstacked':
                return ModernStackedTemplate;
            case 'rusticelegance':
                return RusticEleganceTemplate;

            default:
                return ModernTemplate;
        }
    };

    // Load saved template preference
    useEffect(() => {
        const savedTemplate = localStorage.getItem('invoice-template');
        if (savedTemplate) {
            setSelectedTemplate(savedTemplate);
        }
    }, []);

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
                        title="Print Preview"
                        description="Preview and print your invoice"
                    />
                    <div className="flex-1 p-6 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !invoiceData) {
        return (
            <div className="flex h-screen relative w-full overflow-hidden">
                <AnimatedBackground variant="default" />
                <Sidebar />
                <div className="min-h-screen w-full flex flex-col">
                    <Header
                        title="Print Preview"
                        description="Preview and print your invoice"
                    />
                    <div className="flex-1 p-6 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Eye className="w-8 h-8 text-red-600" />
                            </div>
                            <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                                Error Loading Invoice
                            </h2>
                            <p className="text-[rgb(var(--color-text-secondary))] mb-6">
                                {error || 'Invoice not found'}
                            </p>
                            <div className="flex gap-3 justify-center">
                                <Button variant="outline" onClick={() => window.location.reload()}>
                                    Retry
                                </Button>
                                <Button variant="primary" onClick={() => router.push('/dashboard/invoices')}>
                                    Back to Invoices
                                </Button>
                            </div>
                        </div>
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
                    .right-sidebar,
                    .template-selector {
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
                    
                    /* Preview container */
                    .preview-container {
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
                        <Header
                            title="Print Preview"
                            description="Preview and print your invoice"
                        />
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 p-6">
                        <div className="max-w-8xl mx-auto w-full">
                            {/* Back Button */}
                            <div className="mb-4 no-print">
                                <button
                                    onClick={() => router.push(`/dashboard/invoices/view/${invoiceId}`)}
                                    className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    <span className="text-sm font-medium">Back to Invoice</span>
                                </button>
                            </div>

                            {/* Print Preview Layout */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ height: 'calc(100vh - 150px)' }}>

                                {/* Left Side - Print Preview */}
                                <div className="lg:col-span-2 flex flex-col h-full">
                                    <div className="flex-1 overflow-y-auto pe-3 max-h-[calc(100vh-150px)]">

                                        {/* Invoice Preview */}
                                        <div id="invoice-area"  className="bg-white rounded-lg shadow-sm preview-container">
                                            {React.createElement(getTemplateComponent(), {
                                                invoiceData,
                                                selectedStore
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side - Template Selector */}
                                <div className="flex flex-col h-full">
                                    <div className="flex-1 overflow-y-auto ps-3 max-h-[calc(100vh-204px)]">
                                        <div className="space-y-4">
                                            {/* Template Selector */}
                                            <div className="template-selector">
                                                <TemplateSelector
                                                    selectedTemplate={selectedTemplate}
                                                    onTemplateChange={handleTemplateChange}
                                                    onPreview={() => { }}
                                                    onPrint={handlePrint}
                                                />
                                            </div>

                                            {/* Print Instructions */}
                                            <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg border border-[rgb(var(--color-border-primary))] p-4">
                                                <h4 className="text-sm font-semibold text-[rgb(var(--color-text-primary))] mb-3">
                                                    Print Instructions
                                                </h4>
                                                <div className="space-y-2 text-xs text-[rgb(var(--color-text-secondary))]">
                                                    <p>• Select your preferred template from the options above</p>
                                                    <p>• Preview will update automatically</p>
                                                    <p>• Click "Print Invoice" to open print dialog</p>
                                                    <p>• Ensure your printer has A4 paper loaded</p>
                                                    <p>• For best results, use "Print to PDF" option</p>
                                                </div>
                                            </div>

                                            {/* Invoice Summary */}
                                            <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg border border-[rgb(var(--color-border-primary))] p-4">
                                                <h4 className="text-sm font-semibold text-[rgb(var(--color-text-primary))] mb-3">
                                                    Invoice Summary
                                                </h4>
                                                <div className="space-y-2 text-xs">
                                                    <div className="flex justify-between">
                                                        <span className="text-[rgb(var(--color-text-secondary))]">Customer:</span>
                                                        <span className="text-[rgb(var(--color-text-primary))]">
                                                            {invoiceData.customer?.name || 'Walk-in Customer'}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-[rgb(var(--color-text-secondary))]">Items:</span>
                                                        <span className="text-[rgb(var(--color-text-primary))]">
                                                            {invoiceData.items?.length || 0}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-[rgb(var(--color-text-secondary))]">Total:</span>
                                                        <span className="text-[rgb(var(--color-text-primary))] font-semibold">
                                                            ₹{invoiceData.totalAmount?.toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Modal */}
            {showErrorModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
                    <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 max-w-md w-full mx-4 border border-[rgb(var(--color-border-primary))]">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-[rgb(var(--color-danger))]/10 rounded-full flex items-center justify-center">
                                <Eye className="w-5 h-5 text-[rgb(var(--color-danger))]" />
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
        </>
    );
};

export default PrintPreviewPage;
