import { COLORS } from "../styles";

const createECOASheet = (workbook, data) => {
    const worksheet = workbook.addWorksheet('ECOA');

    worksheet.columns = [
        { key: 'origDocNum', width: 18 },
        { key: 'origDocDate', width: 15 },
        { key: 'gstinEco', width: 20 },
        { key: 'tradeName', width: 25 },
        { key: 'revDocNum', width: 18 },
        { key: 'revDocType', width: 15 },
        { key: 'revDocDate', width: 15 },
        { key: 'revDocValue', width: 18 },
        { key: 'pos', width: 15 },
        { key: 'taxValue', width: 18 },
        { key: 'igst', width: 15 },
        { key: 'cgst', width: 15 },
        { key: 'sgst', width: 15 },
        { key: 'cess', width: 12 },
        { key: 'itcReduced', width: 20 },
        { key: 'redIgst', width: 15 },
        { key: 'redCgst', width: 15 },
        { key: 'redSgst', width: 15 },
        { key: 'redCess', width: 12 },
        { key: 'period', width: 18 },
        { key: 'filingDate', width: 22 },
        { key: 'itcAvailability', width: 18 },
        { key: 'reason', width: 25 }
    ];

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


    worksheet.mergeCells('A1:W1');
    const r1 = worksheet.getCell('A1');
    r1.value = 'Goods and Services Tax - GSTR-2B';
    r1.fill = blueFill; r1.font = { ...whiteFont, size: 16 }; r1.alignment = centerAlign;
    worksheet.getRow(1).height = 40;


    worksheet.mergeCells('A2:W2');
    const r2 = worksheet.getCell('A2');
    r2.value = 'Amendments to documents reported by ECO on which ECO is liable to pay tax u/s 9(5)';
    r2.fill = yellowFill; r2.font = blackFont; r2.alignment = centerAlign;
    r2.border = {
        top: { style: "thin" }, left: { style: "thin" },
        bottom: { style: "thin" }, right: { style: "thin" }
    };
    worksheet.getRow(2).height = 25;

    worksheet.mergeCells('A3:B3');
    const r3a = worksheet.getCell('A3');
    r3a.value = 'Original Details';
    r3a.fill = yellowFill; r3a.font = blackFont; r3a.alignment = centerAlign;

    worksheet.mergeCells('C3:W3');
    const r3b = worksheet.getCell('C3');
    r3b.value = 'Revised Details';
    r3b.fill = purpleFill; r3b.font = blackFont; r3b.alignment = centerAlign;


    const vCols = [
        { col: 'A', label: 'Document number' }, { col: 'B', label: 'Document date' },
        { col: 'C', label: 'GSTIN of ECO' }, { col: 'D', label: 'Trade/Legal name' },
        { col: 'I', label: 'Place of supply' }, { col: 'J', label: 'Taxable value (₹)' },
        { col: 'O', label: "Whether ITC to be reduced (Taxpayer's Input)" },
        { col: 'T', label: 'GSTR-1/1A/IFF period' }, { col: 'U', label: 'GSTR-1/1A/IFF filing date' },
        { col: 'V', label: 'ITC availability' }, { col: 'W', label: 'Reason' }
    ];

    vCols.forEach(item => {
        worksheet.mergeCells(`${item.col}4:${item.col}5`);
        const cell = worksheet.getCell(`${item.col}4`);
        cell.value = item.label;
        cell.fill = blueFill; cell.font = whiteFont; cell.alignment = centerAlign; cell.border = whiteBorder;
    });

    worksheet.mergeCells('E4:H4');
    const docH = worksheet.getCell('E4');
    docH.value = 'Document details';
    docH.fill = blueFill; docH.font = whiteFont; docH.alignment = centerAlign; docH.border = whiteBorder;
    ["Document number", "Document type", "Document date", "Document value(₹)"].forEach((l, i) => {
        const c = worksheet.getRow(5).getCell(5 + i);
        c.value = l; c.fill = blueFill; c.font = whiteFont; c.alignment = centerAlign; c.border = whiteBorder;
    });


    worksheet.mergeCells('K4:N4');
    const taxH = worksheet.getCell('K4');
    taxH.value = 'Tax amount';
    taxH.fill = blueFill; taxH.font = whiteFont; taxH.alignment = centerAlign; taxH.border = whiteBorder;
    ["Integrated Tax(₹)", "Central Tax(₹)", "State/UT Tax(₹)", "Cess(₹)"].forEach((l, i) => {
        const c = worksheet.getRow(5).getCell(11 + i);
        c.value = l; c.fill = blueFill; c.font = whiteFont; c.alignment = centerAlign; c.border = whiteBorder;
    });

    worksheet.mergeCells('P4:S4');
    const redH = worksheet.getCell('P4');
    redH.value = 'Amount declared by taxpayer for ITC reduction';
    redH.fill = blueFill; redH.font = whiteFont; redH.alignment = centerAlign; redH.border = whiteBorder;
    ["Integrated Tax(₹)", "Central Tax(₹)", "State/UT Tax(₹)", "Cess(₹)"].forEach((l, i) => {
        const c = worksheet.getRow(5).getCell(16 + i);
        c.value = l; c.fill = blueFill; c.font = whiteFont; c.alignment = centerAlign; c.border = whiteBorder;
    });

    worksheet.getRow(4).height = 30;
    worksheet.getRow(5).height = 45;

    if (data && data.length > 0) {
        data.forEach(item => {
            const row = worksheet.addRow([
                item.origDocNum, item.origDocDate, item.gstinEco, item.tradeName,
                item.revDocNum, item.revDocType, item.revDocDate, item.revDocValue,
                item.pos, item.taxValue, item.igst, item.cgst, item.sgst, item.cess,
                item.itcReduced, item.redIgst, item.redCgst, item.redSgst, item.redCess,
                item.period, item.filingDate, item.itcAvailability, item.reason
            ]);
            row.eachCell(c => {
                c.alignment = { vertical: 'middle', horizontal: 'left' };
            });
        });
    }
};

export default createECOASheet;