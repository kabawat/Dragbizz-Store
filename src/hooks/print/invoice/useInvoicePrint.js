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

      // 210mm = ~794px at 96 DPI, 297mm = ~1123px
      const a4WidthPx = 794;
      const canvas = await html2canvas(invoice, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        onclone: prepareInvoiceCapture,
        width: a4WidthPx,
        // padding: 10,
        height: invoice.scrollHeight,
        windowWidth: a4WidthPx,
        windowHeight: invoice.scrollHeight,
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const padding = 5;
      const contentWidth = pdf.internal.pageSize.getWidth() - padding * 2;
      const pageHeight = pdf.internal.pageSize.getHeight() - padding * 2;
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
