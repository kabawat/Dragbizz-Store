import { useEffect, useState } from "react";
import { useGlobalToast } from "@/contexts/ToastContext";
import logger from "@/utils/logger";

export const useSupplierDetailsPrint = (fetching, supplierData) => {
  const { showError } = useGlobalToast();
  const [showPrintMenu, setShowPrintMenu] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showPrintMenu && !event.target.closest(".print-menu-container")) {
        setShowPrintMenu(false);
      }
    };

    if (showPrintMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showPrintMenu]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shouldPrint = urlParams.get("print") === "true";

    if (shouldPrint && !fetching && supplierData) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [fetching, supplierData]);

  const handlePrint = (mode = "standard") => {
    try {
      const old = document.getElementById("app-print-stylesheet");
      if (old) old.remove();

      document.body.classList.remove("print-mode-mini", "print-mode-standard");

      const cls = mode === "mini" ? "print-mode-mini" : "print-mode-standard";
      document.body.classList.add(cls);

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.id = "app-print-stylesheet";
      link.href = mode === "mini" ? "/print-mini.css" : "/print-a4.css";
      document.head.appendChild(link);

      const cleanup = () => {
        setTimeout(() => {
          const l = document.getElementById("app-print-stylesheet");
          if (l) l.remove();
          document.body.classList.remove(
            "print-mode-mini",
            "print-mode-standard"
          );
          window.onafterprint = null;
        }, 200);
      };

      window.onafterprint = cleanup;
      window.print();
      setTimeout(cleanup, 8000);
      setShowPrintMenu(false);
    } catch (_e) {
      showError("Printing failed.");
    }
  };

  const handleDownloadPDF = async (_supplierData) => {
    const report = document.getElementById("supplier-details-report-area");
    if (!report) {
      showError("Report not found!");
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
                #supplier-details-report-area {
                    background: #ffffff !important;
                    color: #333333 !important;
                    width: 210mm !important;
                    max-width: 210mm !important;
                }
                #supplier-details-report-area * {
                    background-color: transparent !important;
                    color: #333333 !important;
                }
                #supplier-details-report-area h1, #supplier-details-report-area h2, #supplier-details-report-area h3 {
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
        `supplier-details-${supplierData?.name?.replace(/\s+/g, "-") || "report"}-${new Date().toISOString().split("T")[0]}.pdf`
      );
    } catch (error) {
      logger.error("PDF generation error:", error);
      showError("Failed to download PDF. Please try again.");
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
    showPrintMenu,
    setShowPrintMenu,
    handlePrint,
    handleDownloadPDF,
  };
};

