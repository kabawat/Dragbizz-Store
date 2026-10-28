import { prepareInvoiceCapture } from "./prepareInvoiceCapture";
import { useGlobalToast } from "@/contexts/ToastContext";

export const useInvoicePrint = (
  _fetching,
  _invoiceData,
  _skipAutoPrint = false
) => {
  const { showError } = useGlobalToast();

  const handlePrint = () => {
    try {
      window.print();
    } catch (_e) {
      showError("Printing failed.");
    }
  };

  const handleDownloadPDF = async (invoiceData, invoiceId) => {
    const invoice = document.getElementById("invoice-container");
    if (!invoice) {
      showError("Invoice not found!");
      return;
    }

    try {
      const { default: html2canvas } = await import("html2canvas");
      const { default: jsPDF } = await import("jspdf");

      const paperSize = invoice.closest(".invoice-print-document")?.dataset.paperSize || "A4";
      const pageWidthPx = invoice.offsetWidth || 794;
      const canvas = await html2canvas(invoice, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        onclone: prepareInvoiceCapture,
        width: pageWidthPx,
        height: invoice.scrollHeight,
        windowWidth: pageWidthPx,
        windowHeight: invoice.scrollHeight,
      });

      const pdf = new jsPDF({ orientation: "p", unit: "mm", format: paperSize.toLowerCase() });
      const padding = 0;
      const contentWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const pixelsPerPage = Math.floor(
        (pageHeight * canvas.width) / contentWidth
      );
      // Slice long invoices across pages instead of clipping a single tall image.
      for (let top = 0; top < canvas.height; top += pixelsPerPage) {
        const slice = document.createElement("canvas");
        slice.width = canvas.width;
        slice.height = Math.min(pixelsPerPage, canvas.height - top);
        const context = slice.getContext("2d");
        if (!context) throw new Error("Canvas unavailable");
        context.drawImage(
          canvas,
          0,
          top,
          canvas.width,
          slice.height,
          0,
          0,
          canvas.width,
          slice.height
        );
        if (top) pdf.addPage();
        pdf.addImage(
          slice.toDataURL("image/png"),
          "PNG",
          padding,
          padding,
          contentWidth,
          (slice.height * contentWidth) / canvas.width
        );
      }
      pdf.save(`invoice-${invoiceData?.invoiceNumber || invoiceId}.pdf`);
    } catch (_error) {
      showError("Failed to download PDF. Please try again.");
    }
  };

  return { handlePrint, handleDownloadPDF };
};
