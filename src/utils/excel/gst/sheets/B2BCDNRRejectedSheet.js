import { COLORS } from "../styles";

const createB2BCDNRRejectedSheet = (workbook, data) => {
    const worksheet = workbook.addWorksheet('B2B-CDNR(Rejected)');

    worksheet.columns = [
        { key: 'gstin', width: 20 },
        { key: 'tradeName', width: 25 },
        { key: 'noteNum', width: 18 },
        { key: 'noteType', width: 15 },
        { key: 'noteSupply', width: 18 },
        { key: 'noteDate', width: 15 },
        { key: 'noteValue', width: 18 },
        { key: 'pos', width: 15 },
        { key: 'taxValue', width: 18 },
        { key: 'igst', width: 15 },
        { key: 'cgst', width: 15 },
        { key: 'sgst', width: 15 },
        { key: 'cess', width: 12 },
        { key: 'remarks', width: 25 },
        { key: 'period', width: 18 },
        { key: 'filingDate', width: 22 },
        { key: 'taxRate', width: 15 },
        { key: 'source', width: 12 },
        { key: 'irn', width: 25 },
        { key: 'irnDate', width: 18 }
    ].map(col => ({ ...col, alignment: { horizontal: "center", vertical: "middle", wrapText: true } }));

    const blueFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.PRIMARY } };
    const yellowFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.SECONDARY } };
    const whiteFont = { color: { argb: 'FFFFFF' }, bold: true, size: 9 };
    const blackFont = { color: { argb: '000000' }, bold: true };
    const centerAlign = { vertical: 'middle', horizontal: 'center', wrapText: true };
    const whiteBorder = {
        top: { style: 'thin', color: { argb: '000' } },
        left: { style: 'thin', color: { argb: '000' } },
        bottom: { style: 'thin', color: { argb: '000' } },
        right: { style: 'thin', color: { argb: '000' } }
    };

    worksheet.mergeCells('A1:T1');
    const r1 = worksheet.getCell('A1');
    r1.value = 'Goods and Services Tax - GSTR-2B';
    r1.fill = blueFill; r1.font = { ...whiteFont, size: 16 }; r1.alignment = centerAlign;

    worksheet.mergeCells('A2:T2');
    const r2 = worksheet.getCell('A2');
    r2.value = 'ITC Rejected for Debit/Credit notes (Original)';
    r2.fill = yellowFill; r2.font = blackFont; r2.alignment = centerAlign;
    r2.border = {
        top: { style: "thin" }, left: { style: "thin" },
        bottom: { style: "thin" }, right: { style: "thin" }
    };

    const vCols = [
        { col: 'A', label: 'GSTIN of supplier' },
        { col: 'B', label: 'Trade/Legal name' },
        { col: 'H', label: 'Place of supply' },
        { col: 'I', label: 'Taxable Value (₹)' },
        { col: 'N', label: 'Remarks' },
        { col: 'O', label: 'GSTR-1/IFF/1A/GSTR-5 Period' },
        { col: 'P', label: 'GSTR-1/IFF/1A/GSTR-5 Filing Date' },
        { col: 'Q', label: 'Applicable % of Tax Rate' },
        { col: 'R', label: 'Source' },
        { col: 'S', label: 'IRN' },
        { col: 'T', label: 'IRN Date' }
    ];

    vCols.forEach(item => {
        worksheet.mergeCells(`${item.col}3:${item.col}4`);
        const cell = worksheet.getCell(`${item.col}3`);
        cell.value = item.label;
        cell.fill = blueFill; cell.font = whiteFont; cell.alignment = centerAlign; cell.border = whiteBorder;
    });


    worksheet.mergeCells('C3:G3');
    const noteHeader = worksheet.getCell('C3');
    noteHeader.value = 'Credit note/Debit note details';
    noteHeader.fill = blueFill; noteHeader.font = whiteFont; noteHeader.alignment = centerAlign; noteHeader.border = whiteBorder;

    const noteSub = ["Note number", "Note type", "Note Supply type", "Note date", "Note Value (₹)"];
    noteSub.forEach((label, i) => {
        const cell = worksheet.getRow(4).getCell(3 + i);
        cell.value = label;
        cell.fill = blueFill; cell.font = whiteFont; cell.alignment = centerAlign; cell.border = whiteBorder;
    });


    worksheet.mergeCells('J3:M3');
    const taxHeader = worksheet.getCell('J3');
    taxHeader.value = 'Tax Amount';
    taxHeader.fill = blueFill; taxHeader.font = whiteFont; taxHeader.alignment = centerAlign; taxHeader.border = whiteBorder;

    const taxSub = ["Integrated Tax(₹)", "Central Tax(₹)", "State/UT Tax(₹)", "Cess(₹)"];
    taxSub.forEach((label, i) => {
        const cell = worksheet.getRow(4).getCell(10 + i);
        cell.value = label;
        cell.fill = blueFill; cell.font = whiteFont; cell.alignment = centerAlign; cell.border = whiteBorder;
    });



    if (data && data.length > 0) {
        data.forEach(item => {
            const row = worksheet.addRow([
                item.gstin, item.tradeName,
                item.noteNum, item.noteType, item.noteSupply, item.noteDate, item.noteValue,
                item.pos, item.taxValue,
                item.igst, item.cgst, item.sgst, item.cess,
                item.remarks, item.period, item.filingDate, item.taxRate, item.source, item.irn, item.irnDate
            ]);
            row.eachCell(cell => {
                cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
            });
        });
    }
};

export default createB2BCDNRRejectedSheet;