import { COLORS } from "../styles";
const createIMPGSEZSheet = (workbook, data) => {
    const worksheet = workbook.addWorksheet('IMPGSEZ');

    worksheet.columns = [
        { key: 'gstin', width: 20 },
        { key: 'tradeName', width: 25 },
        { key: 'icegateDate', width: 22 },
        { key: 'portCode', width: 12 },
        { key: 'boeNumber', width: 18 },
        { key: 'boeDate', width: 15 },
        { key: 'taxableValue', width: 18 },
        { key: 'igst', width: 18 },
        { key: 'cess', width: 12 },
        { key: 'isAmended', width: 15 }
    ].map(col => ({ ...col, alignment: { horizontal: "center", vertical: "middle", wrapText: true } }));

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

    worksheet.mergeCells('A1:J1');
    const r1 = worksheet.getCell('A1');
    r1.value = 'Goods and Services Tax - GSTR-2B';
    r1.fill = blueFill;
    r1.font = { ...whiteFont, size: 16 };
    r1.alignment = centerAlign;

    worksheet.mergeCells('A2:J2');
    const r2 = worksheet.getCell('A2');
    r2.value = 'Import of goods from SEZ units/developers on bill of entry';
    r2.fill = yellowFill;
    r2.font = blackFont;
    r2.alignment = centerAlign;
    r2.border = {
        top: { style: "thin" }, left: { style: "thin" },
        bottom: { style: "thin" }, right: { style: "thin" }
    };

    const vMerged = [
        { cell: 'A3', label: 'GSTIN of supplier' },
        { cell: 'B3', label: 'Trade/Legal name' },
        { cell: 'C3', label: 'Icegate Reference Date' },
        { cell: 'D3', label: 'Port Code' },
        { cell: 'J3', label: 'Amended (Yes)' }
    ];

    vMerged.forEach(item => {
        const col = item.cell.substring(0, 1);
        worksheet.mergeCells(`${col}3:${col}4`);
        const cell = worksheet.getCell(item.cell);
        cell.value = item.label;
        cell.fill = blueFill; cell.font = whiteFont; cell.alignment = centerAlign; cell.border = whiteBorder;
    });

    worksheet.mergeCells('E3:G3');
    const boeHeader = worksheet.getCell('E3');
    boeHeader.value = 'Bill of Entry Details';
    boeHeader.fill = blueFill; boeHeader.font = whiteFont; boeHeader.alignment = centerAlign; boeHeader.border = whiteBorder;

    const boeSub = [
        { col: 5, label: 'Number' },
        { col: 6, label: 'Date' },
        { col: 7, label: 'Taxable Value' }
    ];
    boeSub.forEach(s => {
        const cell = worksheet.getRow(4).getCell(s.col);
        cell.value = s.label;
        cell.fill = blueFill; cell.font = whiteFont; cell.alignment = centerAlign; cell.border = whiteBorder;
    });

    worksheet.mergeCells('H3:I3');
    const taxHeader = worksheet.getCell('H3');
    taxHeader.value = 'Amount of tax (₹)';
    taxHeader.fill = blueFill; taxHeader.font = whiteFont; taxHeader.alignment = centerAlign; taxHeader.border = whiteBorder;

    const taxSub = [
        { col: 8, label: 'Integrated Tax(₹)' },
        { col: 9, label: 'Cess(₹)' }
    ];
    taxSub.forEach(s => {
        const cell = worksheet.getRow(4).getCell(s.col);
        cell.value = s.label;
        cell.fill = blueFill; cell.font = whiteFont; cell.alignment = centerAlign; cell.border = whiteBorder;
    });


    // Data Roww
    if (data && data.length > 0) {
        data.forEach(item => {
            const row = worksheet.addRow([
                item.gstin,
                item.tradeName,
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
                cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
            });
        });
    }
};

export default createIMPGSEZSheet;