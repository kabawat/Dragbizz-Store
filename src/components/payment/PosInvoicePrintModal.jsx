"use client";

import { ConfiguredInvoiceTemplate } from "@dragorbit/features/invoices";
import { DocumentPreview, Modal } from "@dragorbit/ui";
import { Loader2, Printer, X } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useInvoicePrint } from "@/hooks/print/invoice/useInvoicePrint";
import { useMiniInvoicePrint } from "@/hooks/print/invoice/useMiniInvoicePrint";
import { useTranslation } from "@/hooks/ui/useTranslation";
import useApiResponse from "@/hooks/useApiResponse";
import { invoiceService } from "@/service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchSignatures } from "@/store/slices/signaturesSlice";
import {
  calculateGstAmount,
  calculateSubtotal,
  getItemsWithGst,
} from "@/utils/invoice/invoiceCalculations.utils";
import { pickStoreId } from "@/utils/store.util";

const PosInvoicePrintModal = ({ open, invoiceId, onClose }) => {
  const { t } = useTranslation();
  const { showError } = useGlobalToast();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const agency = useAppSelector((state) => state.profile.agency);
  const signaturesItems = useAppSelector((state) => state.signatures.items);
  const signaturesLoading = useAppSelector((state) => state.signatures.loading);
  const signaturesLastFetched = useAppSelector(
    (state) => state.signatures.lastFetched
  );
  const signaturesError = useAppSelector((state) => state.signatures.error);
  const dispatch = useAppDispatch();
  const storeId = useMemo(() => pickStoreId(selectedStore), [selectedStore]);
  const agencyId = agency?.agencyId || agency?._id || selectedStore?.agency;
  const { execute, loading: fetching } = useApiResponse();

  const [invoiceData, setInvoiceData] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [loadError, setLoadError] = useState(false);
  const requestVersion = useRef(0);
  const services = useRef({ execute, showError, t });
  services.current = { execute, showError, t };

  const isMiniTemplate = selectedTemplate?.startsWith("thermal");
  const standardPrint = useInvoicePrint(fetching, invoiceData, true);
  const miniPrint = useMiniInvoicePrint(fetching, invoiceData, true);
  const { handlePrint, handleDownloadPDF } = isMiniTemplate
    ? miniPrint
    : standardPrint;

  useEffect(() => {
    try {
      const savedTemplate = localStorage.getItem("invoice-template");
      if (savedTemplate) setSelectedTemplate(savedTemplate);
    } catch {
      // Storage unavailable
    }
  }, []);

  useEffect(() => {
    if (
      open &&
      agencyId &&
      !signaturesItems.length &&
      !signaturesLoading &&
      !signaturesLastFetched &&
      !signaturesError
    ) {
      dispatch(fetchSignatures({ agencyId, lightweight: true }));
    }
  }, [
    open,
    agencyId,
    dispatch,
    signaturesItems.length,
    signaturesLoading,
    signaturesLastFetched,
    signaturesError,
  ]);

  useEffect(() => {
    if (!open) {
      setInvoiceData(null);
      setLoadError(false);

      return;
    }
    if (!invoiceId || !storeId) return;
    const { execute, showError, t } = services.current;
    const version = ++requestVersion.current;
    setInvoiceData(null);
    setLoadError(false);
    (async () => {
      const result = await execute(
        invoiceService.getInvoices({ id: invoiceId, store: storeId }),
        { showToast: false }
      );
      if (version !== requestVersion.current) return;
      if (!result?.success || !result.data) {
        setLoadError(true);
        showError(result?.message || t("invoice.collectPayment.loadError"));
        return;
      }
      setInvoiceData(result.data);
    })();
    return () => {
      requestVersion.current++;
    };
  }, [open, invoiceId, storeId]);

  const templateInvoiceData = useMemo(() => {
    if (!invoiceData) return null;
    const gst = calculateGstAmount(invoiceData);
    const items = getItemsWithGst(invoiceData);
    const subtotal = calculateSubtotal(invoiceData, gst, items);
    return {
      ...invoiceData,
      items: items.length > 0 ? items : invoiceData.items,
      subtotal: subtotal > 0 ? subtotal : invoiceData.subtotal,
      gstAmount: gst > 0 ? gst : invoiceData.gstAmount,
    };
  }, [invoiceData]);

  const handleDone = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const handleDownload = useCallback(() => {
    handleDownloadPDF(invoiceData, invoiceId);
  }, [handleDownloadPDF, invoiceData, invoiceId]);

  if (!open || !invoiceId) return null;

  const showPreview = Boolean(invoiceData) && !fetching && !loadError;

  return (
    <Modal
      isOpen={open}
      onClose={handleDone}
      ariaLabel={t("invoice.collectPayment.printReadyTitle")}
      overlayClassName="pos-invoice-print-modal"
      className="w-full max-w-4xl shadow-none!"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[rgb(var(--color-bg-primary))] rounded-2xl border border-[rgb(var(--color-border-primary))] overflow-hidden">
        <div className="no-print flex items-start justify-between gap-3 px-5 py-4 border-b border-[rgb(var(--color-border-primary))]">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
              {t("invoice.collectPayment.printReadyTitle")}
            </h2>
            <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-0.5">
              {invoiceData?.invoiceNumber
                ? `${t("invoice.collectPayment.invoice")}: ${invoiceData.invoiceNumber}`
                : t("invoice.collectPayment.printReadySubtitle")}
            </p>
          </div>
          <button
            type="button"
            onClick={handleDone}
            className="p-2 rounded-lg text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-secondary))]"
            aria-label={t("common.close")}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="pos-invoice-preview-scroll flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-2 sm:p-4 bg-[rgb(var(--color-bg-secondary))]">
          {(fetching || (!invoiceData && !loadError)) && (
            <div className="no-print flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[rgb(var(--color-primary))]" />
              <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                {t("invoice.collectPayment.preparing")}
              </p>
            </div>
          )}

          {loadError && (
            <div className="no-print text-center py-12">
              <p className="text-[rgb(var(--color-text-secondary))] mb-4">
                {t("invoice.collectPayment.loadError")}
              </p>
              <button
                type="button"
                onClick={handleDone}
                className="text-sm text-[rgb(var(--color-primary))] underline"
              >
                {t("common.close")}
              </button>
            </div>
          )}

          {showPreview && templateInvoiceData && (
            <DocumentPreview>
              <div id="invoice-area" className="bg-white">
                <ConfiguredInvoiceTemplate
                  templateKey={selectedTemplate}
                  invoiceData={templateInvoiceData}
                  selectedStore={selectedStore}
                  signatures={signaturesItems}
                  signatureSettingsUrl="/dashboard/utilities/signatures"
                  fitPreview
                />
              </div>
            </DocumentPreview>
          )}
        </div>

        {showPreview && (
          <div className="no-print flex flex-wrap items-center justify-end gap-2 px-5 py-4 border-t border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))]">
            <button
              type="button"
              onClick={handleDownload}
              className="px-4 py-2.5 rounded-xl text-sm font-medium border border-[rgb(var(--color-border-primary))] text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))]"
            >
              {t("invoice.downloadPDF") || "Download PDF"}
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[rgb(var(--color-primary))] text-white hover:opacity-90"
            >
              <Printer className="w-4 h-4" />
              {t("invoice.printInvoice")}
            </button>
            <button
              type="button"
              onClick={handleDone}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-[rgb(var(--color-border-primary))] text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))]"
            >
              {t("invoice.collectPayment.newSale")}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default memo(PosInvoicePrintModal);
