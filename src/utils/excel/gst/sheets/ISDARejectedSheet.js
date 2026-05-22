import { COLORS } from "../styles";

const createISDARejectedSheet = (workbook, data) => {
    const worksheet = workbook.addWorksheet('ISDA(Rejected)');

    worksheet.columns = [
        { key: 'origDocType', width: 15 },
        { key: 'origDocNum', width: 18 },
        { key: 'origDocDate', width: 15 },
        { key: 'gstinIsd', width: 20 },
        { key: 'tradeName', width: 25 },
        { key: 'revDocType', width: 15 },
        { key: 'revDocNum', width: 18 },
        { key: 'revDocDate', width: 15 },
        { key: 'origInvNum', width: 18 },
        { key: 'origInvDate', width: 15 },
        { key: 'igst', width: 15 },
        { key: 'cgst', width: 15 },
        { key: 'sgst', width: 15 },
        { key: 'cess', width: 12 },
        { key: 'remarks', width: 25 },
        { key: 'period', width: 18 },
        { key: 'filingDate', width: 22 }
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


    worksheet.mergeCells('A1:P1');
    const r1 = worksheet.getCell('A1');
    r1.value = 'Goods and Services Tax - GSTR-2B';
    r1.fill = blueFill; r1.font = { ...whiteFont, size: 16 }; r1.alignment = centerAlign;

    worksheet.mergeCells('A2:P2');
    const r2 = worksheet.getCell('A2');
    r2.value = 'ITC Rejected for amendments of ISD Credits received';
    r2.fill = yellowFill; r2.font = blackFont; r2.alignment = centerAlign;
    r2.border = {
        top: { style: "thin" }, left: { style: "thin" },
        bottom: { style: "thin" }, right: { style: "thin" }
    };

    worksheet.mergeCells('A3:C3');
    const r3a = worksheet.getCell('A3');
    r3a.value = 'Original Details';
    r3a.fill = yellowFill; r3a.font = blackFont; r3a.alignment = centerAlign;

    worksheet.mergeCells('D3:P3');
    const r3b = worksheet.getCell('D3');
    r3b.value = 'Revised Details';
    r3b.fill = purpleFill; r3b.font = blackFont; r3b.alignment = centerAlign;

    const vCols = [
        { col: 'A', label: 'ISD Document type' },
        { col: 'B', label: 'Document Number' },
        { col: 'C', label: 'Document date' },
        { col: 'D', label: 'GSTIN of ISD' },
        { col: 'E', label: 'Trade/Legal name' },
        { col: 'F', label: 'ISD Document type' },
        { col: 'G', label: 'ISD Document number' },
        { col: 'H', label: 'ISD Document date' },
        { col: 'I', label: 'Original Invoice Number' },
        { col: 'J', label: 'Original Invoice date' },
        { col: 'O', label: 'ISD GSTR-6 Period' },
        { col: 'P', label: 'ISD GSTR-6 Filing Date' },
    ];

    vCols.forEach(item => {
        worksheet.mergeCells(`${item.col}4:${item.col}5`);
        const cell = worksheet.getCell(`${item.col}4`);
        cell.value = item.label;
        cell.fill = blueFill; cell.font = whiteFont; cell.alignment = centerAlign; cell.border = whiteBorder;
    });

    worksheet.mergeCells('K4:N4');
    const taxHeader = worksheet.getCell('K4');
    taxHeader.value = 'Input tax distribution by ISD';
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
                item.origDocType, item.origDocNum, item.origDocDate,
                item.gstinIsd, item.tradeName, item.revDocType, item.revDocNum, item.revDocDate,
                item.origInvNum, item.origInvDate,
                item.igst, item.cgst, item.sgst, item.cess,
                item.remarks, item.period, item.filingDate
            ]);
            row.eachCell(cell => {
                cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
            });
        });
    }
};

export default createISDARejectedSheet;