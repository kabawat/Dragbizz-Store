import { COLORS } from "../styles";

const createECOSheet = (workbook, data) => {
    const worksheet = workbook.addWorksheet('ECO');

    worksheet.columns = [
        { key: 'gstinEco', width: 20 },
        { key: 'tradeName', width: 25 },
        { key: 'docNum', width: 18 },
        { key: 'docType', width: 15 },
        { key: 'docDate', width: 15 },
        { key: 'docValue', width: 18 },
        { key: 'pos', width: 15 },
        { key: 'taxValue', width: 18 },
        { key: 'igst', width: 15 },
        { key: 'cgst', width: 15 },
        { key: 'sgst', width: 15 },
        { key: 'cess', width: 12 },
        { key: 'period', width: 18 },
        { key: 'filingDate', width: 22 },
        { key: 'itcAvailability', width: 18 },
        { key: 'reason', width: 25 },
        { key: 'source', width: 12 },
        { key: 'irn', width: 25 },
        { key: 'irnDate', width: 18 }
    ];

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

    worksheet.mergeCells('A1:S1');
    const r1 = worksheet.getCell('A1');
    r1.value = 'Goods and Services Tax - GSTR-2B';
    r1.fill = blueFill; r1.font = { ...whiteFont, size: 16 }; r1.alignment = centerAlign;
    worksheet.getRow(1).height = 40;

    worksheet.mergeCells('A2:S2');
    const r2 = worksheet.getCell('A2');
    r2.value = 'Documents reported by ECO on which ECO is liable to pay tax u/s 9(5)';
    r2.fill = yellowFill; r2.font = blackFont; r2.alignment = centerAlign;
    r2.border = {
        top: { style: "thin" }, left: { style: "thin" },
        bottom: { style: "thin" }, right: { style: "thin" }
    };
    worksheet.getRow(2).height = 25;

    const vCols = [
        { col: 'A', label: 'GSTIN of ECO' },
        { col: 'B', label: 'Trade/Legal name' },
        { col: 'G', label: 'Place of supply' },
        { col: 'H', label: 'Taxable value (₹)' },
        { col: 'M', label: 'GSTR-1/1A/IFF period' },
        { col: 'N', label: 'GSTR-1/1A/IFF filing date' },
        { col: 'O', label: 'ITC availability' },
        { col: 'P', label: 'Reason' },
        { col: 'Q', label: 'Source' },
        { col: 'R', label: 'IRN' },
        { col: 'S', label: 'IRN Date' }
    ];

    vCols.forEach(item => {
        worksheet.mergeCells(`${item.col}3:${item.col}4`);
        const cell = worksheet.getCell(`${item.col}3`);
        cell.value = item.label;
        cell.fill = blueFill; cell.font = whiteFont; cell.alignment = centerAlign; cell.border = whiteBorder;
    });

    worksheet.mergeCells('C3:F3');
    const docHeader = worksheet.getCell('C3');
    docHeader.value = 'Document details';
    docHeader.fill = blueFill; docHeader.font = whiteFont; docHeader.alignment = centerAlign; docHeader.border = whiteBorder;

    const docSub = ["Document number", "Document type", "Document date", "Document value(₹)"];
    docSub.forEach((label, i) => {
        const cell = worksheet.getRow(4).getCell(3 + i);
        cell.value = label;
        cell.fill = blueFill; cell.font = whiteFont; cell.alignment = centerAlign; cell.border = whiteBorder;
    });

    worksheet.mergeCells('I3:L3');
    const taxHeader = worksheet.getCell('I3');
    taxHeader.value = 'Tax amount';
    taxHeader.fill = blueFill; taxHeader.font = whiteFont; taxHeader.alignment = centerAlign; taxHeader.border = whiteBorder;

    const taxSub = ["Integrated Tax(₹)", "Central Tax(₹)", "State/UT Tax(₹)", "Cess(₹)"];
    taxSub.forEach((label, i) => {
        const cell = worksheet.getRow(4).getCell(9 + i);
        cell.value = label;
        cell.fill = blueFill; cell.font = whiteFont; cell.alignment = centerAlign; cell.border = whiteBorder;
    });

    worksheet.getRow(3).height = 25;
    worksheet.getRow(4).height = 40;


    if (data && data.length > 0) {
        data.forEach(item => {
            const row = worksheet.addRow([
                item.gstinEco, item.tradeName,
                item.docNum, item.docType, item.docDate, item.docValue,
                item.pos, item.taxValue,
                item.igst, item.cgst, item.sgst, item.cess,
                item.period, item.filingDate, item.itcAvailability, item.reason,
                item.source, item.irn, item.irnDate
            ]);
            row.eachCell(cell => {
                cell.alignment = { vertical: 'middle', horizontal: 'left' };
            });
        });
    }
};

export default createECOSheet;