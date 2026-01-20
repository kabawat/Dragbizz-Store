  import logger from "./logger";

export const exportToCSV = (data, filename, onError = null) => {
  try {
    if (!data || data.length === 0) {
      if (onError) onError("No data to export");
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header] || "";
            // Escape commas and quotes in CSV
            if (
              typeof value === "string" &&
              (value.includes(",") ||
                value.includes('"') ||
                value.includes("\n"))
            ) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split("T")[0];
    const finalFilename = `${filename}_${timestamp}.csv`;

    link.setAttribute("download", finalFilename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    logger.error("CSV export error:", error);
    if (onError) onError("Failed to export as CSV");
  }
};

export const exportToXLSX = async (data, filename, options = {}) => {
  try {
    const { sheetName = "Sheet1", onError = null, onFallback = null } = options;

    // Dynamically import xlsx library
    const XLSX = await import("xlsx");

    if (!data || data.length === 0) {
      if (onError) onError("No data to export");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);

    // Set auto row heights and column widths
    const headers = Object.keys(data[0]);
    const maxWidths = {};

    // Calculate max width for each column
    headers.forEach((header) => {
      maxWidths[header] = header.length; // Start with header length
      data.forEach((row) => {
        const value = String(row[header] || "");
        if (value.length > maxWidths[header]) {
          maxWidths[header] = value.length;
        }
      });
    });

    // Set column widths (min 10, max 50)
    worksheet["!cols"] = headers.map((header) => ({
      wch: Math.min(Math.max(maxWidths[header] + 2, 10), 50),
    }));

    // Set auto row heights for all rows
    const range = XLSX.utils.decode_range(worksheet["!ref"]);
    worksheet["!rows"] = [];

    // Header row height
    worksheet["!rows"][0] = { hpt: 20 };

    // Data rows - calculate height based on content
    for (let R = 1; R <= range.e.r; R++) {
      let maxLines = 1;
      headers.forEach((header, C) => {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = worksheet[cellAddress];
        if (cell && cell.v) {
          const value = String(cell.v);
          // Estimate lines based on content length and column width
          const colWidth = worksheet["!cols"][C]?.wch || 10;
          const estimatedLines = Math.ceil(value.length / (colWidth * 0.8));
          if (estimatedLines > maxLines) {
            maxLines = estimatedLines;
          }
        }
      });
      // Set row height (minimum 15pt, add 5pt per additional line)
      worksheet["!rows"][R] = { hpt: Math.max(15, 15 + (maxLines - 1) * 5) };
    }

    // Enable text wrapping for all cells
    Object.keys(worksheet).forEach((key) => {
      if (key[0] !== "!") {
        if (!worksheet[key].s) worksheet[key].s = {};
        worksheet[key].s.wrapText = true;
        worksheet[key].s.vertical = "top";
      }
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split("T")[0];
    const finalFilename = `${filename}_${timestamp}.xlsx`;

    XLSX.writeFile(workbook, finalFilename);
  } catch (error) {
    logger.error("XLSX export error:", error);
    if (options.onError) options.onError("Failed to export as XLSX");
    // Fallback to CSV if fallback function provided
    if (options.onFallback) {
      exportToCSV(data, filename, options.onError);
    }
  }
};

//  Export data to PDF format with auto row heights
export const exportToPDF = async (data, filename, options = {}) => {
  try {
    const { title = "Export", metadata = [], onError = null } = options;

    // Dynamically import jsPDF library
    const { default: jsPDF } = await import("jspdf");

    if (!data || data.length === 0) {
      if (onError) onError("No data to export");
      return;
    }

    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const startX = margin;
    let startY = margin;

    // Title
    doc.setFontSize(18);
    doc.setFont(undefined, "bold");
    doc.text(title, startX, startY);
    startY += 10;

    // Metadata (store name, date range, etc.)
    if (metadata && metadata.length > 0) {
      doc.setFontSize(12);
      doc.setFont(undefined, "normal");
      metadata.forEach((item) => {
        if (item.label && item.value) {
          doc.text(`${item.label}: ${item.value}`, startX, startY);
          startY += 8;
        }
      });
    }

    startY += 5;

    // Table headers
    const headers = Object.keys(data[0]);
    const colWidths = [];
    const availableWidth = pageWidth - 2 * margin;

    // Calculate column widths (proportional)
    headers.forEach(() => {
      colWidths.push(availableWidth / headers.length);
    });

    // Draw table header with auto height
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");

    // Calculate header row height based on content
    let maxHeaderHeight = 8; // Minimum header height
    const headerCellHeights = [];

    headers.forEach((header, colIndex) => {
      const maxWidth = colWidths[colIndex] - 4;
      const headerLines = doc.splitTextToSize(header, maxWidth);
      const headerHeight = Math.max(8, headerLines.length * 4 + 2); // 4mm per line + padding
      headerCellHeights.push({ lines: headerLines, height: headerHeight });

      if (headerHeight > maxHeaderHeight) {
        maxHeaderHeight = headerHeight;
      }
    });

    // Draw header cells with auto height
    let xPos = startX;
    headers.forEach((header, index) => {
      const { lines, height } = headerCellHeights[index];
      doc.rect(xPos, startY - 5, colWidths[index], maxHeaderHeight);

      // Draw header text with wrapping
      let lineY = startY;
      lines.forEach((line) => {
        doc.text(line, xPos + 2, lineY, { maxWidth: colWidths[index] - 4 });
        lineY += 4; // 4mm line spacing
      });

      xPos += colWidths[index];
    });
    startY += maxHeaderHeight;

    // Draw table rows
    doc.setFont(undefined, "normal");
    doc.setFontSize(9);

    data.forEach((row, rowIndex) => {
      // Calculate row height based on content
      let maxRowHeight = 8; // Minimum row height
      const cellHeights = [];

      headers.forEach((header, colIndex) => {
        const value = String(row[header] || "");
        const maxWidth = colWidths[colIndex] - 4;

        // Calculate how many lines this cell needs
        const lines = doc.splitTextToSize(value, maxWidth);
        const cellHeight = Math.max(8, lines.length * 4 + 2); // 4mm per line + padding
        cellHeights.push({ lines, height: cellHeight });

        if (cellHeight > maxRowHeight) {
          maxRowHeight = cellHeight;
        }
      });

      // Check if we need a new page
      if (startY + maxRowHeight > pageHeight - 20) {
        doc.addPage();
        startY = margin;

        // Redraw header on new page with auto height
        doc.setFont(undefined, "bold");
        doc.setFontSize(10);
        xPos = startX;
        headers.forEach((header, index) => {
          const { lines, height } = headerCellHeights[index];
          doc.rect(xPos, startY - 5, colWidths[index], maxHeaderHeight);

          // Draw header text with wrapping
          let lineY = startY;
          lines.forEach((line) => {
            doc.text(line, xPos + 2, lineY, { maxWidth: colWidths[index] - 4 });
            lineY += 4; // 4mm line spacing
          });

          xPos += colWidths[index];
        });
        startY += maxHeaderHeight;
        doc.setFont(undefined, "normal");
        doc.setFontSize(9);
      }

      // Draw cells with auto-adjusted height
      xPos = startX;
      headers.forEach((header, colIndex) => {
        const value = String(row[header] || "");
        const maxWidth = colWidths[colIndex] - 4;
        const cellInfo = cellHeights[colIndex];

        // Draw cell border
        doc.rect(xPos, startY - 5, colWidths[colIndex], maxRowHeight);

        // Draw text with wrapping
        const lines = doc.splitTextToSize(value, maxWidth);
        let lineY = startY;
        lines.forEach((line, lineIndex) => {
          doc.text(line, xPos + 2, lineY, { maxWidth });
          lineY += 4; // 4mm line spacing
        });

        xPos += colWidths[colIndex];
      });
      startY += maxRowHeight;
    });

    // Footer
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, {
        align: "center",
      });
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split("T")[0];
    const finalFilename = `${filename}_${timestamp}.pdf`;

    doc.save(finalFilename);
  } catch (error) {
    logger.error("PDF export error:", error);
    if (onError) onError("Failed to export as PDF");
  }
};

// Main export function that handles all formats
export const exportData = async (data, format, filename, options = {}) => {
  const { onError = null } = options;

  if (!data || data.length === 0) {
    if (onError) onError("No data to export");
    return;
  }

  switch (format.toLowerCase()) {
    case "csv":
      exportToCSV(data, filename, onError);
      break;
    case "xlsx":
      await exportToXLSX(data, filename, options);
      break;
    case "pdf":
      await exportToPDF(data, filename, options);
      break;
    default:
      if (onError) onError(`Unsupported format: ${format}`);
      logger.error(`Unsupported export format: ${format}`);
  }
};
