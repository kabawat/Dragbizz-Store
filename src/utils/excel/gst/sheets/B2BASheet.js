import { COLORS } from "../styles";

const createB2BASheet = (workbook, data) => {
    const sheet = workbook.addWorksheet("B2BA");

    sheet.columns = Array(25).fill({ width: 15 });

    sheet.mergeCells("A1:Y1");
    const title = sheet.getCell("A1");
    title.value = "Goods and Services Tax - GSTR-2B";
    title.font = { name: 'Calibri', bold: true, size: 16, color: { argb: COLORS.WHITE } };
    title.alignment = { horizontal: "center", vertical: "middle" };
    title.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.PRIMARY } };
    sheet.getRow(1).height = 35;

    sheet.mergeCells("A2:Y2");
    sheet.getCell("C2").value = "Amendments to previously filed invoices by supplier";

    [sheet.getCell("A2"), sheet.getCell("C2")].forEach(cell => {
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.font = { name: 'Calibri', bold: true, size: 10 };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "fff2cc" } };
        cell.border = {
            top: { style: "thin" }, left: { style: "thin" },
            bottom: { style: "thin" }, right: { style: "thin" }
        };
    });

    sheet.mergeCells("A3:B3");
    sheet.getCell("A3").value = "Original Details";

    const originalCell = sheet.getCell("A3");

    originalCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "fff2cc" }
    };

    originalCell.border = {
        top: { style: "thin" }, left: { style: "thin" },
        bottom: { style: "thin" }, right: { style: "thin" }
    };

    originalCell.font = {
        name: 'Calibri',
        bold: true,
        size: 12
    };

    originalCell.alignment = { horizontal: "center", vertical: "middle" };


    sheet.mergeCells("C3:Y3");
    const revHeader = sheet.getCell("C3");
    revHeader.value = "Revised Details";
    revHeader.alignment = { horizontal: "center", vertical: "middle" };
    revHeader.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "dcc8dc" } };


    sheet.getRow(4).values = [
        "Invoice number", "Invoice Date",
        "GSTIN of supplier", "Trade/Legal name",
        "Invoice Details", "", "", "",
        "Place of supply", "Supply Attract Reverse Charge", "Taxable Value (₹)",
        "Tax Amount", "", "", "",
        "Whether ITC to be reduced (Taxpayer's Input)",
        "Amount declared by taxpayer for ITC reduction", "", "", "",
        "GSTR-1/IFF/1A/GSTR-5 Period", "GSTR-1/IFF/1A/GSTR-5 Filing Date", "ITC Availability", "Reason", "Applicable % of Tax Rate"
    ];

    sheet.getRow(5).values = [
        "", "", "", "",
        "Invoice number", "Invoice type", "Invoice Date", "Invoice Value(₹)",
        "", "", "",
        "Integrated Tax(₹)", "Central Tax(₹)", "State/UT Tax(₹)", "Cess(₹)",
        "",
        "Integrated Tax(₹)", "Central Tax(₹)", "State/UT Tax(₹)", "Cess(₹)",
        "", "", "", "", ""
    ];

    const mergeVertical = (cols) => {
        cols.forEach(col => sheet.mergeCells(`${col}4:${col}5`));
    };

    mergeVertical(["A", "B", "C", "D", "I", "J", "K", "P", "U", "V", "W", "X", "Y"]);

    sheet.mergeCells("E4:H4");
    sheet.mergeCells("L4:O4");
    sheet.mergeCells("Q4:T4");


    [4, 5].forEach(rowNum => {
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

};

export default createB2BASheet;