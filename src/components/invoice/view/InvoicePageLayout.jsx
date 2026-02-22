"use client";
import React, { useState } from "react";
import { InvoiceSummaryCard, InvoiceActionButtons, ReleaseInvoiceModal } from "@/components/invoice";
import { getTemplateComponent } from "@/utils/invoice/invoiceView.utils";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";

const InvoicePageLayout = ({
    invoiceData,
    fetchInvoiceData,
    selectedTemplate,
    selectedStore,
    itemsWithGst,
    calculatedSubtotal,
    calculatedGstAmount,
    onEdit,
    onUpdatePaymentStatus,
    onPrint,
}) => {
    const { t } = useTranslation();
    const { showSuccess } = useGlobalToast();
    const [showReleaseModal, setShowReleaseModal] = useState(false);

    useCommonHotkeys({
        onClose: () => {
            if (showReleaseModal) setShowReleaseModal(false);
        }
    });

    if (!invoiceData) return null;

    return (
        <div
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            style={{ height: "calc(100vh - 150px)" }}
        >
            {/* Left Column - Invoice Format */}
            <div className="lg:col-span-2 flex flex-col h-full">
                <div className="flex-1 overflow-y-auto pe-3 max-h-[calc(100vh-150px)]">
                    <div id="invoice-area" className="bg-white rounded-lg">
                        {React.createElement(getTemplateComponent(selectedTemplate), {
                            invoiceData: {
                                ...invoiceData,
                                items: itemsWithGst.length > 0 ? itemsWithGst : invoiceData.items,
                                subtotal: calculatedSubtotal > 0 ? calculatedSubtotal : invoiceData.subtotal,
                                gstAmount: calculatedGstAmount > 0 ? calculatedGstAmount : invoiceData.gstAmount,
                            },
                            selectedStore,
                        })}
                    </div>
                </div>
            </div>

            {/* Right Sidebar */}
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
                            onEdit={onEdit}
                            onRelease={() => setShowReleaseModal(true)}
                            onUpdatePaymentStatus={onUpdatePaymentStatus}
                            onPrint={onPrint}
                        />
                    </div>
                </div>
            </div>

            {/* Local Modals */}
            {showReleaseModal && (
                <ReleaseInvoiceModal
                    onClose={() => setShowReleaseModal(false)}
                    onSuccess={() => {
                        showSuccess(t("invoice.releasedSuccessfully"));
                        fetchInvoiceData();
                        setShowReleaseModal(false);
                    }}
                    invoice={invoiceData}
                />
            )}
        </div>
    );
};

export default InvoicePageLayout;
