"use client";
import { ConfiguredInvoiceTemplate } from "@dragorbit/features/invoices";
import { memo, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchSignatures } from "@/store/slices/signaturesSlice";

const InvoicePageLayout = ({
  invoiceData,
  selectedTemplate,
  selectedStore,
  itemsWithGst,
  calculatedSubtotal,
  calculatedGstAmount,
}) => {
  const dispatch = useAppDispatch();
  const agency = useAppSelector((state) => state.profile.agency);
  const signatures = useAppSelector((state) => state.signatures);

  const agencyId = agency?.agencyId || agency?._id || selectedStore?.agency;

  useEffect(() => {
    if (
      agencyId &&
      !signatures.items.length &&
      !signatures.loading &&
      !signatures.lastFetched &&
      !signatures.error
    ) {
      dispatch(fetchSignatures({ agencyId, lightweight: true }));
    }
  }, [
    agencyId,
    dispatch,
    signatures.items.length,
    signatures.loading,
    signatures.lastFetched,
    signatures.error,
  ]);

  const templateInvoiceData = useMemo(() => {
    if (!invoiceData) return null;
    return {
      ...invoiceData,
      items:
        itemsWithGst && itemsWithGst.length > 0
          ? itemsWithGst
          : invoiceData.items,
      subtotal:
        calculatedSubtotal > 0 ? calculatedSubtotal : invoiceData.subtotal,
      gstAmount:
        calculatedGstAmount > 0 ? calculatedGstAmount : invoiceData.gstAmount,
    };
  }, [invoiceData, itemsWithGst, calculatedSubtotal, calculatedGstAmount]);

  return (
    <div
      id="invoice-area"
      className="fixed -left-[99999px] top-0 pointer-events-none -z-50 opacity-0 print:static print:opacity-100 print:pointer-events-auto print:z-auto print:block w-[794px] max-w-[210mm]"
      data-variant="light"
      data-theme="default"
    >
      <ConfiguredInvoiceTemplate
        templateKey={selectedTemplate}
        invoiceData={templateInvoiceData}
        selectedStore={selectedStore}
        signatures={signatures.items}
        signatureSettingsUrl="/dashboard/utilities/signatures"
        fitPreview={false}
      />
    </div>
  );
};

export default memo(InvoicePageLayout);
