import { COLORS } from "../styles";

const createISDRejectedSheet = (workbook, data) => {
    const worksheet = workbook.addWorksheet('ISD(Rejected)');

    worksheet.columns = [
        { key: 'gstinIsd', width: 20 },
        { key: 'tradeName', width: 25 },
        { key: 'docType', width: 15 },
        { key: 'docNum', width: 18 },
        { key: 'docDate', width: 15 },
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
    const whiteFont = { color: { argb: 'FFFFFF' }, bold: true, size: 9 };
    const blackFont = { color: { argb: '000000' }, bold: true };
    const centerAlign = { vertical: 'middle', horizontal: 'center', wrapText: true };
    const whiteBorder = {
        top: { style: 'thin', color: { argb: '000' } },
        left: { style: 'thin', color: { argb: '000' } },
        bottom: { style: 'thin', color: { argb: '000' } },
        right: { style: 'thin', color: { argb: '000' } }
    };

    worksheet.mergeCells('A1:M1');
    const r1 = worksheet.getCell('A1');
    r1.value = 'Goods and Services Tax - GSTR-2B';
    r1.fill = blueFill; r1.font = { ...whiteFont, size: 16 }; r1.alignment = centerAlign;

    worksheet.mergeCells('A2:M2');
    const r2 = worksheet.getCell('A2');
    r2.value = 'ITC Rejected for ISD Credits';
    r2.fill = yellowFill; r2.font = blackFont; r2.alignment = centerAlign;
    r2.border = {
        top: { style: "thin" }, left: { style: "thin" },
        bottom: { style: "thin" }, right: { style: "thin" }
    };

    const vCols = [
        { col: 'A', label: 'GSTIN of ISD' },
        { col: 'B', label: 'Trade/Legal name' },
        { col: 'C', label: 'ISD Document type' },
        { col: 'D', label: 'ISD Document number' },
        { col: 'E', label: 'ISD Document date' },
        { col: 'F', label: 'Original Invoice Number' },
        { col: 'G', label: 'Original invoice date' },
        { col: 'L', label: 'ISD GSTR-6 Period' },
        { col: 'M', label: 'ISD GSTR-6 Filing Date' }
    ];

    vCols.forEach(item => {
        worksheet.mergeCells(`${item.col}3:${item.col}4`);
        const cell = worksheet.getCell(`${item.col}3`);
        cell.value = item.label;
        cell.fill = blueFill; cell.font = whiteFont; cell.alignment = centerAlign; cell.border = whiteBorder;
    });

    worksheet.mergeCells('H3:K3');
    const taxHeader = worksheet.getCell('H3');
    taxHeader.value = 'Input tax distribution by ISD';
    taxHeader.fill = blueFill; taxHeader.font = whiteFont; taxHeader.alignment = centerAlign; taxHeader.border = whiteBorder;

    const taxSub = ["Integrated Tax(₹)", "Central Tax(₹)", "State/UT Tax(₹)", "Cess(₹)"];
    taxSub.forEach((label, i) => {
        const cell = worksheet.getRow(4).getCell(8 + i);
        cell.value = label;
        cell.fill = blueFill; cell.font = whiteFont; cell.alignment = centerAlign; cell.border = whiteBorder;
    });


    if (data && data.length > 0) {
        data.forEach(item => {
            const row = worksheet.addRow([
                item.gstinIsd, item.tradeName, item.docType, item.docNum, item.docDate,
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

export default createISDRejectedSheet;