import { COLORS } from "../styles";

const createB2BCDNRASheet = (workbook, data) => {
    const worksheet = workbook.addWorksheet('B2B-CDNRA');

    worksheet.columns = [
        { key: 'origNoteType', width: 12 },
        { key: 'origNoteNum', width: 18 },
        { key: 'origNoteDate', width: 15 },
        { key: 'gstinSupplier', width: 20 },
        { key: 'tradeName', width: 25 },
        { key: 'revNoteNum', width: 18 },
        { key: 'revNoteType', width: 12 },
        { key: 'revSupplyType', width: 18 },
        { key: 'revNoteDate', width: 15 },
        { key: 'revNoteValue', width: 15 },
        { key: 'pos', width: 15 },
        { key: 'reverseCharge', width: 15 },
        { key: 'taxValue', width: 15 },
        { key: 'igst', width: 12 },
        { key: 'cgst', width: 12 },
        { key: 'sgst', width: 12 },
        { key: 'cess', width: 10 },
        { key: 'itcReduced', width: 20 },
        { key: 'redIgst', width: 12 },
        { key: 'redCgst', width: 12 },
        { key: 'redSgst', width: 12 },
        { key: 'redCess', width: 10 },
        { key: 'period', width: 18 },
        { key: 'filingDate', width: 22 },
        { key: 'itcAvailability', width: 18 },
        { key: 'reason', width: 20 },
        { key: 'taxRate', width: 15 }
    ];

    const blueFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.PRIMARY } };
    const yellowFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.SECONDARY } };
    const purpleFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.SUB2TITLE } };
    const whiteFont = { color: { argb: 'FFFFFF' }, bold: true, size: 8.5 };
    const blackFont = { color: { argb: '000000' }, bold: true };
    const centerAlign = { vertical: 'middle', horizontal: 'center', wrapText: true };
    const whiteBorder = {
        top: { style: 'thin', color: { argb: '000' } },
        left: { style: 'thin', color: { argb: '000' } },
        bottom: { style: 'thin', color: { argb: '000' } },
        right: { style: 'thin', color: { argb: '000' } }
    };

    worksheet.mergeCells('A1:AA1');
    const r1 = worksheet.getCell('A1');
    r1.value = 'Goods and Services Tax - GSTR-2B';
    r1.fill = blueFill; r1.font = { ...whiteFont, size: 16 }; r1.alignment = centerAlign;

    worksheet.mergeCells('A2:AA2');
    const r2 = worksheet.getCell('A2');
    r2.value = 'Amendments to previously filed Credit/Debit notes by supplier';
    r2.fill = yellowFill; r2.font = blackFont; r2.alignment = centerAlign;
    r2.border = {
        top: { style: "thin" }, left: { style: "thin" },
        bottom: { style: "thin" }, right: { style: "thin" }
    };

    worksheet.mergeCells('A3:C3');
    const r3a = worksheet.getCell('A3');
    r3a.value = 'Original Details';
    r3a.fill = yellowFill; r3a.font = blackFont; r3a.alignment = centerAlign;

    worksheet.mergeCells('D3:AA3');
    const r3b = worksheet.getCell('D3');
    r3b.value = 'Revised Details';
    r3b.fill = purpleFill; r3b.font = blackFont; r3b.alignment = centerAlign;

    const vCols = [
        { col: 'A', label: 'Note type' }, { col: 'B', label: 'Note number' }, { col: 'C', label: 'Note date' },
        { col: 'D', label: 'GSTIN of supplier' }, { col: 'E', label: 'Trade/Legal name' },
        { col: 'K', label: 'Place of supply' }, { col: 'L', label: 'Supply Attract Reverse Charge' },
        { col: 'M', label: 'Taxable Value (₹)' },
        { col: 'R', label: "Whether ITC to be reduced (Taxpayer's Input)" },
        { col: 'W', label: 'GSTR-1/IFF/GSTR-5 Period' }, { col: 'X', label: 'GSTR-1/IFF/GSTR-5 Filing Date' },
        { col: 'Y', label: 'ITC Availability' }, { col: 'Z', label: 'Reason' }, { col: 'AA', label: 'Applicable % of Tax Rate' }
    ];

    vCols.forEach(item => {
        worksheet.mergeCells(`${item.col}4:${item.col}5`);
        const cell = worksheet.getCell(`${item.col}4`);
        cell.value = item.label;
        cell.fill = blueFill; cell.font = whiteFont; cell.alignment = centerAlign; cell.border = whiteBorder;
    });

    worksheet.mergeCells('F4:J4');
    const noteH = worksheet.getCell('F4');
    noteH.value = 'Credit note/Debit note details';
    noteH.fill = blueFill; noteH.font = whiteFont; noteH.alignment = centerAlign; noteH.border = whiteBorder;
    ["Note number", "Note type", "Note Supply type", "Note date", "Note Value (₹)"].forEach((l, i) => {
        const c = worksheet.getRow(5).getCell(6 + i);
        c.value = l; c.fill = blueFill; c.font = whiteFont; c.alignment = centerAlign; c.border = whiteBorder;
    });

    worksheet.mergeCells('N4:Q4');
    const taxH = worksheet.getCell('N4');
    taxH.value = 'Tax Amount';
    taxH.fill = blueFill; taxH.font = whiteFont; taxH.alignment = centerAlign; taxH.border = whiteBorder;
    ["Integrated Tax(₹)", "Central Tax(₹)", "State/UT Tax(₹)", "Cess(₹)"].forEach((l, i) => {
        const c = worksheet.getRow(5).getCell(14 + i);
        c.value = l; c.fill = blueFill; c.font = whiteFont; c.alignment = centerAlign; c.border = whiteBorder;
    });

    worksheet.mergeCells('S4:V4');
    const redH = worksheet.getCell('S4');
    redH.value = 'Amount declared by taxpayer for ITC reduction';
    redH.fill = blueFill; redH.font = whiteFont; redH.alignment = centerAlign; redH.border = whiteBorder;
    ["Integrated Tax(₹)", "Central Tax(₹)", "State/UT Tax(₹)", "Cess(₹)"].forEach((l, i) => {
        const c = worksheet.getRow(5).getCell(19 + i);
        c.value = l; c.fill = blueFill; c.font = whiteFont; c.alignment = centerAlign; c.border = whiteBorder;
    });

    worksheet.getRow(4).height = 30;
    worksheet.getRow(5).height = 50;

    if (data && data.length > 0) {
        data.forEach(item => {
            worksheet.addRow([
                item.origNoteType, item.origNoteNum, item.origNoteDate,
                item.gstinSupplier, item.tradeName,
                item.revNoteNum, item.revNoteType, item.revSupplyType, item.revNoteDate, item.revNoteValue,
                item.pos, item.reverseCharge, item.taxValue,
                item.igst, item.cgst, item.sgst, item.cess,
                item.itcReduced, item.redIgst, item.redCgst, item.redSgst, item.redCess,
                item.period, item.filingDate, item.itcAvailability, item.reason, item.taxRate
            ]).eachCell(c => {
                c.alignment = { vertical: 'middle', horizontal: 'left' };
            });
        });
    }
};

export default createB2BCDNRASheet;