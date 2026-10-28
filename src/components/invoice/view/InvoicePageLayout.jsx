"use client";
import { useEffect } from "react";
import { ConfiguredInvoiceTemplate } from "@dragorbit/features/invoices";
import { fetchSignatures } from "@/store/slices/signaturesSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const InvoicePageLayout = ({
    invoiceData,
    selectedTemplate,
    selectedStore,
    itemsWithGst,
    calculatedSubtotal,
    calculatedGstAmount,
}) => {
    const dispatch = useAppDispatch();
    const { agency, signatures } = useAppSelector((state) => ({ agency: state.profile.agency, signatures: state.signatures }));
    const agencyId = agency?.agencyId || agency?._id || selectedStore?.agencyId || selectedStore?.agency?.agencyId || selectedStore?.agency?._id || selectedStore?.agency;
    useEffect(() => {
        if (agencyId && !signatures.items.length && !signatures.loading && !signatures.lastFetched && !signatures.error) {
            dispatch(fetchSignatures({ agencyId, lightweight: true }));
        }
    }, [agencyId, dispatch, signatures.items.length, signatures.loading, signatures.lastFetched, signatures.error]);
    if (!invoiceData) return null;

    return (
        <div className="min-w-0 lg:h-[calc(100vh-150px)]">
            <div className="min-w-0 lg:h-full lg:overflow-hidden">
        <div id="invoice-area" className="min-w-0 overflow-x-hidden rounded-lg bg-white lg:h-full">
          <ConfiguredInvoiceTemplate
            templateKey={selectedTemplate}
            invoiceData={{
              ...invoiceData,
              items: itemsWithGst.length > 0 ? itemsWithGst : invoiceData.items,
              subtotal: calculatedSubtotal > 0 ? calculatedSubtotal : invoiceData.subtotal,
              gstAmount: calculatedGstAmount > 0 ? calculatedGstAmount : invoiceData.gstAmount,
            }}
            selectedStore={selectedStore}
            signatures={signatures.items}
            signatureSettingsUrl="/dashboard/utilities/signatures"
            fitPreview
          />
        </div>
            </div>
        </div>
    );
};

export default InvoicePageLayout;
