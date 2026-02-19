import { useEffect } from "react";
import { useGlobalToast } from "@/contexts/ToastContext";

export const useInvoicePrint = (fetching, invoiceData, skipAutoPrint = false) => {
  const { showError } = useGlobalToast();

  useEffect(() => {
    if (skipAutoPrint) return;

    const urlParams = new URLSearchParams(window.location.search);
    const shouldPrint = urlParams.get("print") === "true";

    if (shouldPrint && !fetching && invoiceData) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [fetching, invoiceData, skipAutoPrint]);

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
        width: a4WidthPx,
        // padding: 10,
        height: invoice.scrollHeight,
        windowWidth: a4WidthPx,
        windowHeight: invoice.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // Add padding: 10mm on all sides
      const padding = 5; // 10mm padding
      const contentWidth = pdfWidth - (padding * 2);
      const contentHeight = (canvas.height * contentWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", padding, padding, contentWidth, contentHeight);
      pdf.save(`invoice-${invoiceData?.invoiceNumber || invoiceId}.pdf`);
    } catch (_error) {
      
      showError("Failed to download PDF. Please try again.");
    }
  };

  return { handlePrint, handleDownloadPDF };
};
