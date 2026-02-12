import { useEffect } from "react";
import { useGlobalToast } from "@/contexts/ToastContext";

export const useInvoicePrint = (fetching, invoiceData) => {
  const { showError } = useGlobalToast();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shouldPrint = urlParams.get("print") === "true";

    if (shouldPrint && !fetching && invoiceData) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [fetching, invoiceData]);

  const handlePrint = () => {
    try {
      window.print();
    } catch (_e) {
      showError("Printing failed.");
    }
  };

  const handleDownloadPDF = async (invoiceData, invoiceId) => {
    const invoice = document.getElementById("invoice-area");
    if (!invoice) {
      showError("Invoice not found!");
      return;
    }

    try {
      const { default: html2canvas } = await import("html2canvas");
      const { default: jsPDF } = await import("jspdf");

      const canvas = await html2canvas(invoice, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        onclone: (clonedDoc) => {
          // Adjust styles to match print layout
          const invoiceContainer = clonedDoc.getElementById("invoice-container");
          if (invoiceContainer) {
            invoiceContainer.style.padding = "0.5cm"; // Match the print padding defined in CSS
            invoiceContainer.style.width = "210mm";   // Force A4 width
            invoiceContainer.style.maxWidth = "none";
            invoiceContainer.style.margin = "0";      // Remove centering margin for capture
            invoiceContainer.style.height = "auto";
            invoiceContainer.style.minHeight = "297mm";
          }
        },
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.7);
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`invoice-${invoiceData?.invoiceNumber || invoiceId}.pdf`);
    } catch (_error) {
      showError("Failed to download PDF. Please try again.");
    }
  };

  return { handlePrint, handleDownloadPDF };
};
