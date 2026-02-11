import { COLORS } from "../styles";

const createITCAvailableSheet = (workbook, data) => {
  const worksheet = workbook.addWorksheet("ITC Available");

  worksheet.columns = [
    { width: 8 },
    { width: 35 },
    { width: 12 },
    { width: 14 },
    { width: 14 },
    { width: 14 },
    { width: 10 },
    { width: 32 },
  ];

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

  worksheet.mergeCells("A1:H1");
  const r1 = worksheet.getRow(1);
  r1.height = 30;
  r1.getCell(1).value = "FORM GSTR-2B";
  r1.getCell(1).fill = styles.darkBlueFill;
  r1.getCell(1).font = { ...styles.whiteText, size: 16 };
  r1.getCell(1).alignment = { horizontal: "center", vertical: "middle" };

  worksheet.mergeCells("A2:H2");
  const r2 = worksheet.getRow(2);
  r2.height = 60;
  r2.getCell(1).value =
    "FORM GSTR-2B has been generated on the basis of the information furnished by your suppliers in their respective FORMS GSTR-1/IFF including E-Commerce supplies, GSTR-1A, 5 and 6. It also contains information on imports of goods from the ICEGATE system. This information is for guidance purposes only.";
  r2.getCell(1).fill = styles.lightOrangeFill;
  r2.getCell(1).font = { bold: true, size: 10 };
  r2.getCell(1).alignment = { wrapText: true, horizontal: "center", vertical: "middle" };
  r2.getCell(1).border = styles.border;

  worksheet.mergeCells("A3:H3");
  worksheet.getCell("A3").value = "FORM SUMMARY - ITC Available";
  worksheet.getCell("A3").fill = styles.lightBlueFill;
  worksheet.getCell("A3").font = styles.whiteText;

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
  headerRow.height = 30;
  headerRow.eachCell(cell => {
    cell.fill = styles.darkBlueFill;
    cell.font = styles.whiteText;
    cell.border = styles.border;
    cell.alignment = { wrapText: true, horizontal: "center", vertical: "middle" };
  });

  worksheet.mergeCells("A5:H5");
  worksheet.getCell("A5").value = "Credit which may be availed under FORM GSTR-3B";
  worksheet.getCell("A5").fill = styles.darkOrangeFill;
  worksheet.getCell("A5").font = styles.whiteText;
  worksheet.getCell("A5").border = styles.border;

  worksheet.mergeCells("B6:H6");
  worksheet.getCell("A6").value = "Part A";
  worksheet.getCell("A6").fill = styles.lightOrangeFill;
  worksheet.getCell("A6").font = { bold: true };
  worksheet.getCell("A6").alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getCell("A6").border = styles.border;

  worksheet.getCell("B6").value =
    "ITC Available - Credit may be claimed in relevant headings in GSTR-3B";
  worksheet.getCell("B6").fill = styles.lightOrangeFill;
  worksheet.getCell("B6").font = { bold: true };
  worksheet.getCell("B6").border = styles.border;

  ["C6", "D6", "E6", "F6", "G6", "H6"].forEach(c => {
    worksheet.getCell(c).border = styles.border;
  });

  const addMainRow = rowData => {
    const r = worksheet.addRow(rowData);
    r.height = 35;
    r.eachCell((cell, col) => {
      cell.border = styles.border;
      cell.font = { bold: col === 2 || col === 3 };
      cell.alignment = {
        wrapText: true,
        horizontal: col === 2 ? "left" : "center",
        vertical: "middle",
      };
    });
  };

  const addDetailRow = label => {
    const r = worksheet.addRow(["", label, "", "0.00", "0.00", "0.00", "0.00", ""]);
    r.eachCell((cell, col) => {
      cell.border = styles.border;
      if (col === 2) cell.alignment = { horizontal: "left", vertical: "middle" };
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

    worksheet.getCell(`C${start}`).fill = styles.greyFill;
    worksheet.getCell(`H${start}`).fill = styles.greyFill;
  };

  let s = worksheet.lastRow.number + 1;
  addMainRow([
    "I",
    "All other ITC - Supplies from registered persons other than reverse charge (IMS)",
    "4(A)(5)",
    data?.totalIntTax || "0.00",
    data?.totalCentTax || "0.00",
    data?.totalStateTax || "0.00",
    data?.totalCess || "0.00",
    "Net input tax credit may be availed under Table 4(A)(5) of FORM GSTR-3B.",
  ]);
  [
    "B2B - Invoices (IMS)",
    "B2B - Debit notes (IMS)",
    "B2B - Invoices (Amendment) (IMS)",
    "B2B - Debit notes (Amendment) (IMS)",
  ].forEach(addDetailRow);
  mergeDetailsBlock(s + 1, worksheet.lastRow.number);

  s = worksheet.lastRow.number + 1;
  addMainRow([
    "II",
    "Inward Supplies from ISD",
    "4(A)(4)",
    "0.00",
    "0.00",
    "0.00",
    "0.00",
    "Net input tax credit may be availed under Table 4(A)(4) of FORM GSTR-3B.",
  ]);
  ["ISD - Invoices", "ISD - Invoices (Amendment)"].forEach(addDetailRow);
  mergeDetailsBlock(s + 1, worksheet.lastRow.number);

  s = worksheet.lastRow.number + 1;
  addMainRow([
    "III",
    "Inward Supplies liable for reverse charge",
    "3.1(d)\n4(A)(3)",
    "0.00",
    "0.00",
    "0.00",
    "0.00",
    "These supplies shall be declared in Table 3.1(d) of FORM GSTR-3B for payment of tax. Net input tax credit may be availed under Table 4(A)(3) of FORM GSTR-3B on payment of tax.",
  ]);
  [
    "B2B - Invoices",
    "B2B - Debit notes",
    "B2B - Invoices (Amendment)",
    "B2B - Debit notes (Amendment)",
  ].forEach(addDetailRow);
  mergeDetailsBlock(s + 1, worksheet.lastRow.number);
};

export default createITCAvailableSheet;