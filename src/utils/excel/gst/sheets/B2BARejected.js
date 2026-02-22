import { COLORS } from "../styles";

const createB2BARejectedSheet = (workbook, data) => {
    const worksheet = workbook.addWorksheet('B2BA(Rejected)');

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


    worksheet.mergeCells('A1:R1');
    const r1 = worksheet.getCell('A1');
    r1.value = 'Goods and Services Tax - GSTR-2B';
    r1.fill = blueFill; r1.font = { ...whiteFont, size: 16 }; r1.alignment = centerAlign;


    worksheet.mergeCells('A2:R2');
    const r2 = worksheet.getCell('A2');
    r2.value = 'ITC Rejected for amendments to previously filed Invoices by supplier';
    r2.fill = yellowFill; r2.font = blackFont; r2.alignment = centerAlign;
    r2.border = {
        top: { style: "thin" }, left: { style: "thin" },
        bottom: { style: "thin" }, right: { style: "thin" }
    };


    worksheet.mergeCells('A3:B3');
    const r3a = worksheet.getCell('A3');
    r3a.value = 'Original Details';
    r3a.fill = yellowFill; r3a.font = blackFont; r3a.alignment = centerAlign;

    worksheet.mergeCells('C3:R3');
    const r3b = worksheet.getCell('C3');
    r3b.value = 'Revised Details';
    r3b.fill = purpleFill; r3b.font = blackFont; r3b.alignment = centerAlign;

    const vCols = [
        { col: 'A', label: 'Invoice number' },
        { col: 'B', label: 'Invoice Date' },
        { col: 'C', label: 'GSTIN of supplier' },
        { col: 'D', label: 'Trade/Legal name' },
        { col: 'I', label: 'Place of supply' },
        { col: 'J', label: 'Taxable Value (₹)' },
        { col: 'O', label: 'Remarks' },
        { col: 'P', label: 'GSTR-1/IFF/1A/GSTR-5 Period' },
        { col: 'Q', label: 'GSTR-1/IFF/1A/GSTR-5 Filing Date' },
        { col: 'R', label: 'Applicable % of Tax Rate' },
    ];

    vCols.forEach(item => {
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

    worksheet.mergeCells('K4:N4');
    const taxHeader = worksheet.getCell('K4');
    taxHeader.value = 'Tax Amount';
    taxHeader.fill = blueFill; taxHeader.font = whiteFont; taxHeader.alignment = centerAlign; taxHeader.border = whiteBorder;

    const taxSub = ["Integrated Tax(₹)", "Central Tax(₹)", "State/UT Tax(₹)", "Cess(₹)"];
    taxSub.forEach((label, i) => {
        const cell = worksheet.getRow(5).getCell(11 + i);
        cell.value = label;
        cell.fill = blueFill; cell.font = whiteFont; cell.alignment = centerAlign; cell.border = whiteBorder;
    });



    if (data && data.length > 0) {
        data.forEach(item => {
            const row = worksheet.addRow([
                item.origInvNum, item.origInvDate,
                item.gstin, item.tradeName, item.revInvNum, item.revInvType, item.revInvDate, item.revInvValue,
                item.pos, item.taxValue, item.igst, item.cgst, item.sgst, item.cess,
                item.remarks, item.period, item.filingDate, item.taxRate, item.source, item.irn, item.irnDate
            ]);
            row.eachCell(cell => {
                cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
            });
        });
    }
};

export default createB2BARejectedSheet;