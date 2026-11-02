import { printInvoice, saveInvoicePDF } from "@dragorbit/features/invoices";
import { useCallback, useState } from "react";
import { useGlobalToast } from "@/contexts/ToastContext";

export const useInvoicePrint = (
  _fetching,
  _invoiceData,
  _skipAutoPrint = false,
  options = {}
) => {
  const { showError } = useGlobalToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const handlePrint = useCallback(
    (printOptions = {}) => {
      try {
        const target =
          printOptions?.targetElement ||
          document.getElementById("invoice-container") ||
          document.getElementById("invoice-area");

        const inv = printOptions?.invoiceData || _invoiceData;
        const invNo = inv?.invoiceNumber || inv?.number || inv?.invoiceNo;

        printInvoice({
          targetElement: target,
          isThermal: Boolean(options?.isThermal || printOptions?.isThermal),
          paperSize: options?.paperSize || printOptions?.paperSize || "A4",
          title: invNo ? `Invoice #${invNo}` : "Invoice",
        });
      } catch (_e) {
        try {
          window.print();
        } catch {
          showError("Printing failed.");
        }
      }
    },
    [_invoiceData, options, showError]
  );

  const handleDownloadPDF = useCallback(
    async (invoiceData, invoiceId, downloadOptions = {}) => {
      const data = invoiceData || _invoiceData;
      if (!data) {
        showError("Invoice not found!");
        return;
      }

      setIsDownloading(true);
      try {
        const templateKey =
          downloadOptions?.selectedTemplate ||
          downloadOptions?.templateKey ||
          options?.selectedTemplate ||
          options?.templateKey ||
          "modern";

        const selectedStore =
          downloadOptions?.selectedStore || options?.selectedStore || null;

        const signatures =
          downloadOptions?.signatures || options?.signatures || [];

        const paperSize =
          downloadOptions?.paperSize || options?.paperSize || "A4";

        await saveInvoicePDF({
          invoiceData: data,
          templateKey,
          selectedStore,
          signatures,
          paperSize,
          fileName: `invoice-${data?.invoiceNumber || invoiceId || "document"}.pdf`,
        });
      } catch (error) {
        console.error("PDF download failed:", error);
        showError("Failed to download PDF. Please try again.");
      } finally {
        setIsDownloading(false);
      }
    },
    [_invoiceData, options, showError]
  );

  return { handlePrint, handleDownloadPDF, isDownloading };
};
