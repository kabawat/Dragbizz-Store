import { useCallback, useEffect, useRef, useState } from "react";
import { useGlobalToast } from "@/contexts/ToastContext";
import logger from "@/utils/logger";

// ============================================================
// useAnalyticsReportPrint
// Enhanced with:
//  - Better "Loading/Preparing" states
//  - Progress feedback for PDF/XLSX generation
//  - Smooth UX with status callbacks
// ============================================================

export const useAnalyticsReportPrint = (
  fetching,
  analyticsData,
  reportId,
  reportName
) => {
  const { showError, showSuccess } = useGlobalToast();

  // ── Preparing States ─────────────────────────────────────────────
  const [isPrintPreparing, setIsPrintPreparing] = useState(false);
  const [isPdfPreparing, setIsPdfPreparing] = useState(false);
  const [isXlsxPreparing, setIsXlsxPreparing] = useState(false);
  const [preparingMessage, setPreparingMessage] = useState("");

  // ── Auto-print on ?print=true ────────────────────────────────────
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shouldPrint = urlParams.get("print") === "true";

    if (shouldPrint && !fetching && analyticsData) {
      setIsPrintPreparing(true);
      setPreparingMessage("Preparing report for printing...");
      setTimeout(() => {
        setIsPrintPreparing(false);
        setPreparingMessage("");
        window.print();
      }, 800);
    }
  }, [fetching, analyticsData]);

  // ── Print ────────────────────────────────────────────────────────
  const handlePrint = useCallback(() => {
    try {
      setIsPrintPreparing(true);
      setPreparingMessage("Preparing print layout...");
      setTimeout(() => {
        setIsPrintPreparing(false);
        setPreparingMessage("");
        window.print();
      }, 500);
    } catch (_e) {
      setIsPrintPreparing(false);
      setPreparingMessage("");
      showError("Printing failed.");
    }
  }, [showError]);

  // ── Download PDF ─────────────────────────────────────────────────
  const handleDownloadPDF = useCallback(
    async (_analyticsData) => {
      const report = document.getElementById(reportId);
      if (!report) {
        showError("Report not found!");
        return;
      }

      setIsPdfPreparing(true);
      setPreparingMessage("Generating PDF, please wait...");

      const root = document.documentElement;
      let tempStyleEl = null;
      const originalReportVariant = report.getAttribute("data-variant");
      const originalReportTheme = report.getAttribute("data-theme");

      try {
        // Inject light-mode styles for clean PDF output
        tempStyleEl = document.createElement("style");
        tempStyleEl.id = "pdf-generation-style";
        tempStyleEl.textContent = `
          #${reportId} {
            background: #ffffff !important;
            color: #333333 !important;
          }
          #${reportId} * {
            background-color: transparent !important;
            color: #333333 !important;
          }
          #${reportId} h1, #${reportId} h2, #${reportId} h3 {
            color: #111827 !important;
          }
        `;
        document.head.appendChild(tempStyleEl);

        report.setAttribute("data-variant", "light");
        report.setAttribute("data-theme", "default");

        setPreparingMessage("Rendering report content...");
        await new Promise((resolve) => setTimeout(resolve, 300));

        const { default: html2canvas } = await import("html2canvas");
        const { default: jsPDF } = await import("jspdf");

        setPreparingMessage("Capturing report as image...");
        const canvas = await html2canvas(report, {
          scale: 3,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false,
        });

        setPreparingMessage("Building PDF document...");
        const imgData = canvas.toDataURL("image/jpeg", 0.85);
        const pdf = new jsPDF("p", "mm", "a4");

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        // Multi-page support
        const pageHeight = pdf.internal.pageSize.getHeight();
        let heightLeft = pdfHeight;
        let position = 0;

        pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          position = heightLeft - pdfHeight;
          pdf.addPage();
          pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, pdfHeight);
          heightLeft -= pageHeight;
        }

        pdf.save(`${reportName}-${new Date().toISOString().split("T")[0]}.pdf`);
        showSuccess?.("PDF downloaded successfully!");
      } catch (error) {
        logger.error("PDF generation error:", error);
        showError("Failed to download PDF. Please try again.");
      } finally {
        // Restore original attributes
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
        if (tempStyleEl?.parentNode) {
          tempStyleEl.remove();
        }
        setIsPdfPreparing(false);
        setPreparingMessage("");
      }
    },
    [reportId, reportName, showError, showSuccess]
  );

  // ── Download XLSX ────────────────────────────────────────────────
  const handleDownloadXLSX = useCallback(
    async (analyticsData, selectedStore, reportName, dataConfig) => {
      try {
        if (!analyticsData) {
          showError("No analytics data available!");
          return;
        }

        setIsXlsxPreparing(true);
        setPreparingMessage("Preparing Excel export...");

        const ExcelJS = (await import("exceljs")).default;

        const _formatCurrency = (amount) => {
          if (amount === null || amount === undefined) return "₹0.00";
          return `₹${Number(amount).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`;
        };

        const _formatNumber = (num) => (num || 0).toLocaleString("en-IN");
        const _formatPercent = (num) => `${(num || 0).toFixed(2)}%`;

        setPreparingMessage("Building workbook...");

        const workbook = new ExcelJS.Workbook();
        workbook.creator = "DragBizz Store";
        workbook.created = new Date();
        const worksheet = workbook.addWorksheet(reportName);

        // ── Styles ──────────────────────────────────────────────────
        const titleStyle = {
          font: { name: "Arial", size: 16, bold: true, color: { argb: "FFFFFFFF" } },
          fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF3B82F6" } },
          alignment: { horizontal: "center", vertical: "middle" },
          border: {
            top: { style: "thin", color: { argb: "FF3B82F6" } },
            bottom: { style: "thin", color: { argb: "FF3B82F6" } },
            left: { style: "thin", color: { argb: "FF3B82F6" } },
            right: { style: "thin", color: { argb: "FF3B82F6" } },
          },
        };

        const sectionHeaderStyle = {
          font: { name: "Arial", size: 12, bold: true, color: { argb: "FFFFFFFF" } },
          fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF3B82F6" } },
          alignment: { horizontal: "left", vertical: "middle" },
          border: {
            top: { style: "thin", color: { argb: "FF3B82F6" } },
            bottom: { style: "thin", color: { argb: "FF3B82F6" } },
            left: { style: "thin", color: { argb: "FF3B82F6" } },
            right: { style: "thin", color: { argb: "FF3B82F6" } },
          },
        };

        const tableHeaderStyle = {
          font: { name: "Arial", size: 11, bold: true, color: { argb: "FFFFFFFF" } },
          fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF6B7280" } },
          alignment: { horizontal: "left", vertical: "middle" },
          border: {
            top: { style: "thin", color: { argb: "FF6B7280" } },
            bottom: { style: "thin", color: { argb: "FF6B7280" } },
            left: { style: "thin", color: { argb: "FF6B7280" } },
            right: { style: "thin", color: { argb: "FF6B7280" } },
          },
        };

        const dataCellStyle = {
          font: { name: "Arial", size: 10, color: { argb: "FF111827" } },
          alignment: { horizontal: "left", vertical: "middle" },
          border: {
            top: { style: "thin", color: { argb: "FFE5E7EB" } },
            bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
            left: { style: "thin", color: { argb: "FFE5E7EB" } },
            right: { style: "thin", color: { argb: "FFE5E7EB" } },
          },
        };

        const amountCellStyle = {
          font: { name: "Arial", size: 10, color: { argb: "FF111827" } },
          alignment: { horizontal: "right", vertical: "middle" },
          border: {
            top: { style: "thin", color: { argb: "FFE5E7EB" } },
            bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
            left: { style: "thin", color: { argb: "FFE5E7EB" } },
            right: { style: "thin", color: { argb: "FFE5E7EB" } },
          },
        };

        const infoCellStyle = {
          font: { name: "Arial", size: 10, italic: true, color: { argb: "FF4B5563" } },
          alignment: { horizontal: "left", vertical: "middle" },
          fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFFCFCFD" } },
        };

        let currentRow = 1;

        // Title row
        const titleRow = worksheet.getRow(currentRow);
        titleRow.getCell(1).value =
          dataConfig.title || `${reportName.toUpperCase()} REPORT`;
        titleRow.getCell(1).style = titleStyle;
        worksheet.mergeCells(currentRow, 1, currentRow, dataConfig.columns || 3);
        titleRow.height = 30;
        currentRow += 2;

        // Store info
        const infoRows = [
          ["Store Name", selectedStore?.storeName || selectedStore?.name || "N/A"],
          ["Generated On", new Date().toLocaleString("en-IN")],
        ];
        if (analyticsData?.lastSyncedAt) {
          infoRows.push([
            "Last Synced",
            new Date(analyticsData.lastSyncedAt).toLocaleString("en-IN"),
          ]);
        }

        infoRows.forEach(([label, value]) => {
          worksheet.getRow(currentRow).getCell(1).value = label;
          worksheet.getRow(currentRow).getCell(2).value = value;
          worksheet.getRow(currentRow).getCell(1).style = infoCellStyle;
          worksheet.getRow(currentRow).getCell(2).style = infoCellStyle;
          currentRow++;
        });

        currentRow += 1;

        setPreparingMessage("Writing data sections...");

        // Sections
        if (dataConfig.sections?.length > 0) {
          dataConfig.sections.forEach((section) => {
            // Section header
            const sectionHeaderRow = worksheet.getRow(currentRow);
            sectionHeaderRow.getCell(1).value = section.title || "SECTION";
            sectionHeaderRow.getCell(1).style = sectionHeaderStyle;
            worksheet.mergeCells(currentRow, 1, currentRow, section.columns || 3);
            sectionHeaderRow.height = 22;
            currentRow++;

            // Table headers
            if (section.headers?.length > 0) {
              const headerRow = worksheet.getRow(currentRow);
              section.headers.forEach((header, index) => {
                headerRow.getCell(index + 1).value = header;
                headerRow.getCell(index + 1).style = tableHeaderStyle;
              });
              headerRow.height = 20;
              currentRow++;
            }

            // Table data
            if (section.data?.length > 0) {
              section.data.forEach((rowData, index) => {
                const row = worksheet.getRow(currentRow);
                const altFill =
                  index % 2 === 0
                    ? { type: "pattern", pattern: "solid", fgColor: { argb: "FFFCFCFD" } }
                    : {};

                const cells = Array.isArray(rowData)
                  ? rowData
                  : Object.values(rowData);

                cells.forEach((cellValue, colIndex) => {
                  const isAmount = section.amountColumns?.includes(colIndex);
                  const cell = row.getCell(colIndex + 1);
                  cell.value = cellValue;
                  cell.style = isAmount
                    ? { ...amountCellStyle, fill: altFill }
                    : { ...dataCellStyle, fill: altFill };
                });

                row.height = 18;
                currentRow++;
              });
            }

            currentRow += 1;
          });
        }

        // Column widths
        const numColumns = dataConfig.columns || 3;
        for (let i = 1; i <= numColumns; i++) {
          worksheet.getColumn(i).width = i === 1 ? 30 : i === 2 ? 24 : 20;
        }

        worksheet.properties.defaultRowHeight = 18;

        setPreparingMessage("Saving file...");

        const timestamp = new Date().toISOString().split("T")[0];
        const filename = `${reportName}-${timestamp}.xlsx`;

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);

        showSuccess?.("Excel file downloaded successfully!");
      } catch (error) {
        logger.error("XLSX export error:", error);
        showError("Failed to download XLSX. Please try again.");
      } finally {
        setIsXlsxPreparing(false);
        setPreparingMessage("");
      }
    },
    [showError, showSuccess]
  );

  return {
    handlePrint,
    handleDownloadPDF,
    handleDownloadXLSX,
    // Preparing states for UI feedback
    isPrintPreparing,
    isPdfPreparing,
    isXlsxPreparing,
    isAnyPreparing: isPrintPreparing || isPdfPreparing || isXlsxPreparing,
    preparingMessage,
  };
};
