import { useEffect } from "react";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useTranslation } from "@/hooks/useTranslation";
import logger from "@/utils/logger";

export const useBillDetailsPrint = (loading, billData) => {
  const { showError } = useGlobalToast();
  const { t } = useTranslation();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shouldPrint = urlParams.get("print") === "true";

    if (shouldPrint && !loading && billData) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [loading, billData]);

  const handlePrint = () => {
    try {
      window.print();
    } catch (_e) {
      showError(t("common.printingFailed"));
    }
  };

  const handleDownloadPDF = async (_billData) => {
    const report = document.getElementById("bill-details-report-area");
    if (!report) {
      showError(t("common.reportNotFound"));
      return;
    }

    const root = document.documentElement;
    const _originalVariant = root.getAttribute("data-variant") || "light";
    const _originalTheme = root.getAttribute("data-theme") || "default";

    let tempStyleEl = null;
    const originalDisplay = report.style.display;
    const originalVisibility = report.style.visibility;
    const originalPosition = report.style.position;
    const originalLeft = report.style.left;

    try {
      report.style.display = "block";
      report.style.visibility = "visible";
      report.style.position = "absolute";
      report.style.left = "-9999px";

      tempStyleEl = document.createElement("style");
      tempStyleEl.id = "pdf-generation-style";
      tempStyleEl.textContent = `
                #bill-details-report-area {
                    background: #ffffff !important;
                    color: #333333 !important;
                    width: 210mm !important;
                    max-width: 210mm !important;
                }
                #bill-details-report-area * {
                    background-color: transparent !important;
                    color: #333333 !important;
                }
                #bill-details-report-area h1, #bill-details-report-area h2, #bill-details-report-area h3 {
                    color: #111827 !important;
                }
            `;
      document.head.appendChild(tempStyleEl);

      const originalReportVariant = report.getAttribute("data-variant");
      const originalReportTheme = report.getAttribute("data-theme");

      report.setAttribute("data-variant", "light");
      report.setAttribute("data-theme", "default");

      await new Promise((resolve) => setTimeout(resolve, 500));

      if (!report || report.offsetWidth === 0 || report.offsetHeight === 0) {
        throw new Error("Report element dimensions are invalid");
      }

      const { default: html2canvas } = await import("html2canvas");
      const { default: jsPDF } = await import("jspdf");

      const canvas = await html2canvas(report, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error("Canvas dimensions are invalid");
      }

      if (originalReportVariant !== null) {
        report.setAttribute("data-variant", originalReportVariant);
      } else {
        report.removeAttribute("data-variant");
      }

      if (originalReportTheme !== null) {
        report.setAttribute("data-theme", originalReportTheme);
      } else {
        report.removeAttribute("data-theme");
      }

      const imgData = canvas.toDataURL("image/jpeg", 0.7);
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      if (!imgWidth || !imgHeight || imgWidth === 0 || imgHeight === 0) {
        throw new Error("Image dimensions are invalid");
      }

      const ratio = imgWidth / imgHeight;
      const scaledWidth = pdfWidth;
      const scaledHeight = pdfWidth / ratio;

      if (
        !isFinite(scaledWidth) ||
        !isFinite(scaledHeight) ||
        scaledWidth <= 0 ||
        scaledHeight <= 0
      ) {
        throw new Error("Calculated PDF dimensions are invalid");
      }

      if (scaledHeight <= pdfHeight) {
        pdf.addImage(imgData, "JPEG", 0, 0, scaledWidth, scaledHeight);
      } else {
        let heightLeft = scaledHeight;
        let position = 0;

        pdf.addImage(imgData, "JPEG", 0, position, scaledWidth, scaledHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
          position = heightLeft - scaledHeight;
          pdf.addPage();
          pdf.addImage(imgData, "JPEG", 0, position, scaledWidth, scaledHeight);
          heightLeft -= pdfHeight;
        }
      }

      pdf.save(
        `bill-details-${billData?.billNumber?.replace(/\s+/g, "-") || "report"}-${new Date().toISOString().split("T")[0]}.pdf`
      );
    } catch (error) {
      logger.error("PDF generation error:", error);
      showError(t("common.failedToDownloadPDF"));
    } finally {
      if (tempStyleEl?.parentNode) {
        tempStyleEl.remove();
      }
      report.style.display = originalDisplay;
      report.style.visibility = originalVisibility;
      report.style.position = originalPosition;
      report.style.left = originalLeft;
    }
  };

  return {
    handlePrint,
    handleDownloadPDF,
  };
};
