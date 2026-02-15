import { COLORS } from "../styles";

const createITCNotAvailableSheet = (workbook, data) => {
    const worksheet = workbook.addWorksheet("ITC Not Available");

    worksheet.columns = [
        { width: 8 },
        { width: 35 },
        { width: 12 },
        { width: 14 },
        { width: 14 },
        { width: 14 },
        { width: 10 },
        { width: 32 },
    ].map(col => ({
        ...col,
        alignment: { horizontal: "center", vertical: "middle", wrapText: true }
    }));

    const styles = {
        darkBlueFill: { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.PRIMARY } },
        lightBlueFill: { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.LIGHTPRIMARY } },
        lightOrangeFill: { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.ORNG } },
        darkOrangeFill: { type: "pattern", pattern: "solid", fgColor: { argb: "C65911" } },
        greyFill: { type: "pattern", pattern: "solid", fgColor: { argb: "D9D9D9" } },
        whiteText: { color: { argb: "FFFFFF" }, bold: true },
        border: {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        },
    };

    // ✅ SAME HEIGHT FUNCTION
    const autoHeight = (row, height = 20) => {
        row.height = height;
    };

    worksheet.mergeCells("A1:H1");
    const r1 = worksheet.getRow(1);
    r1.getCell(1).value = "FORM GSTR-2B";
    r1.getCell(1).fill = styles.darkBlueFill;
    r1.getCell(1).font = { ...styles.whiteText, size: 16 };
    r1.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
    autoHeight(r1, 24);

    worksheet.mergeCells("A2:H2");
    const r2 = worksheet.getRow(2);
    r2.getCell(1).value =
        "FORM GSTR-2B has been generated on the basis of the information furnished by your suppliers in their respective FORMS GSTR-1/IFF including E-Commerce supplies, GSTR-1A, 5 and 6. It also contains information on imports of goods from the ICEGATE system. This information is for guidance purposes only.";
    r2.getCell(1).fill = styles.lightOrangeFill;
    r2.getCell(1).font = { bold: true, size: 10 };
    r2.getCell(1).alignment = { wrapText: true, horizontal: "center", vertical: "middle" };
    r2.getCell(1).border = styles.border;
    autoHeight(r2, 40);

    worksheet.mergeCells("A3:H3");
    worksheet.getCell("A3").value = "FORM SUMMARY - ITC Not Available";
    worksheet.getCell("A3").fill = styles.lightBlueFill;
    worksheet.getCell("A3").font = styles.whiteText;
    autoHeight(worksheet.getRow(3), 20);

    const headerRow = worksheet.addRow([
        "S.no.",
        "Heading",
        "GSTR-3B table",
        "Integrated Tax (₹)",
        "Central Tax (₹)",
        "State/UT Tax (₹)",
        "Cess (₹)",
        "Advisory",
    ]);

    headerRow.eachCell(cell => {
        cell.fill = styles.darkBlueFill;
        cell.font = styles.whiteText;
        cell.border = styles.border;
        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    });
    autoHeight(headerRow, 40);

    worksheet.mergeCells("A5:H5");
    worksheet.getCell("A5").value = "Credit which may not be availed under FORM GSTR-3B";
    worksheet.getCell("A5").fill = styles.darkOrangeFill;
    worksheet.getCell("A5").font = styles.whiteText;
    worksheet.getCell("A5").border = styles.border;
    autoHeight(worksheet.getRow(5), 20);

    worksheet.mergeCells("B6:H6");
    worksheet.getCell("A6").value = "Part A";
    worksheet.getCell("A6").fill = styles.lightOrangeFill;
    worksheet.getCell("A6").font = { bold: true };
    worksheet.getCell("A6").alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getCell("A6").border = styles.border;

    worksheet.getCell("B6").value = "ITC Not Available";
    worksheet.getCell("B6").fill = styles.lightOrangeFill;
    worksheet.getCell("B6").font = { bold: true };
    worksheet.getCell("B6").border = styles.border;

    ["C6", "D6", "E6", "F6", "G6", "H6"].forEach(c => {
        worksheet.getCell(c).border = styles.border;
    });

    autoHeight(worksheet.getRow(6), 20);

    const addMainRow = (rowData, height = 50) => {
        const r = worksheet.addRow(rowData);
        r.eachCell((cell, col) => {
            cell.border = styles.border;
            cell.font = { bold: col === 2 || col === 3 };
            cell.alignment = {
                horizontal: col === 2 ? "left" : "center",
                vertical: "middle",
                wrapText: true
            };
        });
        autoHeight(r, height);
    };

    const addDetailRow = label => {
        const r = worksheet.addRow(["", label, "", "0.00", "0.00", "0.00", "0.00", ""]);
        r.eachCell((cell, col) => {
            cell.border = styles.border;
            if (col === 2) cell.alignment = { horizontal: "left", vertical: "middle", wrapText: true };
            if (col === 3) cell.fill = styles.greyFill;
        });
    };

    const mergeDetailsBlock = (start, end) => {
        worksheet.mergeCells(`A${start}:A${end}`);
        worksheet.mergeCells(`C${start}:C${end}`);
        worksheet.mergeCells(`H${start}:H${end}`);

        const d = worksheet.getCell(`A${start}`);
        d.value = "Details";
        d.font = { bold: true };
        d.alignment = { textRotation: 90, horizontal: "center", vertical: "middle" };
        d.border = styles.border;
    };

    const ineligible = data?.gstr3b?.section4D2 || {};

    let s = worksheet.lastRow.number + 1;

    addMainRow([
        "I",
        "All other ITC - Supplies from registered persons other than reverse charge",
        "4(D)(2)",
        ineligible.igst || "0.00",
        ineligible.cgst || "0.00",
        ineligible.sgst || "0.00",
        ineligible.cess || "0.00",
        "Such credit shall not be taken and has to be reported in table 4(D)(2) of FORM GSTR-3B.",
    ], 60);

    [
        "B2B - Invoices",
        "B2B - Debit notes",
        "ECO - Documents",
        "B2B - Invoices (Amendment)",
        "B2B - Debit notes (Amendment)",
        "ECO - Documents (Amendment)",
    ].forEach(addDetailRow);

    mergeDetailsBlock(s + 1, worksheet.lastRow.number);

    s = worksheet.lastRow.number + 1;

    addMainRow([
        "II",
        "Inward Supplies from ISD",
        "4(D)(2)",
        "0.00",
        "0.00",
        "0.00",
        "0.00",
        "Such credit shall not be taken and has to be reported in table 4(D)(2) of FORM GSTR-3B.",
    ], 60);

    ["ISD - Invoices", "ISD - Invoices (Amendment)"].forEach(addDetailRow);
    mergeDetailsBlock(s + 1, worksheet.lastRow.number);

    s = worksheet.lastRow.number + 1;

    addMainRow([
        "III",
        "Inward Supplies liable for reverse charge",
        "3.1(d)\n4(D)(2)",
        "0.00",
        "0.00",
        "0.00",
        "0.00",
        "These supplies shall be declared in Table 3.1(d) of FORM GSTR-3B for payment of tax. However, credit will not be available on the same and has to be reported in table 4(D)(2) of FORM GSTR-3B.",
    ], 80);

    [
        "B2B - Invoices",
        "B2B - Debit notes",
        "B2B - Invoices (Amendment)",
        "B2B - Debit notes (Amendment)",
    ].forEach(addDetailRow);

    mergeDetailsBlock(s + 1, worksheet.lastRow.number);

    worksheet.addRow([]);
    worksheet.mergeCells(`A${worksheet.lastRow.number}:H${worksheet.lastRow.number}`);
    worksheet.getCell(`A${worksheet.lastRow.number}`).value =
        "Part B   ITC Not Available - Credit notes should be net off against relevant ITC available headings in GSTR-3B";
    worksheet.getCell(`A${worksheet.lastRow.number}`).fill = styles.lightOrangeFill;
    worksheet.getCell(`A${worksheet.lastRow.number}`).font = { bold: true };
    worksheet.getCell(`A${worksheet.lastRow.number}`).border = styles.border;
    autoHeight(worksheet.getRow(worksheet.lastRow.number), 25);

    // ✅ ADD RECORDS IF PROVIDED
    if (data?.ineligible && data.ineligible.length > 0) {
        worksheet.addRow([]); // Gap
        const recordHeader = worksheet.addRow(["Detailed Ineligible Records"]);
        recordHeader.getCell(1).font = { bold: true };

        data.ineligible.forEach(item => {
            const row = worksheet.addRow([
                "", item.tradeName, item.billNumber, item.billDate, item.igst, item.cgst, item.sgst, "Ineligible"
            ]);
            row.eachCell(cell => {
                cell.border = styles.border;
                cell.alignment = { horizontal: "center", vertical: "middle" };
            });
        });
    }
};

export default createITCNotAvailableSheet;