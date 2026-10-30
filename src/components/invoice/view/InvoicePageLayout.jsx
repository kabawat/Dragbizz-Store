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

  if (!invoiceData || !templateInvoiceData) return null;

  return (
    <div className="min-w-0 lg:h-[calc(100vh-150px)]">
      <div className="min-w-0 lg:h-full lg:overflow-hidden">
        <div
          id="invoice-area"
          className="min-w-0 overflow-x-hidden rounded-lg bg-white lg:h-full"
        >
          <ConfiguredInvoiceTemplate
            templateKey={selectedTemplate}
            invoiceData={templateInvoiceData}
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

export default memo(InvoicePageLayout);
