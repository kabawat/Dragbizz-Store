import { COLORS } from "../styles";

const createB2BSheet = (workbook, data) => {
    const sheet = workbook.addWorksheet("B2B");

    sheet.columns = [
        { width: 20 }, { width: 25 }, { width: 15 }, { width: 15 }, { width: 15 },
        { width: 18 }, { width: 18 }, { width: 15 }, { width: 15 }, { width: 12 },
        { width: 22 }, { width: 22 }, { width: 15 }, { width: 15 }, { width: 22 },
        { width: 12 }, { width: 15 }, { width: 15 }
    ].map(col => ({ ...col, alignment: { horizontal: "center", vertical: "middle", wrapText: true } }));

    sheet.mergeCells("A1:R1");
    const title = sheet.getCell("A1");
    title.value = "Goods and Services Tax - GSTR-2B";
    title.font = { name: 'Calibri', bold: true, size: 16, color: { argb: COLORS.WHITE } };
    title.alignment = { horizontal: "center", vertical: "middle" };
    title.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.PRIMARY } };

    sheet.mergeCells("A2:R2");
    const subTitle = sheet.getCell("A2");
    subTitle.value = "Taxable inward supplies received from registered persons";
    subTitle.font = { name: 'Calibri', bold: true, size: 11 };
    subTitle.alignment = { horizontal: "center", vertical: "middle" };
    subTitle.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.SECONDARY } };

    // Headers configuration
    // Row 3
    const row3 = sheet.getRow(3);
    row3.values = [
        "GSTIN of supplier", "Trade/Legal name", "Invoice number", "Invoice type", "Invoice Date", "Invoice Value(₹)",
        "Place of supply", "Supply Attract Reverse Charge", "Rate(%)", "Taxable Value (₹)",
        "Integrated Tax(₹)", "Central Tax(₹)", "State/UT Tax(₹)", "Cess(₹)",
        "GSTR-1/IFF/GSTR-5 Period", "GSTR-1/IFF/GSTR-5 Filing Date", "ITC Availability",
        "Reason", "Applicable % of Tax Rate", "Source", "IRN", "IRN Date"
    ];

    // Merge logic if needed or just single row header for simplicity as per standard
    // Adapting to standard GSTR-2B format where some headers are merged
    sheet.mergeCells("C3:F3"); // Invoice Details
    sheet.getCell("C3").value = "Invoice Details";
    sheet.mergeCells("K3:N3"); // Tax Amount
    sheet.getCell("K3").value = "Tax Amount";

    // Sub-headers Row 4
    const row4 = sheet.getRow(4);
    row4.values = [
        "", "", "Invoice number", "Invoice type", "Invoice Date", "Invoice Value(₹)",
        "Place of supply", "Supply Attract Reverse Charge", "Rate(%)", "Taxable Value (₹)",
        "Integrated Tax(₹)", "Central Tax(₹)", "State/UT Tax(₹)", "Cess(₹)",
        "", "", "", "", "", "", "", ""
    ];

    // Merging vertical columns for main headers
    ["A", "B", "G", "H", "I", "J", "O", "P", "Q", "R", "S", "T", "U", "V"].forEach(col => {
        sheet.mergeCells(`${col}3:${col}4`);
        const cell = sheet.getCell(`${col}3`);
        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    });

    // Styling headers
    [3, 4].forEach(r => {
        sheet.getRow(r).eachCell(cell => {
            cell.font = { name: 'Calibri', bold: true, size: 9, color: { argb: "FFFFFF" } };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "2F75B5" } }; // Blue
            cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
            cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        });
    });

    const invoices = Array.isArray(data) ? data : [];

    invoices.forEach((item) => {
        const invoiceDate = item.invoiceDate ? new Date(item.invoiceDate).toLocaleDateString("en-IN") : "";
        // Calculate Invoice Value if not present (Taxable + Tax)
        const invoiceValue = item.invoiceValue ||
            ((item.taxableValue || 0) + (item.igst || 0) + (item.cgst || 0) + (item.sgst || 0) + (item.cess || 0));

        sheet.addRow([
            item.supplierGstin || item.gstin || "", // GSTIN of supplier
            item.tradeName || item.supplierName || "", // Trade/Legal name
            item.invoiceNumber || "", // Invoice number
            item.invoiceType || "Regular", // Invoice type
            invoiceDate, // Invoice Date
            invoiceValue, // Invoice Value
            item.placeOfSupply || item.pos || "", // Place of supply
            item.reverseCharge || "No", // Reverse Charge
            item.gstRate || 0, // Rate(%)
            item.taxableValue || 0, // Taxable Value
            item.igst || 0, // Integrated Tax
            item.cgst || 0, // Central Tax
            item.sgst || 0, // State/UT Tax
            item.cess || 0, // Cess
            item.period || "", // Period
            item.filingDate || "", // Filing Date
            item.itcAvailable || "Yes", // ITC Availability
            item.reason || "", // Reason
            item.applicablePercent || "100%", // Applicable %
            item.source || "", // Source
            item.irn || "", // IRN
            item.irnDate || "" // IRN Date
        ]);
    });
};

export default createB2BSheet;