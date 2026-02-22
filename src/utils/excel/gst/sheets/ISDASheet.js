import { COLORS } from "../styles";

const createISDASheet = (workbook, data) => {
    const worksheet = workbook.addWorksheet('ISDA');

    worksheet.columns = [
        { width: 18 }, { width: 18 }, { width: 15 },
        { width: 20 }, { width: 25 }, { width: 18 }, { width: 20 }, { width: 18 },
        { width: 20 }, { width: 18 },
        { width: 18 }, { width: 18 }, { width: 18 }, { width: 15 },
        { width: 18 }, { width: 20 }, { width: 15 }
    ].map(col => ({ ...col, alignment: { horizontal: "center", vertical: "middle", wrapText: true } }));

    const blueFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.PRIMARY } };
    const yellowFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.SECONDARY } };
    const purpleFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.SUB2TITLE } };
    const whiteFont = { color: { argb: 'FFFFFF' }, bold: true, size: 10 };
    const blackFont = { color: { argb: '000000' }, bold: true, size: 10 };
    const centerAlign = { vertical: 'middle', horizontal: 'center', wrapText: true };
    const whiteBorder = {
        top: { style: 'thin', color: { argb: '000' } },
        left: { style: 'thin', color: { argb: '000' } },
        bottom: { style: 'thin', color: { argb: '000' } },
        right: { style: 'thin', color: { argb: '000' } }
    };
    worksheet.mergeCells('A1:Q1');
    const r1 = worksheet.getCell('A1');
    r1.value = 'Goods and Services Tax - GSTR-2B';
    r1.fill = blueFill; r1.font = { ...whiteFont, size: 16 }; r1.alignment = centerAlign;

    worksheet.mergeCells('A2:Q2');
    const r2 = worksheet.getCell('A2');
    r2.value = 'Amendments ISD Credits received';
    r2.fill = yellowFill; r2.font = blackFont; r2.alignment = centerAlign;
    r2.border = {
        top: { style: "thin" }, left: { style: "thin" },
        bottom: { style: "thin" }, right: { style: "thin" }
    };

    worksheet.mergeCells('A3:C3');
    const r3a = worksheet.getCell('A3');
    r3a.value = 'Original Details';
    r3a.fill = yellowFill; r3a.font = blackFont; r3a.alignment = centerAlign;
    r3a.border = { right: { style: 'thin', color: { argb: '000000' } } };
    r3a.border = {
        top: { style: "thin" }, left: { style: "thin" },
        bottom: { style: "thin" }, right: { style: "thin" }
    };

    worksheet.mergeCells('D3:Q3');
    const r3b = worksheet.getCell('D3');
    r3b.value = 'Revised Details';
    r3b.fill = purpleFill; r3b.font = blackFont; r3b.alignment = centerAlign;
    r3b.border = {
        top: { style: "thin" }, left: { style: "thin" },
        bottom: { style: "thin" }, right: { style: "thin" }
    };

    const headers = [
        { label: "ISD Document type", col: "A" },
        { label: "Document Number", col: "B" },
        { label: "Document date", col: "C" },
        { label: "GSTIN of ISD", col: "D" },
        { label: "Trade/Legal name", col: "E" },
        { label: "ISD Document type", col: "F" },
        { label: "ISD Document number", col: "G" },
        { label: "ISD Document date", col: "H" },
        { label: "Original Invoice Number", col: "I" },
        { label: "Original invoice date", col: "J" }
    ];

    headers.forEach(h => {
        worksheet.mergeCells(`${h.col}4:${h.col}5`);
        const cell = worksheet.getCell(`${h.col}4`);
        cell.value = h.label;
        cell.fill = blueFill; cell.font = whiteFont; cell.alignment = centerAlign; cell.border = whiteBorder;
    });

    worksheet.mergeCells('K4:N4');
    const taxHeader = worksheet.getCell('K4');
    taxHeader.value = 'Input tax distribution by ISD';
    taxHeader.fill = blueFill; taxHeader.font = whiteFont; taxHeader.alignment = centerAlign; taxHeader.border = whiteBorder;

    const taxes = ["Integrated Tax(₹)", "Central Tax(₹)", "State/UT Tax(₹)", "Cess(₹)"];
    taxes.forEach((t, i) => {
        const cell = worksheet.getRow(5).getCell(11 + i);
        cell.value = t;
        cell.fill = blueFill; cell.font = whiteFont; cell.alignment = centerAlign; cell.border = whiteBorder;
    });

    const lastCols = ["ISD GSTR-6 Period", "ISD GSTR-6 Filing Date", "Eligibility of ITC"];
    lastCols.forEach((label, i) => {
        const colLetter = String.fromCharCode(79 + i);
        worksheet.mergeCells(`${colLetter}4:${colLetter}5`);
        const cell = worksheet.getCell(`${colLetter}4`);
        cell.value = label;
        cell.fill = blueFill; cell.font = whiteFont; cell.alignment = centerAlign; cell.border = whiteBorder;
    });


    // dATA ROWS
    if (data && data.length > 0) {
        data.forEach(item => {
            worksheet.addRow([
                item.origDocType, item.origDocNum, item.origDocDate,
                item.gstin, item.tradeName, item.revDocType, item.revDocNum, item.revDocDate,
                item.revOrigInvNum, item.revOrigInvDate,
                item.igst, item.cgst, item.sgst, item.cess,
                item.period, item.filingDate, item.eligibility
            ]).eachCell(cell => {
                cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
            });
        });
    }
};

export default createISDASheet;