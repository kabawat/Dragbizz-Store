import { COLORS } from "../styles";

const createIMPGSheet = (workbook, data) => {
    const worksheet = workbook.addWorksheet('IMPG');

    worksheet.columns = [
        { key: 'icegateDate', width: 22 },
        { key: 'portCode', width: 15 },
        { key: 'boeNumber', width: 18 },
        { key: 'boeDate', width: 18 },
        { key: 'taxableValue', width: 20 },
        { key: 'igst', width: 20 },
        { key: 'cess', width: 15 },
        { key: 'isAmended', width: 18 }
    ];
    const blueFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.PRIMARY } };
    const yellowFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.SECONDARY } };
    const whiteFont = { color: { argb: 'FFFFFF' }, bold: true, size: 10 };
    const blackFont = { color: { argb: '000000' }, bold: true };
    const centerAlign = { vertical: 'middle', horizontal: 'center', wrapText: true };
    const whiteBorder = {
        top: { style: 'thin', color: { argb: '000' } },
        left: { style: 'thin', color: { argb: '000' } },
        bottom: { style: 'thin', color: { argb: '000' } },
        right: { style: 'thin', color: { argb: '000' } }
    };

    worksheet.mergeCells('A1:H1');
    const r1 = worksheet.getCell('A1');
    r1.value = 'Goods and Services Tax - GSTR-2B';
    r1.fill = blueFill;
    r1.font = { ...whiteFont, size: 16 };
    r1.alignment = centerAlign;
    worksheet.getRow(1).height = 40;

    worksheet.mergeCells('A2:H2');
    const r2 = worksheet.getCell('A2');
    r2.value = 'Import of goods from overseas on bill of entry';
    r2.fill = yellowFill;
    r2.font = blackFont;
    r2.alignment = centerAlign;
    r2.border = {
        top: { style: "thin" }, left: { style: "thin" },
        bottom: { style: "thin" }, right: { style: "thin" }
    };
    worksheet.getRow(2).height = 25;
    const vMerged = [
        { cell: 'A3', label: 'Icegate Reference Date' },
        { cell: 'B3', label: 'Port Code' },
        { cell: 'H3', label: 'Amended (Yes)' }
    ];

    vMerged.forEach(item => {
        const col = item.cell.substring(0, 1);
        worksheet.mergeCells(`${col}3:${col}4`);
        const cell = worksheet.getCell(item.cell);
        cell.value = item.label;
        cell.fill = blueFill; cell.font = whiteFont; cell.alignment = centerAlign; cell.border = whiteBorder;
    });

    worksheet.mergeCells('C3:E3');
    const boeHeader = worksheet.getCell('C3');
    boeHeader.value = 'Bill of Entry Details';
    boeHeader.fill = blueFill; boeHeader.font = whiteFont; boeHeader.alignment = centerAlign; boeHeader.border = whiteBorder;

    const boeSub = [
        { col: 3, label: 'Number' },
        { col: 4, label: 'Date' },
        { col: 5, label: 'Taxable Value' }
    ];
    boeSub.forEach(s => {
        const cell = worksheet.getRow(4).getCell(s.col);
        cell.value = s.label;
        cell.fill = blueFill; cell.font = whiteFont; cell.alignment = centerAlign; cell.border = whiteBorder;
    });

    worksheet.mergeCells('F3:G3');
    const taxHeader = worksheet.getCell('F3');
    taxHeader.value = 'Amount of tax (₹)';
    taxHeader.fill = blueFill; taxHeader.font = whiteFont; taxHeader.alignment = centerAlign; taxHeader.border = whiteBorder;

    const taxSub = [
        { col: 6, label: 'Integrated Tax(₹)' },
        { col: 7, label: 'Cess(₹)' }
    ];
    taxSub.forEach(s => {
        const cell = worksheet.getRow(4).getCell(s.col);
        cell.value = s.label;
        cell.fill = blueFill; cell.font = whiteFont; cell.alignment = centerAlign; cell.border = whiteBorder;
    });

    worksheet.getRow(3).height = 25;
    worksheet.getRow(4).height = 30;

    if (data && data.length > 0) {
        data.forEach(item => {
            const row = worksheet.addRow([
                item.icegateDate,
                item.portCode,
                item.boeNumber,
                item.boeDate,
                item.taxableValue,
                item.igst,
                item.cess,
                item.isAmended
            ]);
            row.eachCell(cell => {
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
            });
        });
    }
};

export default createIMPGSheet;