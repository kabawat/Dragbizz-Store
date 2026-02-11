import { COLORS } from "../styles";

const createB2BITCReversalSheet = (workbook, data) => {
    const worksheet = workbook.addWorksheet('B2B (ITC Reversal)');

    worksheet.columns = [
        { key: 'gstin', width: 20 },
        { key: 'tradeName', width: 25 },
        { key: 'invNum', width: 18 },
        { key: 'invType', width: 15 },
        { key: 'invDate', width: 15 },
        { key: 'invValue', width: 18 },
        { key: 'pos', width: 15 },
        { key: 'revCharge', width: 15 },
        { key: 'taxValue', width: 18 },
        { key: 'igst', width: 15 },
        { key: 'cgst', width: 15 },
        { key: 'sgst', width: 15 },
        { key: 'cess', width: 12 },
        { key: 'period', width: 18 },
        { key: 'filingDate', width: 22 },
        { key: 'itcAvailability', width: 18 },
        { key: 'reason', width: 25 },
        { key: 'taxRate', width: 15 },
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

    worksheet.mergeCells('A1:U1');
    const r1 = worksheet.getCell('A1');
    r1.value = 'Goods and Services Tax - GSTR-2B';
    r1.fill = blueFill; r1.font = { ...whiteFont, size: 16 }; r1.alignment = centerAlign;
    worksheet.getRow(1).height = 40;

    worksheet.mergeCells('A2:U2');
    const r2 = worksheet.getCell('A2');
    r2.value = 'ITC Reversed - Others';
    r2.fill = yellowFill; r2.font = blackFont; r2.alignment = centerAlign;
    r2.border = {
        top: { style: "thin" }, left: { style: "thin" },
        bottom: { style: "thin" }, right: { style: "thin" }
    };
    worksheet.getRow(2).height = 25;

    const vMergedCols = [
        { col: 'A', label: 'GSTIN of supplier' },
        { col: 'B', label: 'Trade/Legal name' },
        { col: 'G', label: 'Place of supply' },
        { col: 'H', label: 'Supply Attract Reverse Charge' },
        { col: 'I', label: 'Taxable Value (₹)' },
        { col: 'N', label: 'GSTR-1/IFF/1A Period' },
        { col: 'O', label: 'GSTR-1/IFF/1A Filing Date' },
        { col: 'P', label: 'ITC Availability' },
        { col: 'Q', label: 'Reason' },
        { col: 'R', label: 'Applicable % of Tax Rate' },
        { col: 'S', label: 'Source' },
        { col: 'T', label: 'IRN' },
        { col: 'U', label: 'IRN Date' }
    ];

    vMergedCols.forEach(item => {
        worksheet.mergeCells(`${item.col}3:${item.col}4`);
        const cell = worksheet.getCell(`${item.col}3`);
        cell.value = item.label;
        cell.fill = blueFill; cell.font = whiteFont; cell.alignment = centerAlign; cell.border = whiteBorder;
    });

    worksheet.mergeCells('C3:F3');
    const invHeader = worksheet.getCell('C3');
    invHeader.value = 'Invoice Details';
    invHeader.fill = blueFill; invHeader.font = whiteFont; invHeader.alignment = centerAlign; invHeader.border = whiteBorder;

    const invSub = ["Invoice number", "Invoice type", "Invoice Date", "Invoice Value(₹)"];
    invSub.forEach((label, i) => {
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

    worksheet.getRow(3).height = 25;
    worksheet.getRow(4).height = 35;

    if (data && data.length > 0) {
        data.forEach(item => {
            const row = worksheet.addRow([
                item.gstin, item.tradeName, item.invNum, item.invType, item.invDate, item.invValue,
                item.pos, item.revCharge, item.taxValue, item.igst, item.cgst, item.sgst, item.cess,
                item.period, item.filingDate, item.itcAvailability, item.reason, item.taxRate,
                item.source, item.irn, item.irnDate
            ]);
            row.eachCell(cell => {
                cell.alignment = { vertical: 'middle', horizontal: 'left' };
            });
        });
    }
};

export default createB2BITCReversalSheet;