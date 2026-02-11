import { COLORS } from "../styles";

const createB2BAITCRSheet = (workbook, data) => {
    const worksheet = workbook.addWorksheet('B2BA (ITC Reversal)');

    worksheet.columns = [
        { key: 'origInvNum', width: 18 },
        { key: 'origInvDate', width: 15 },
        { key: 'gstin', width: 20 },
        { key: 'tradeName', width: 25 },
        { key: 'revInvNum', width: 18 },
        { key: 'revInvType', width: 15 },
        { key: 'revInvDate', width: 15 },
        { key: 'revInvValue', width: 18 },
        { key: 'pos', width: 15 },
        { key: 'revCharge', width: 20 },
        { key: 'taxValue', width: 18 },
        { key: 'igst', width: 15 },
        { key: 'cgst', width: 15 },
        { key: 'sgst', width: 15 },
        { key: 'cess', width: 12 },
        { key: 'period', width: 18 },
        { key: 'filingDate', width: 22 },
        { key: 'itcAvailability', width: 18 },
        { key: 'reason', width: 25 },
        { key: 'taxRate', width: 15 }
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

    worksheet.mergeCells('A1:T1');
    const r1 = worksheet.getCell('A1');
    r1.value = 'Goods and Services Tax - GSTR-2B';
    r1.fill = blueFill; r1.font = { ...whiteFont, size: 16 }; r1.alignment = centerAlign;
    worksheet.getRow(1).height = 40;

    worksheet.mergeCells('A2:T2');
    const r2 = worksheet.getCell('A2');
    r2.value = 'Amendments to previously filed Invoices by supplier (ITC reversal)';
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
    r3a.border = { right: { style: 'thin', color: { argb: '000000' } } };

    worksheet.mergeCells('C3:T3');
    const r3b = worksheet.getCell('C3');
    r3b.value = 'Revised Details';
    r3b.fill = purpleFill; r3b.font = blackFont; r3b.alignment = centerAlign;

    const vMergedCols = [
        { col: 'A', label: 'Invoice number' },
        { col: 'B', label: 'Invoice Date' },
        { col: 'C', label: 'GSTIN of supplier' },
        { col: 'D', label: 'Trade/Legal name' },
        { col: 'I', label: 'Place of supply' },
        { col: 'J', label: 'Supply Attract Reverse Charge' },
        { col: 'K', label: 'Taxable Value (₹)' },
        { col: 'P', label: 'GSTR-1/IFF/1A Period' },
        { col: 'Q', label: 'GSTR-1/IFF/1A Filing Date' },
        { col: 'R', label: 'ITC Availability' },
        { col: 'S', label: 'Reason' },
        { col: 'T', label: 'Applicable % of Tax Rate' }
    ];

    vMergedCols.forEach(item => {
        worksheet.mergeCells(`${item.col}4:${item.col}5`);
        const cell = worksheet.getCell(`${item.col}4`);
        cell.value = item.label;
        cell.fill = blueFill; cell.font = whiteFont; cell.alignment = centerAlign; cell.border = whiteBorder;
    });

    worksheet.mergeCells('E4:H4');
    const invHeader = worksheet.getCell('E4');
    invHeader.value = 'Invoice Details';
    invHeader.fill = blueFill; invHeader.font = whiteFont; invHeader.alignment = centerAlign; invHeader.border = whiteBorder;

    const invSub = ["Invoice number", "Invoice type", "Invoice Date", "Invoice Value(₹)"];
    invSub.forEach((label, i) => {
        const cell = worksheet.getRow(5).getCell(5 + i);
        cell.value = label;
        cell.fill = blueFill; cell.font = whiteFont; cell.alignment = centerAlign; cell.border = whiteBorder;
    });

    worksheet.mergeCells('L4:O4');
    const taxHeader = worksheet.getCell('L4');
    taxHeader.value = 'Tax Amount';
    taxHeader.fill = blueFill; taxHeader.font = whiteFont; taxHeader.alignment = centerAlign; taxHeader.border = whiteBorder;

    const taxSub = ["Integrated Tax(₹)", "Central Tax(₹)", "State/UT Tax(₹)", "Cess(₹)"];
    taxSub.forEach((label, i) => {
        const cell = worksheet.getRow(5).getCell(12 + i);
        cell.value = label;
        cell.fill = blueFill; cell.font = whiteFont; cell.alignment = centerAlign; cell.border = whiteBorder;
    });

    worksheet.getRow(4).height = 25;
    worksheet.getRow(5).height = 35;


    if (data && data.length > 0) {
        data.forEach(item => {
            const row = worksheet.addRow([
                item.origInvNum, item.origInvDate,
                item.gstin, item.tradeName, item.revInvNum, item.revInvType, item.revInvDate, item.revInvValue,
                item.pos, item.revCharge, item.taxValue,
                item.igst, item.cgst, item.sgst, item.cess,
                item.period, item.filingDate, item.itcAvailability, item.reason, item.taxRate
            ]);
            row.eachCell(cell => {
                cell.alignment = { vertical: 'middle', horizontal: 'left' };
            });
        });
    }
};

export default createB2BAITCRSheet;