"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Printer, X } from "lucide-react";
import useApiResponse from "@/hooks/useApiResponse";
import { useInvoicePrint } from "@/hooks/print/invoice/useInvoicePrint";
import { useMiniInvoicePrint } from "@/hooks/print/invoice/useMiniInvoicePrint";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useGlobalToast } from "@/contexts/ToastContext";
import { invoiceService } from "@/service";
import { useAppSelector } from "@/store/hooks";
import {
  calculateGstAmount,
  calculateSubtotal,
  getItemsWithGst,
} from "@/utils/invoice/invoiceCalculations.utils";
import { getTemplateComponent } from "@/utils/invoice/invoiceView.utils";
import { pickStoreId } from "@/utils/store.util";

const PosInvoicePrintModal = ({ open, invoiceId, onClose }) => {
  const { t } = useTranslation();
  const { showError } = useGlobalToast();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = pickStoreId(selectedStore);
  const { execute, loading: fetching } = useApiResponse();

  const [invoiceData, setInvoiceData] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [loadError, setLoadError] = useState(false);
  const hasFetched = useRef(false);

  const isMiniTemplate = selectedTemplate?.startsWith("thermal");
  const standardPrint = useInvoicePrint(fetching, invoiceData, true);
  const miniPrint = useMiniInvoicePrint(fetching, invoiceData, true);
  const { handlePrint, handleDownloadPDF } = isMiniTemplate ? miniPrint : standardPrint;

  useEffect(() => {
    const savedTemplate = localStorage.getItem("invoice-template");
    if (savedTemplate) setSelectedTemplate(savedTemplate);
  }, []);

  useEffect(() => {
    if (!open) {
      setInvoiceData(null);
      setLoadError(false);
      hasFetched.current = false;
      return;
    }
    if (!invoiceId || !storeId || hasFetched.current) return;

    hasFetched.current = true;
    (async () => {
      const result = await execute(
        invoiceService.getInvoices({ id: invoiceId, store: storeId }),
        { showToast: false }
      );
      if (!result?.success || !result.data) {
        setLoadError(true);
        showError(result?.message || t("invoice.collectPayment.loadError"));
        return;
      }
      setInvoiceData(result.data);
    })();
  }, [open, invoiceId, storeId, execute, showError, t]);

  const calculatedGstAmount = invoiceData ? calculateGstAmount(invoiceData) : 0;
  const itemsWithGst = invoiceData ? getItemsWithGst(invoiceData) : [];
  const calculatedSubtotal = invoiceData
    ? calculateSubtotal(invoiceData, calculatedGstAmount, itemsWithGst)
    : 0;

  const handleDone = useCallback(() => {
    onClose?.();
  }, [onClose]);

  if (!open || !invoiceId) return null;

  const Template = getTemplateComponent(selectedTemplate);
  const showPreview = Boolean(invoiceData) && !fetching && !loadError;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-[2px] no-print"
        onClick={handleDone}
        aria-hidden
      />
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-[rgb(var(--color-bg-primary))] rounded-2xl border border-[rgb(var(--color-border-primary))] shadow-[0_20px_60px_rgba(0,0,0,0.22)] overflow-hidden">
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

        <div className="flex-1 min-h-0 overflow-y-auto p-4 bg-[rgb(var(--color-bg-secondary))]">
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

          {showPreview && (
            <div id="invoice-area" className="bg-white rounded-lg mx-auto max-w-[210mm]">
              <Template
                invoiceData={{
                  ...invoiceData,
                  items: itemsWithGst.length > 0 ? itemsWithGst : invoiceData.items,
                  subtotal:
                    calculatedSubtotal > 0 ? calculatedSubtotal : invoiceData.subtotal,
                  gstAmount:
                    calculatedGstAmount > 0
                      ? calculatedGstAmount
                      : invoiceData.gstAmount,
                }}
                selectedStore={selectedStore}
              />
            </div>
          )}
        </div>

        {showPreview && (
          <div className="no-print flex flex-wrap items-center justify-end gap-2 px-5 py-4 border-t border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))]">
            <button
              type="button"
              onClick={() => handleDownloadPDF(invoiceData, invoiceId)}
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
    </div>
  );
};

export default PosInvoicePrintModal;
