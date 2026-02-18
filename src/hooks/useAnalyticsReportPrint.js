import { useEffect, useState } from "react";
import { useGlobalToast } from "@/contexts/ToastContext";
import logger from "@/utils/logger";
import { formatCurrency, formatNumber, formatPercent } from "@/utils/currencyFormatter";

export const useAnalyticsReportPrint = (
  fetching,
  analyticsData,
  reportId,
  reportName
) => {
  const { showError } = useGlobalToast();
  const [isPreparing, setIsPreparing] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shouldPrint = urlParams.get("print") === "true";

    if (shouldPrint && !fetching && analyticsData) {
      setIsPreparing(true);
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [fetching, analyticsData]);

  const handlePrint = async () => {
    try {
      setIsPreparing(true);
      // Wait for re-render
      await new Promise(resolve => setTimeout(resolve, 100));
      window.print();
      // Use a timeout to ensure print dialog is triggered before unmounting
      setTimeout(() => setIsPreparing(false), 2000);
    } catch (_e) {
      showError("Printing failed.");
      setIsPreparing(false);
    }
  };

  const handleDownloadPDF = async (_analyticsData) => {
    setIsPreparing(true);

    // Wait for re-render so element exists in DOM
    await new Promise(resolve => setTimeout(resolve, 300));

    const report = document.getElementById(reportId);
    if (!report) {
      showError("Report not found!");
      setIsPreparing(false);
      return;
    }

    const root = document.documentElement;
    const _originalVariant = root.getAttribute("data-variant") || "light";
    const _originalTheme = root.getAttribute("data-theme") || "default";

    let tempStyleEl = null;

    try {
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

      const originalReportVariant = report.getAttribute("data-variant");
      const originalReportTheme = report.getAttribute("data-theme");

      report.setAttribute("data-variant", "light");
      report.setAttribute("data-theme", "default");

      await new Promise((resolve) => setTimeout(resolve, 300));

      const { default: html2canvas } = await import("html2canvas");
      const { default: jsPDF } = await import("jspdf");

      const canvas = await html2canvas(report, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

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
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${reportName}-${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      logger.error("PDF generation error:", error);
      showError("Failed to download PDF. Please try again.");
    } finally {
      setIsPreparing(false);
      if (tempStyleEl?.parentNode) {
        tempStyleEl.remove();
      }
    }
  };

  const handleDownloadXLSX = async (
    analyticsData,
    selectedStore,
    reportName,
    dataConfig
  ) => {
    try {
      if (!analyticsData) {
        showError("No analytics data available!");
        return;
      }

      // Use exceljs for professional styling support
      const ExcelJS = (await import("exceljs")).default;

      const _formatCurrency = formatCurrency;
      const _formatNumber = formatNumber;
      const _formatPercent = formatPercent;

      // Create workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(reportName);

      // Define styles using website color scheme
      const titleStyle = {
        font: {
          name: "Arial",
          size: 16,
          bold: true,
          color: { argb: "FFFFFFFF" },
        },
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF3B82F6" },
        },
        alignment: { horizontal: "center", vertical: "middle" },
        border: {
          top: { style: "thin", color: { argb: "FF3B82F6" } },
          bottom: { style: "thin", color: { argb: "FF3B82F6" } },
          left: { style: "thin", color: { argb: "FF3B82F6" } },
          right: { style: "thin", color: { argb: "FF3B82F6" } },
        },
      };

      const sectionHeaderStyle = {
        font: {
          name: "Arial",
          size: 12,
          bold: true,
          color: { argb: "FFFFFFFF" },
        },
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF3B82F6" },
        },
        alignment: { horizontal: "left", vertical: "middle" },
        border: {
          top: { style: "thin", color: { argb: "FF3B82F6" } },
          bottom: { style: "thin", color: { argb: "FF3B82F6" } },
          left: { style: "thin", color: { argb: "FF3B82F6" } },
          right: { style: "thin", color: { argb: "FF3B82F6" } },
        },
      };

      const tableHeaderStyle = {
        font: {
          name: "Arial",
          size: 11,
          bold: true,
          color: { argb: "FFFFFFFF" },
        },
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF6B7280" },
        },
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
        font: {
          name: "Arial",
          size: 10,
          italic: true,
          color: { argb: "FF4B5563" },
        },
        alignment: { horizontal: "left", vertical: "middle" },
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFCFCFD" },
        },
      };

      let currentRow = 1;

      // Title row
      const titleRow = worksheet.getRow(currentRow);
      titleRow.getCell(1).value =
        dataConfig.title || `${reportName.toUpperCase()} REPORT`;
      titleRow.getCell(1).style = titleStyle;
      worksheet.mergeCells(currentRow, 1, currentRow, dataConfig.columns || 3);
      titleRow.height = 25;
      currentRow += 2;

      // Store info
      worksheet.getRow(currentRow).getCell(1).value = "Store Name";
      worksheet.getRow(currentRow).getCell(2).value =
        selectedStore?.storeName || selectedStore?.name || "N/A";
      worksheet.getRow(currentRow).getCell(1).style = infoCellStyle;
      worksheet.getRow(currentRow).getCell(2).style = infoCellStyle;
      currentRow++;

      worksheet.getRow(currentRow).getCell(1).value = "Generated On";
      worksheet.getRow(currentRow).getCell(2).value = new Date().toLocaleString(
        "en-IN"
      );
      worksheet.getRow(currentRow).getCell(1).style = infoCellStyle;
      worksheet.getRow(currentRow).getCell(2).style = infoCellStyle;
      currentRow++;

      if (analyticsData?.lastSyncedAt) {
        worksheet.getRow(currentRow).getCell(1).value = "Last Synced";
        worksheet.getRow(currentRow).getCell(2).value = new Date(
          analyticsData.lastSyncedAt
        ).toLocaleString("en-IN");
        worksheet.getRow(currentRow).getCell(1).style = infoCellStyle;
        worksheet.getRow(currentRow).getCell(2).style = infoCellStyle;
        currentRow++;
      }

      currentRow += 1;

      // Process sections from dataConfig
      if (dataConfig.sections && dataConfig.sections.length > 0) {
        dataConfig.sections.forEach((section) => {
          // Section header
          const sectionHeaderRow = worksheet.getRow(currentRow);
          sectionHeaderRow.getCell(1).value = section.title || "SECTION";
          sectionHeaderRow.getCell(1).style = sectionHeaderStyle;
          worksheet.mergeCells(currentRow, 1, currentRow, section.columns || 3);
          sectionHeaderRow.height = 20;
          currentRow++;

          // Table headers
          if (section.headers && section.headers.length > 0) {
            const headerRow = worksheet.getRow(currentRow);
            section.headers.forEach((header, index) => {
              headerRow.getCell(index + 1).value = header;
              headerRow.getCell(index + 1).style = tableHeaderStyle;
            });
            headerRow.height = 18;
            currentRow++;
          }

          // Table data
          if (section.data && section.data.length > 0) {
            section.data.forEach((rowData, index) => {
              const row = worksheet.getRow(currentRow);
              const altFill =
                index % 2 === 0
                  ? {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "FFFCFCFD" },
                  }
                  : {};

              if (Array.isArray(rowData)) {
                rowData.forEach((cellValue, colIndex) => {
                  const isAmount = section.amountColumns?.includes(colIndex);
                  const cell = row.getCell(colIndex + 1);
                  cell.value = cellValue;
                  cell.style = isAmount
                    ? { ...amountCellStyle, fill: altFill }
                    : { ...dataCellStyle, fill: altFill };
                });
              } else if (typeof rowData === "object") {
                // Handle object format {label: '...', amount: '...'}
                Object.values(rowData).forEach((cellValue, colIndex) => {
                  const isAmount = section.amountColumns?.includes(colIndex);
                  const cell = row.getCell(colIndex + 1);
                  cell.value = cellValue;
                  cell.style = isAmount
                    ? { ...amountCellStyle, fill: altFill }
                    : { ...dataCellStyle, fill: altFill };
                });
              }

              row.height = 18;
              currentRow++;
            });
          }

          currentRow += 1;
        });
      }

      // Set column widths
      const numColumns = dataConfig.columns || 3;
      for (let i = 1; i <= numColumns; i++) {
        worksheet.getColumn(i).width = i === 1 ? 28 : i === 2 ? 22 : 18;
      }

      worksheet.properties.defaultRowHeight = 18;

      // Generate filename
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `${reportName}-${timestamp}.xlsx`;

      // Write file
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
    } catch (error) {
      logger.error("XLSX export error:", error);
      showError("Failed to download XLSX. Please try again.");
    }
  };

  return {
    handlePrint,
    handleDownloadPDF,
    handleDownloadXLSX,
    isPreparing,
  };
};
