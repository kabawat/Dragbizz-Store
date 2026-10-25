"use client";
import React from "react";
import { getTemplateComponent } from "@/utils/invoice/invoiceView.utils";

const InvoicePageLayout = ({
    invoiceData,
    selectedTemplate,
    selectedStore,
    itemsWithGst,
    calculatedSubtotal,
    calculatedGstAmount,
}) => {
    if (!invoiceData) return null;

    return (
        <div className="min-w-0 lg:h-[calc(100vh-150px)]">
            <div className="min-w-0 lg:h-full lg:overflow-x-hidden lg:overflow-y-auto">
        <div id="invoice-area" className="min-w-0 overflow-x-hidden rounded-lg bg-white">
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
    );
};

export default InvoicePageLayout;
