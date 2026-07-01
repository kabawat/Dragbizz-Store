"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { InvoiceSummaryCard, InvoiceActionButtons } from "@/components/invoice";
import { getTemplateComponent } from "@/utils/invoice/invoiceView.utils";

const InvoicePageLayout = ({
    invoiceData,
    selectedTemplate,
    selectedStore,
    itemsWithGst,
    calculatedSubtotal,
    calculatedGstAmount,
    onEdit,
    onUpdatePaymentStatus,
    onPrint,
}) => {
    const router = useRouter();

    if (!invoiceData) return null;

    const handleRelease = () => {
        if (!invoiceData.id) return;
        router.push(`/dashboard/collect-payment/${invoiceData.id}?source=release`);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ height: "calc(100vh - 150px)" }}>
            <div className="lg:col-span-2 flex flex-col h-full">
                <div className="flex-1 overflow-y-auto pe-3 print:pe-0 max-h-[calc(100vh-150px)]">
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
                            onRelease={handleRelease}
                            onUpdatePaymentStatus={onUpdatePaymentStatus}
                            onPrint={onPrint}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoicePageLayout;
