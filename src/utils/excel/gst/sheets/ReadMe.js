import { COLORS } from "../styles";

const createReadSheet = (workbook, data) => {
    const sheet = workbook.addWorksheet("Read me");
    sheet.columns = [
        { width: 20 },
        { width: 20 },
        { width: 30 },
        { width: 85 },
    ].map(col => ({ ...col, alignment: { horizontal: "center", vertical: "middle", wrapText: true } }));

    sheet.mergeCells("A1:D1");
    const mainHeader = sheet.getCell("A1");
    mainHeader.value = "Goods and Services Tax - GSTR-2B";
    mainHeader.style = {
        font: { name: "Arial", size: 16, bold: true, color: { argb: "FFFFFFFF" } },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.PRIMARY } },
        alignment: { horizontal: "center", vertical: "middle", wrapText: true },
    };

    const metadata = [
        ["Financial Year", data?.financialYear || "2025-26"],
        ["Tax Period", data?.taxPeriod || "September"],
        ["GSTIN", data?.gstin || "24AASFA9045R1ZM"],
        ["Legal Name", data?.legalName || "AARUSH GEMS"],
        ["Trade Name (if any)", data?.tradeName || "AARUSH GEMS"],
        ["Date of generation", data?.generationDate || "14/10/2025"],
    ];

    metadata.forEach((item, index) => {
        const rowNum = index + 2;

        sheet.mergeCells(`A${rowNum}:B${rowNum}`);
        const labelCell = sheet.getCell(`A${rowNum}`);
        labelCell.value = item[0];
        labelCell.alignment = { horizontal: "right", vertical: "middle" };

        sheet.mergeCells(`C${rowNum}:D${rowNum}`);
        const valueCell = sheet.getCell(`C${rowNum}`);
        valueCell.value = item[1];
        valueCell.alignment = { horizontal: "left", vertical: "middle", indent: 1 };

        [labelCell, valueCell].forEach((cell) => {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.SECONDARY } };
            cell.border = {
                top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" }
            };
        });
    });

    sheet.mergeCells("A8:D8");
    const subHeader = sheet.getCell("A8");
    subHeader.value = "GSTR-2B Data Entry Instructions";
    subHeader.style = {
        font: { bold: true },
        alignment: { horizontal: "center", vertical: "middle", wrapText: true },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.GRAY } },
        border: { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } }
    };

    const headerRow = sheet.getRow(9);
    headerRow.values = ["Worksheet Name", "GSTR-2B Table Reference", "Field Name", "Instructions"];
    headerRow.eachCell((cell) => {
        cell.style = {
            font: { bold: true },
            fill: { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.GRAY } },
            alignment: { horizontal: "center", vertical: "middle", wrapText: true },
            border: { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } }
        };
    });

    const b2bData = [
        ["GSTIN of Supplier", "GSTIN of supplier"],
        ["Trade/Legal name", "Trade name of the supplier will be displayed. If trade name is not available, then legal name of the supplier"],
        ["Invoice number", "Invoice number"],
        ["Invoice type", `Invoice type can be derived based on the following types R- Regular (Other than SEZ supplies and Deemed exports) SEZWP- SEZ supplies with payment of tax SEZWOP- SEZ supplies with out payment of tax DE- Deemed exports CBW - Intra-State Supplies attracting IGST`],["Invoice date", "Invoice date format shall be DD-MM-YYYY"],
        ["Invoice value", "Invoice value (In rupees)"],
        ["Place of supply", "Place of supply shall be the place where goods are supplied or services are provided (As  declared by the supplier)"],
        ["Supply attract Reverse charge", `Supply attract reverse charge divided into two types: Y- Purchases attract reverse charge N- Purchases don’t attract reverse charge`],
        ["Taxable value", "Taxable value"],
        ["Integrated Tax", "Integrated Tax amount (In rupees)"],
        ["Central Tax", "Central Tax amount (In rupees)"],
        ["State/UT tax", "State/UT tax amount (In rupees)"],
        ["Cess", "Cess amount (In rupees)"],
        ["GSTR-1/IFF/1A/GSTR-5 Period", "Period for which GSTR-1/IFF/1A/GSTR-5 has been filed"],
        ["GSTR-1/IFF/1A/GSTR-5 Filing Date", "Date on which GSTR-1/IFF/1A/GSTR-5 has been filed"],
        ["ITC Availability", "Is ITC available or not on the document - 'Yes' or 'No'"],
        ["Reason", "Reason, if ITC availability is 'No'"],
        ["Applicable % of Tax Rate", "If the supply is eligible to be taxed at 65% of the existing rate of tax, it shall be 65%, else blank"],
        ["Source",`Source of the document shall be displayed. It shall be: a. 'e-invoice', if the document is auto-populated from e-invoice. b. Blank, if the document is uploaded by the supplier`],
        ["IRN", `It is the unique Invoice reference number of the document auto-populated from e-invoice. For the documents uploaded by the supplier, this shall be blank.`],
        ["IRN date", "This is the date of invoice reference number, auto-populated from e-invoice. For the documents uploaded by the supplier, this shall be blank."],
    ];

    const startRow = 10;
    b2bData.forEach((row, index) => {
        const currentRowNum = startRow + index;
        const currentRow = sheet.getRow(currentRowNum);
        const fieldNameCell = currentRow.getCell(3);
        const instructionCell = currentRow.getCell(4);
        fieldNameCell.value = row[0];
        instructionCell.value = row[1];
        fieldNameCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE0E0E0" } };
        fieldNameCell.alignment = {
            wrapText: true
        };

        [1, 2, 3, 4].forEach((col) => {
            const cell = currentRow.getCell(col);
            cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
            cell.border = {
                top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" }
            };
        });
    });


    const endRow = startRow + b2bData.length - 1;
    sheet.mergeCells(`A${startRow}:A${endRow}`);
    sheet.getCell(`A${startRow}`).value = "B2B";
    sheet.getCell(`A${startRow}`).alignment = { vertical: "middle", horizontal: "center" };
    sheet.mergeCells(`B${startRow}:B${endRow}`);
    sheet.getCell(`B${startRow}`).value = "Taxable inward supplies received from registered person";
    sheet.getCell(`B${startRow}`).alignment = { vertical: "middle", horizontal: "center", wrapText: true };
};

export default createReadSheet;