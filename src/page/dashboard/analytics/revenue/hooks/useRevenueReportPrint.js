import { useEffect, useState } from "react";
import { useGlobalToast } from "@/contexts/ToastContext";
import logger from "@/utils/logger";

export const useRevenueReportPrint = (fetching, analyticsData) => {
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

    if (shouldPrint && !fetching && analyticsData) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [fetching, analyticsData]);

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

  const handleDownloadPDF = async (_analyticsData) => {
    const report = document.getElementById("revenue-report-area");
    if (!report) {
      showError("Report not found!");
      return;
    }

    // Save current theme variant (outside try block for error handling)
    const root = document.documentElement;
    const originalVariant = root.getAttribute("data-variant") || "light";
    const originalTheme = root.getAttribute("data-theme") || "default";

    try {
      // Temporarily force light mode for PDF generation
      root.setAttribute("data-variant", "light");
      root.setAttribute("data-theme", "default");

      // Add temporary style to ensure white background
      const tempStyle = document.createElement("style");
      tempStyle.id = "pdf-generation-style";
      tempStyle.textContent = `
                #revenue-report-area {
                    background: #ffffff !important;
                    color: #333333 !important;
                }
                #revenue-report-area * {
                    background-color: transparent !important;
                }
            `;
      document.head.appendChild(tempStyle);

      // Wait for styles to apply
      await new Promise((resolve) => setTimeout(resolve, 100));

      const { default: html2canvas } = await import("html2canvas");
      const { default: jsPDF } = await import("jspdf");

      const canvas = await html2canvas(report, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      // Remove temporary style
      const tempStyleEl = document.getElementById("pdf-generation-style");
      if (tempStyleEl) {
        tempStyleEl.remove();
      }

      // Restore original theme variant
      root.setAttribute("data-variant", originalVariant);
      root.setAttribute("data-theme", originalTheme);

      const imgData = canvas.toDataURL("image/jpeg", 0.7);
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(
        `revenue-analytics-report-${new Date().toISOString().split("T")[0]}.pdf`
      );
    } catch (_error) {
      // Restore original theme variant in case of error
      const tempStyleEl = document.getElementById("pdf-generation-style");
      if (tempStyleEl) {
        tempStyleEl.remove();
      }
      root.setAttribute("data-variant", originalVariant);
      root.setAttribute("data-theme", originalTheme);

      showError("Failed to download PDF. Please try again.");
    }
  };

  const handleDownloadXLSX = async (analyticsData, selectedStore) => {
    try {
      if (!analyticsData) {
        showError("No analytics data available!");
        return;
      }

      // Use exceljs for professional styling support
      const ExcelJS = (await import("exceljs")).default;

      const summary = analyticsData?.summary || {
        totalRevenue: 0,
        totalProfit: 0,
        totalDiscount: 0,
        totalGst: 0,
        profitMargin: 0,
      };

      const today = analyticsData?.today || {
        revenue: 0,
        profit: 0,
        sales: 0,
      };

      const change = analyticsData?.change || {
        revenue: 0,
        profit: 0,
        sales: 0,
        changeType: {
          revenue: "up",
          profit: "up",
          sales: "up",
        },
      };

      const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) return "₹0.00";
        return `₹${Number(amount).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
      };

      const formatNumber = (num) => (num || 0).toLocaleString("en-IN");
      const formatPercent = (num) => `${(num || 0).toFixed(2)}%`;

      // Create workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Revenue Analytics");

      // Define styles using website color scheme
      // Primary: #3b82f6 (blue-500), Secondary: #6b7280 (gray-500)
      // Border: #E5E7EB (gray-200), Background: #FCFCFD (very light gray)

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
        }, // Primary blue
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
        }, // Primary blue
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
        }, // Secondary gray
        alignment: { horizontal: "left", vertical: "middle" },
        border: {
          top: { style: "thin", color: { argb: "FF6B7280" } },
          bottom: { style: "thin", color: { argb: "FF6B7280" } },
          left: { style: "thin", color: { argb: "FF6B7280" } },
          right: { style: "thin", color: { argb: "FF6B7280" } },
        },
      };

      const dataCellStyle = {
        font: { name: "Arial", size: 10, color: { argb: "FF111827" } }, // Text primary
        alignment: { horizontal: "left", vertical: "middle" },
        border: {
          top: { style: "thin", color: { argb: "FFE5E7EB" } }, // Border primary
          bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
          left: { style: "thin", color: { argb: "FFE5E7EB" } },
          right: { style: "thin", color: { argb: "FFE5E7EB" } },
        },
      };

      const amountCellStyle = {
        font: { name: "Arial", size: 10, color: { argb: "FF111827" } }, // Text primary
        alignment: { horizontal: "right", vertical: "middle" },
        border: {
          top: { style: "thin", color: { argb: "FFE5E7EB" } }, // Border primary
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
        }, // Text secondary
        alignment: { horizontal: "left", vertical: "middle" },
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFCFCFD" },
        }, // Background secondary
      };

      let currentRow = 1;

      // Title row
      const titleRow = worksheet.getRow(currentRow);
      titleRow.getCell(1).value = "REVENUE ANALYTICS REPORT";
      titleRow.getCell(1).style = titleStyle;
      worksheet.mergeCells(currentRow, 1, currentRow, 3);
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

      worksheet.getRow(currentRow).getCell(1).value = "Last Synced";
      worksheet.getRow(currentRow).getCell(2).value =
        analyticsData?.lastSyncedAt
          ? new Date(analyticsData.lastSyncedAt).toLocaleString("en-IN")
          : "N/A";
      worksheet.getRow(currentRow).getCell(1).style = infoCellStyle;
      worksheet.getRow(currentRow).getCell(2).style = infoCellStyle;
      currentRow += 2;

      // Summary section
      const summaryHeaderRow = worksheet.getRow(currentRow);
      summaryHeaderRow.getCell(1).value = "SUMMARY";
      summaryHeaderRow.getCell(1).style = sectionHeaderStyle;
      worksheet.mergeCells(currentRow, 1, currentRow, 3);
      summaryHeaderRow.height = 20;
      currentRow++;

      // Summary table headers
      const summaryTableHeaderRow = worksheet.getRow(currentRow);
      summaryTableHeaderRow.getCell(1).value = "Metric";
      summaryTableHeaderRow.getCell(2).value = "Value";
      summaryTableHeaderRow.getCell(3).value = "Change";
      summaryTableHeaderRow.getCell(1).style = tableHeaderStyle;
      summaryTableHeaderRow.getCell(2).style = tableHeaderStyle;
      summaryTableHeaderRow.getCell(3).style = tableHeaderStyle;
      summaryTableHeaderRow.height = 18;
      currentRow++;

      // Summary data rows
      const summaryData = [
        [
          "Total Revenue",
          formatCurrency(summary.totalRevenue),
          `${change.changeType?.revenue === "up" ? "↑" : "↓"} ${Math.abs(change.revenue || 0).toFixed(2)}%`,
        ],
        [
          "Total Profit",
          formatCurrency(summary.totalProfit),
          `${change.changeType?.profit === "up" ? "↑" : "↓"} ${Math.abs(change.profit || 0).toFixed(2)}%`,
        ],
        [
          "Profit Margin",
          formatPercent(summary.profitMargin),
          "Overall margin",
        ],
        ["Total Discount", formatCurrency(summary.totalDiscount), "-"],
        ["Total GST", formatCurrency(summary.totalGst), "-"],
      ];

      summaryData.forEach((rowData, index) => {
        const row = worksheet.getRow(currentRow);
        row.getCell(1).value = rowData[0];
        row.getCell(2).value = rowData[1];
        row.getCell(3).value = rowData[2];
        // Alternating row colors using website background secondary color
        const altFill =
          index % 2 === 0
            ? {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFFCFCFD" },
              }
            : {};
        row.getCell(1).style = { ...dataCellStyle, fill: altFill };
        row.getCell(2).style = { ...amountCellStyle, fill: altFill };
        row.getCell(3).style = { ...dataCellStyle, fill: altFill };
        row.height = 18;
        currentRow++;
      });

      currentRow++;

      // Today's Performance section
      const todayHeaderRow = worksheet.getRow(currentRow);
      todayHeaderRow.getCell(1).value = "TODAY'S PERFORMANCE";
      todayHeaderRow.getCell(1).style = sectionHeaderStyle;
      worksheet.mergeCells(currentRow, 1, currentRow, 3);
      todayHeaderRow.height = 20;
      currentRow++;

      // Today's Performance table headers
      const todayTableHeaderRow = worksheet.getRow(currentRow);
      todayTableHeaderRow.getCell(1).value = "Metric";
      todayTableHeaderRow.getCell(2).value = "Value";
      todayTableHeaderRow.getCell(3).value = "Details";
      todayTableHeaderRow.getCell(1).style = tableHeaderStyle;
      todayTableHeaderRow.getCell(2).style = tableHeaderStyle;
      todayTableHeaderRow.getCell(3).style = tableHeaderStyle;
      todayTableHeaderRow.height = 18;
      currentRow++;

      // Today's Performance data rows
      const todayData = [
        [
          "Today's Revenue",
          formatCurrency(today.revenue),
          `${formatNumber(today.sales)} sales`,
        ],
        [
          "Today's Profit",
          formatCurrency(today.profit),
          `From ${formatNumber(today.sales)} sales`,
        ],
        ["Total Sales", formatNumber(today.sales), "Transactions today"],
      ];

      todayData.forEach((rowData, index) => {
        const row = worksheet.getRow(currentRow);
        row.getCell(1).value = rowData[0];
        row.getCell(2).value = rowData[1];
        row.getCell(3).value = rowData[2];
        // Alternating row colors using website background secondary color
        const altFill =
          index % 2 === 0
            ? {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFFCFCFD" },
              }
            : {};
        row.getCell(1).style = { ...dataCellStyle, fill: altFill };
        row.getCell(2).style = { ...amountCellStyle, fill: altFill };
        row.getCell(3).style = { ...dataCellStyle, fill: altFill };
        row.height = 18;
        currentRow++;
      });

      currentRow++;

      // Financial Breakdown section
      const breakdownHeaderRow = worksheet.getRow(currentRow);
      breakdownHeaderRow.getCell(1).value = "FINANCIAL BREAKDOWN";
      breakdownHeaderRow.getCell(1).style = sectionHeaderStyle;
      worksheet.mergeCells(currentRow, 1, currentRow, 2);
      breakdownHeaderRow.height = 20;
      currentRow++;

      // Financial Breakdown table headers
      const breakdownTableHeaderRow = worksheet.getRow(currentRow);
      breakdownTableHeaderRow.getCell(1).value = "Category";
      breakdownTableHeaderRow.getCell(2).value = "Amount";
      breakdownTableHeaderRow.getCell(1).style = tableHeaderStyle;
      breakdownTableHeaderRow.getCell(2).style = tableHeaderStyle;
      breakdownTableHeaderRow.height = 18;
      currentRow++;

      // Financial Breakdown data rows
      const breakdownData = [
        ["Total Revenue", formatCurrency(summary.totalRevenue)],
        ["Total Profit", formatCurrency(summary.totalProfit)],
        ["Total Discount", formatCurrency(summary.totalDiscount)],
        ["Total GST", formatCurrency(summary.totalGst)],
        ["Profit Margin", formatPercent(summary.profitMargin)],
      ];

      breakdownData.forEach((rowData, index) => {
        const row = worksheet.getRow(currentRow);
        row.getCell(1).value = rowData[0];
        row.getCell(2).value = rowData[1];
        // Alternating row colors using website background secondary color
        const altFill =
          index % 2 === 0
            ? {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFFCFCFD" },
              }
            : {};
        row.getCell(1).style = { ...dataCellStyle, fill: altFill };
        row.getCell(2).style = { ...amountCellStyle, fill: altFill };
        row.height = 18;
        currentRow++;
      });

      // Set column widths
      worksheet.getColumn(1).width = 28;
      worksheet.getColumn(2).width = 22;
      worksheet.getColumn(3).width = 18;

      // Add some padding to make it look better
      worksheet.properties.defaultRowHeight = 18;

      // Generate filename
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `revenue-analytics-report-${timestamp}.xlsx`;

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
    showPrintMenu,
    setShowPrintMenu,
    handlePrint,
    handleDownloadPDF,
    handleDownloadXLSX,
  };
};
