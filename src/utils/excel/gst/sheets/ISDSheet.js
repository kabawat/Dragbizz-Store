import { COLORS } from "../styles";

const createISDSheet = (workbook, data) => {
    const worksheet = workbook.addWorksheet('ISD');

    worksheet.columns = [
        { header: 'GSTIN of ISD', key: 'gstin', width: 22 },
        { header: 'Trade/Legal name', key: 'tradeName', width: 25 },
        { header: 'ISD Document type', key: 'docType', width: 18 },
        { header: 'ISD Document number', key: 'docNum', width: 20 },
        { header: 'ISD Document date', key: 'docDate', width: 18 },
        { header: 'Original Invoice Number', key: 'origInvNum', width: 22 },
        { header: 'Original invoice date', key: 'origInvDate', width: 18 },
        { header: 'Integrated Tax(₹)', key: 'igst', width: 18 },
        { header: 'Central Tax(₹)', key: 'cgst', width: 18 },
        { header: 'State/UT Tax(₹)', key: 'sgst', width: 18 },
        { header: 'Cess(₹)', key: 'cess', width: 15 },
        { header: 'ISD GSTR-6 Period', key: 'period', width: 18 },
        { header: 'ISD GSTR-6 Filing Date', key: 'filingDate', width: 22 },
        { header: 'Eligibility of ITC', key: 'eligibility', width: 18 },
    ];

    const blueFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.PRIMARY } };
    const yellowFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.SECONDARY } };
    const whiteFont = { color: { argb: COLORS.WHITE }, bold: true, size: 10 };
    const blackFont = { color: { argb: '000000' }, bold: true };
    const centerAlign = { vertical: 'middle', horizontal: 'center', wrapText: true };
    const whiteBorder = {
        top: { style: 'thin', color: { argb: '000' } },
        left: { style: 'thin', color: { argb: '000' } },
        bottom: { style: 'thin', color: { argb: '000' } },
        right: { style: 'thin', color: { argb: '000' } }
    };

    worksheet.mergeCells('A1:N1');
    const mainHeader = worksheet.getCell('A1');
    mainHeader.value = 'Goods and Services Tax - GSTR-2B';
    mainHeader.fill = blueFill;
    mainHeader.font = { ...whiteFont, size: 16 };
    mainHeader.alignment = centerAlign;
    worksheet.getRow(1).height = 45;

    worksheet.mergeCells('A2:N2');
    const subHeader = worksheet.getCell('A2');
    subHeader.value = 'ISD Credits';
    subHeader.fill = yellowFill;
    subHeader.font = blackFont;
    subHeader.alignment = centerAlign;
    worksheet.getRow(2).height = 25;

    const headerLabels = [
        "GSTIN of ISD", "Trade/Legal name", "ISD Document type",
        "ISD Document number", "ISD Document date", "Original Invoice Number",
        "Original invoice date"
    ];

    headerLabels.forEach((label, index) => {
        const colLetter = String.fromCharCode(65 + index);
        worksheet.mergeCells(`${colLetter}3:${colLetter}4`);
        const cell = worksheet.getCell(`${colLetter}3`);
        cell.value = label;
        cell.fill = blueFill;
        cell.font = whiteFont;
        cell.alignment = centerAlign;
        cell.border = whiteBorder;
    });

    // Input Tax Distribution Group (H to K)
    worksheet.mergeCells('H3:K3');
    const distHeader = worksheet.getCell('H3');
    distHeader.value = 'Input tax distribution by ISD';
    distHeader.fill = blueFill;
    distHeader.font = whiteFont;
    distHeader.alignment = centerAlign;
    distHeader.border = whiteBorder;

    const subHeaders = ["Integrated Tax(₹)", "Central Tax(₹)", "State/UT Tax(₹)", "Cess(₹)"];
    subHeaders.forEach((h, i) => {
        const cell = worksheet.getRow(4).getCell(8 + i);
        cell.value = h;
        cell.fill = blueFill;
        cell.font = whiteFont;
        cell.alignment = centerAlign;
        cell.border = whiteBorder;
    });

    // Vertically merged headers (L to N)
    const lastLabels = ["ISD GSTR-6 Period", "ISD GSTR-6 Filing Date", "Eligibility of ITC"];
    lastLabels.forEach((label, index) => {
        const colLetter = ['L', 'M', 'N'][index];
        worksheet.mergeCells(`${colLetter}3:${colLetter}4`);
        const cell = worksheet.getCell(`${colLetter}3`);
        cell.value = label;
        cell.fill = blueFill;
        cell.font = whiteFont;
        cell.alignment = centerAlign;
        cell.border = whiteBorder;
    });

    worksheet.getRow(3).height = 25;
    worksheet.getRow(4).height = 35;

    // --- ADD DATA ROWS ---
    if (data && data.length > 0) {
        data.forEach((item) => {
            const row = worksheet.addRow([
                item.gstin, item.tradeName, item.docType, item.docNum, item.docDate,
                item.origInvNum, item.origInvDate, item.igst, item.cgst, item.sgst,
                item.cess, item.period, item.filingDate, item.eligibility
            ]);
        });
    }
};

export default createISDSheet;