import { COLORS } from "../styles";

const createB2BCDNRSheet = (workbook, data) => {
    const sheet = workbook.addWorksheet("B2B-CDNR");

    sheet.columns = Array(26).fill({ width: 15 });

    sheet.mergeCells("A1:Z1");
    const title = sheet.getCell("A1");
    title.value = "Goods and Services Tax - GSTR-2B";
    title.font = { name: 'Calibri', bold: true, size: 16, color: { argb: COLORS.WHITE } };
    title.alignment = { horizontal: "center", vertical: "middle" };
    title.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.PRIMARY } };
    sheet.getRow(1).height = 35;

    sheet.mergeCells("A2:Z2");
    const subHeader = sheet.getCell("A2");
    subHeader.value = "Debit/Credit notes (Original)";
    subHeader.alignment = { horizontal: "center", vertical: "middle" };
    subHeader.font = { name: 'Calibri', bold: true, size: 10 };
    subHeader.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF2CC" } };
    subHeader.border = {
        top: { style: "thin" }, left: { style: "thin" },
        bottom: { style: "thin" }, right: { style: "thin" }
    };

    sheet.getRow(3).values = [
        "GSTIN of supplier", "Trade/Legal name", "Credit note/Debit note details", "", "", "", "Place of supply",
        "Supply Attract Reverse Charge", "Taxable Value (₹)",
        "Tax Amount", "", "", "",
        "Whether ITC to be reduced (Taxpayer's Input)",
        "Amount declared by taxpayer for ITC reduction", "", "", "",
        "GSTR-1/IFF/1A/GSTR-5 Period", "GSTR-1/IFF/1A/GSTR-5 Filing Date",
        "ITC Availability", "Reason", "Applicable % of Tax Rate", "Source", "IRN", "IRN Date"
    ];

    sheet.getRow(4).values = [
        "", "", "Note number", "Note type", "Note Supply type", "Note Date", "Note Value(₹)", "", "",
        "Integrated Tax(₹)", "Central Tax(₹)", "State/UT Tax(₹)", "Cess(₹)",
        "",
        "Integrated Tax(₹)", "Central Tax(₹)", "State/UT Tax(₹)", "Cess(₹)",
        "", "", "", "", "", "", "", ""
    ];

    sheet.mergeCells("C3:F3");
    sheet.mergeCells("J3:M3");
    sheet.mergeCells("O3:R3");

    const verticalCols = ["A", "B", "G", "H", "I", "N", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    verticalCols.forEach(col => {
        sheet.mergeCells(`${col}3:${col}4`);
    });

    [3, 4].forEach(rowNum => {
        sheet.getRow(rowNum).eachCell((cell) => {
            cell.font = { name: 'Calibri', bold: true, size: 8, color: { argb: COLORS.WHITE } };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.PRIMARY } };
            cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
            cell.border = {
                top: { style: "thin" }, left: { style: "thin" },
                bottom: { style: "thin" }, right: { style: "thin" }
            };
        });
    });

    sheet.getRow(3).height = 30;
    sheet.getRow(4).height = 35;

    if (data && data.length > 0) {
        data.forEach(item => {
            const row = sheet.addRow([
                item.gstin, item.tradeName, item.noteType, item.noteNum, item.noteDate, item.noteValue,
                item.pos, item.reverseCharge, item.taxableValue,
                item.igst, item.cgst, item.sgst, item.cess,
                item.itcReducedInput,
                item.redIgst, item.redCgst, item.redSgst, item.redCess,
                item.period, item.filingDate, item.itcAvailable, item.reason, item.taxRate,
                item.source, item.irn, item.irnDate
            ]);
            row.eachCell(cell => {
                cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
                cell.alignment = { horizontal: "center", vertical: "middle" };
                cell.font = { name: 'Calibri', size: 9 };
            });
        });
    }
};

export default createB2BCDNRSheet;