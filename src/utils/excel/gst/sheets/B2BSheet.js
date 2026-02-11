import { COLORS } from "../styles";

const createB2BSheet = (workbook, data) => {
    const sheet = workbook.addWorksheet("B2B");

    // Ensure data is an array
    const invoices = Array.isArray(data) ? data : [];

    sheet.columns = [
        { width: 20 }, { width: 25 }, { width: 15 }, { width: 15 }, { width: 15 },
        { width: 18 }, { width: 18 }, { width: 15 }, { width: 15 }, { width: 12 },
        { width: 22 }, { width: 22 }, { width: 15 }, { width: 15 }, { width: 22 },
        { width: 12 }, { width: 15 }, { width: 15 }
    ];

    sheet.mergeCells("A1:R1");
    const title = sheet.getCell("A1");
    title.value = "Goods and Services Tax - GSTR-2B";
    title.font = { name: 'Calibri', bold: true, size: 16, color: { argb: COLORS.WHITE } };
    title.alignment = { horizontal: "center", vertical: "middle" };
    title.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.PRIMARY } };
    sheet.getRow(1).height = 40;

    sheet.mergeCells("A2:R2");
    const subTitle = sheet.getCell("A2");
    subTitle.value = "Taxable inward supplies received from registered persons";
    subTitle.font = { name: 'Calibri', bold: true, size: 11 };
    subTitle.alignment = { horizontal: "center", vertical: "middle" };
    subTitle.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.SECONDARY } };

    sheet.getRow(3).values = [
        "GSTIN of supplier", "Trade/Legal name", "Invoice Details", "", "",
        "Taxable Value (₹)", "Tax Amount", "", "", "",
        "GSTR-1/1A/IFF/GSTR-5 Period", "GSTR-1/1A/IFF/GSTR-5 Filing Date",
        "ITC Availability", "Reason", "Applicable % of Tax Rate", "Source", "IRN", "IRN Date"
    ];

    sheet.getRow(4).values = [
        "", "", "Invoice type", "Invoice Date", "Invoice Value(₹)",
        "", "Integrated Tax(₹)", "Central Tax(₹)", "State/UT Tax(₹)", "Cess(₹)",
        "", "", "", "", "", "", "", ""
    ];

    sheet.mergeCells("C3:E3");
    sheet.mergeCells("G3:J3");

    const verticalCols = ["A", "B", "F", "K", "L", "M", "N", "O", "P", "Q", "R"];
    verticalCols.forEach(col => {
        sheet.mergeCells(`${col}3:${col}4`);
    });

    [3, 4].forEach(rowNum => {
        sheet.getRow(rowNum).eachCell((cell) => {
            cell.font = { name: 'Calibri', bold: true, size: 9, color: { argb: COLORS.WHITE } };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.PRIMARY } };
            cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
            cell.border = {
                top: { style: "thin" }, left: { style: "thin" },
                bottom: { style: "thin" }, right: { style: "thin" }
            };
        });
    });
    sheet.getRow(3).height = 25;
    sheet.getRow(4).height = 30;

    invoices.forEach((item) => {
        const row = sheet.addRow([
            item.gstin,
            item.tradeName,
            item.invoiceType || "Regular",
            item.invoiceDate,
            item.invoiceValue,
            item.taxableValue,
            item.igst || 0,
            item.cgst,
            item.sgst,
            item.cess,
            "Sep-25",
            "08/10/2025",
            item.itc,
            "",
            "100%",
            "",
            "",
            ""
        ]);

        row.eachCell((cell, col) => {
            cell.alignment = { horizontal: "center" };
            if (col === 8) {
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.YELLOW } };
            }
        });
    });
};

export default createB2BSheet;