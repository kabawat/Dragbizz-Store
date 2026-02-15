import { COLORS } from "../styles";

const createITCRejectdSheet = (workbook, data) => {
    const worksheet = workbook.addWorksheet('ITC Rejected');

    worksheet.columns = [
        { width: 8 },
        { width: 35 },
        { width: 12 },
        { width: 16 },
        { width: 12 },
        { width: 12 },
        { width: 10 },
        { width: 40 },
    ].map(col => ({ ...col, alignment: { horizontal: "center", vertical: "middle", wrapText: true } }));

    const styles = {
        darkBlueFill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.PRIMARY } },
        lightBlueFill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.LIGHTPRIMARY } },
        lightOrangeFill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.ORNG } },
        darkOrangeFill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C65911' } },
        greyFill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D9D9D9' } },
        whiteText: { color: { argb: 'FFFFFF' }, bold: true },
        border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        }
    };

    worksheet.mergeCells('A1:H1');
    const row1 = worksheet.getRow(1);
    row1.getCell(1).value = 'FORM GSTR-2B';
    row1.getCell(1).fill = styles.darkBlueFill;
    row1.getCell(1).font = { ...styles.whiteText, size: 16 };
    row1.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };


    worksheet.mergeCells('A2:H2');
    const row2 = worksheet.getRow(2);
    row2.getCell(1).value = 'FORM GSTR-2B has been generated on the basis of the information furnished by your suppliers in their respective FORMS GSTR-1/IFF including E-Commerce supplies, GSTR-1A, 5 and 6. It also contains information on imports of goods from the ICEGATE system. This information is for guidance purposes only.';
    row2.getCell(1).fill = styles.lightOrangeFill;
    row2.getCell(1).font = { size: 10, bold: true };
    row2.getCell(1).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    row2.getCell(1).border = styles.border;

    worksheet.mergeCells('A3:H3');
    const row3 = worksheet.getRow(3);
    row3.getCell(1).value = 'FORM SUMMARY - ITC Reversal';
    row3.getCell(1).fill = styles.lightBlueFill;
    row3.getCell(1).font = { ...styles.whiteText, size: 12 };


    const headers = ['S.no.', 'Heading', 'GSTR-3B table', 'Integrated Tax (₹)', 'Central Tax (₹)', 'State/UT Tax (₹)', 'Cess (₹)', 'Advisory'];
    const row4 = worksheet.addRow(headers);
    row4.eachCell((cell) => {
        cell.fill = styles.darkBlueFill;
        cell.font = styles.whiteText;
        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
        cell.border = styles.border;
    });


    worksheet.mergeCells('A5:H5');
    const row5 = worksheet.getRow(5);
    row5.getCell(1).value = 'Credit which may not be availed under FORM GSTR-3B';
    row5.getCell(1).fill = styles.darkOrangeFill;
    row5.getCell(1).font = styles.whiteText;
    row5.getCell(1).border = styles.border;

    const row6 = worksheet.addRow([]);
    worksheet.getCell("A6").value = "Part A";
    worksheet.getCell("A6").fill = styles.lightOrangeFill;
    worksheet.getCell("A6").font = { bold: true };
    worksheet.getCell("A6").alignment = {
        horizontal: "center",
        vertical: "middle",
    };
    worksheet.getCell("A6").border = styles.border;

    worksheet.mergeCells("B6:H6");
    worksheet.getCell("B6").value = "ITC Reversed - Others";
    worksheet.getCell("B6").fill = styles.lightOrangeFill;
    worksheet.getCell("B6").font = { bold: true };
    worksheet.getCell("B6").alignment = {
        horizontal: "left",
        vertical: "middle",
    };
    worksheet.getCell("B6").border = styles.border;

    ["C6", "D6", "E6", "F6", "G6", "H6"].forEach(cell => {
        worksheet.getCell(cell).border = styles.border;
    });


    const row7 = worksheet.addRow([
        'I',
        'ITC Reversal on account of Rule 37A',
        '4(B)(2)',
        data?.totalIntTax || '0.00',
        data?.totalCentTax || '0.00',
        data?.totalStateTax || '0.00',
        data?.totalCess || '0.00',
        'Such credit shall be reversed and has to be reported in table 4(B)(2) of FORM GSTR-3B'
    ]);
    row7.eachCell((cell, colNum) => {
        cell.border = styles.border;
        cell.font = { bold: true };
        cell.alignment = (colNum === 2) ? { horizontal: 'left', vertical: 'middle' } : { horizontal: 'center', vertical: 'middle', wrapText: true };
    });


    const detailItems = [
        ['B2B - Invoices', '0.00', '0.00', '0.00', '0.00'],
        ['B2B - Debit notes', '0.00', '0.00', '0.00', '0.00'],
        ['B2B - Invoices (Amendment)', '0.00', '0.00', '0.00', '0.00'],
        ['B2B - Debit notes (Amendment)', '0.00', '0.00', '0.00', '0.00'],
    ];

    detailItems.forEach((item, index) => {

        const row = worksheet.addRow(['', item[0], '', item[1], item[2], item[3], item[4], '']);
        row.eachCell((cell, colNum) => {
            cell.border = styles.border;
            if (colNum === 2) cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
            if (colNum === 3) cell.fill = styles.greyFill;
            if (colNum > 3 && colNum < 8) cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
        });
    });

    worksheet.mergeCells('A8:A11');
    worksheet.mergeCells("C8:C11");
    worksheet.mergeCells("H8:H11");
    worksheet.getCell("H8").fill = styles.greyFill;
    const detailsLabel = worksheet.getCell('A8');
    detailsLabel.value = 'Details';
    detailsLabel.alignment = { textRotation: 90, vertical: 'middle', horizontal: 'center' };
    detailsLabel.font = { bold: true };
    detailsLabel.border = styles.border;

    const advisoryCell = worksheet.getCell('H7');
    advisoryCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    advisoryCell.border = styles.border;

};

export default createITCRejectdSheet;