import { COLORS } from "../styles";

const createB2BCDNRARejectedSheet = (workbook, data) => {
    const worksheet = workbook.addWorksheet('B2B-CDNRA(Rejected)');

    worksheet.columns = [
        { key: 'origNoteType', width: 12 },
        { key: 'origNoteNum', width: 18 },
        { key: 'origNoteDate', width: 15 },
        { key: 'gstin', width: 20 },
        { key: 'tradeName', width: 25 },
        { key: 'revNoteNum', width: 18 },
        { key: 'revNoteType', width: 15 },
        { key: 'revNoteSupply', width: 18 },
        { key: 'revNoteDate', width: 15 },
        { key: 'revNoteValue', width: 18 },
        { key: 'pos', width: 15 },
        { key: 'taxValue', width: 18 },
        { key: 'igst', width: 15 },
        { key: 'cgst', width: 15 },
        { key: 'sgst', width: 15 },
        { key: 'cess', width: 12 },
        { key: 'remarks', width: 25 },
        { key: 'period', width: 18 },
        { key: 'filingDate', width: 22 },
        { key: 'taxRate', width: 15 }
    ].map(col => ({ ...col, alignment: { horizontal: "center", vertical: "middle", wrapText: true } }));

    const blueFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.PRIMARY } };
    const yellowFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.SECONDARY } };
    const purpleFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.SUB2TITLE } };
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
    r2.value = 'ITC Rejected for amendments to previously filed Credit/Debit notes by supplier';
    r2.fill = yellowFill; r2.font = blackFont; r2.alignment = centerAlign;
    r2.border = {
        top: { style: "thin" }, left: { style: "thin" },
        bottom: { style: "thin" }, right: { style: "thin" }
    };

    worksheet.mergeCells('A3:C3');
    const r3a = worksheet.getCell('A3');
    r3a.value = 'Original Details';
    r3a.fill = yellowFill; r3a.font = blackFont; r3a.alignment = centerAlign;

    worksheet.mergeCells('D3:T3');
    const r3b = worksheet.getCell('D3');
    r3b.value = 'Revised Details';
    r3b.fill = purpleFill; r3b.font = blackFont; r3b.alignment = centerAlign;

    const vCols = [
        { col: 'A', label: 'Note type' },
        { col: 'B', label: 'Note number' },
        { col: 'C', label: 'Note date' },
        { col: 'D', label: 'GSTIN of supplier' },
        { col: 'E', label: 'Trade/Legal name' },
        { col: 'K', label: 'Place of supply' },
        { col: 'L', label: 'Taxable Value (₹)' },
        { col: 'Q', label: 'Remarks' },
        { col: 'R', label: 'GSTR-1/IFF/1A/GSTR-5 Period' },
        { col: 'S', label: 'GSTR-1/IFF/1A/GSTR-5 Filing Date' },
        { col: 'T', label: 'Applicable % of Tax Rate' }
    ];

    vCols.forEach(item => {
        worksheet.mergeCells(`${item.col}4:${item.col}5`);
        const cell = worksheet.getCell(`${item.col}4`);
        cell.value = item.label;
        cell.fill = blueFill; cell.font = whiteFont; cell.alignment = centerAlign; cell.border = whiteBorder;
    });

    worksheet.mergeCells('F4:J4');
    const noteHeader = worksheet.getCell('F4');
    noteHeader.value = 'Credit note/Debit note details';
    noteHeader.fill = blueFill; noteHeader.font = whiteFont; noteHeader.alignment = centerAlign; noteHeader.border = whiteBorder;

    const noteSub = ["Note number", "Note type", "Note Supply type", "Note date", "Note Value (₹)"];
    noteSub.forEach((label, i) => {
        const cell = worksheet.getRow(5).getCell(6 + i);
        cell.value = label;
        cell.fill = blueFill; cell.font = whiteFont; cell.alignment = centerAlign; cell.border = whiteBorder;
    });


    worksheet.mergeCells('M4:P4');
    const taxHeader = worksheet.getCell('M4');
    taxHeader.value = 'Tax Amount';
    taxHeader.fill = blueFill; taxHeader.font = whiteFont; taxHeader.alignment = centerAlign; taxHeader.border = whiteBorder;

    const taxSub = ["Integrated Tax(₹)", "Central Tax(₹)", "State/UT Tax(₹)", "Cess(₹)"];
    taxSub.forEach((label, i) => {
        const cell = worksheet.getRow(5).getCell(13 + i);
        cell.value = label;
        cell.fill = blueFill; cell.font = whiteFont; cell.alignment = centerAlign; cell.border = whiteBorder;
    });



    if (data && data.length > 0) {
        data.forEach(item => {
            const row = worksheet.addRow([
                item.origNoteType, item.origNoteNum, item.origNoteDate,
                item.gstin, item.tradeName, item.revNoteNum, item.revNoteType, item.revNoteSupply, item.revNoteDate, item.revNoteValue,
                item.pos, item.taxValue,
                item.igst, item.cgst, item.sgst, item.cess,
                item.remarks, item.period, item.filingDate, item.taxRate
            ]);
            row.eachCell(cell => {
                cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
            });
        });
    }
};

export default createB2BCDNRARejectedSheet;